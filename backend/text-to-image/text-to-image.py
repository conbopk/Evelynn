import modal
import os
import uuid
import tempfile
from pydantic import BaseModel
import random

app = modal.App("evelynn-ai-image-generator")

# Turbo-only
MODEL_ID = "Tongyi-MAI/Z-Image-Turbo"

MODAL_SECRET = modal.Secret.from_name("evelynn-ai-image-generator")
VOL = modal.Volume.from_name("evelynn-model-hf-hub-cache", create_if_missing=True)


image = (
    modal.Image.debian_slim(python_version="3.12.10")
    .apt_install("git")
    .run_commands("pip install --upgrade pip")
    .pip_install_from_requirements("requirements.txt")
    .env({
        "HF_XET_HIGH_PERFORMANCE": "1",
        "HF_HUB_CACHE": "/models"
    })
)


class Req(BaseModel):
    prompt: str
    negative_prompt: str | None = None
    width: int = 1024
    height: int = 1024
    num_inference_steps: int | None = None
    guidance_scale: float | None = None
    seed: int | None = None


@app.cls(
    image=image,
    gpu="L40S",
    timeout=600,
    scaledown_window=600,
    volumes={"/models": VOL},
    secrets=[MODAL_SECRET]
)
class ZImageServer:
    @modal.enter()
    def load(self):
        import torch
        from diffusers import ZImagePipeline

        self.token = (
            os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_HUB_TOKEN") or ""
        ).strip().strip("\"'") or None

        self.pipe = ZImagePipeline.from_pretrained(
            MODEL_ID,
            torch_dtype=torch.bfloat16,
            low_cpu_mem_usage=False,
            token=self.token,
        ).to("cuda")

        VOL.commit()

        assert self.pipe is not None, "Pipeline failed to load!"
        print(f"[load] Pipeline ready: {MODEL_ID}")

    @modal.fastapi_endpoint(method="POST", docs=True, requires_proxy_auth=True)
    def generate_image(self, req: Req):
        import boto3
        import torch

        if self.pipe is None:
            raise RuntimeError("Pipeline not loaded - check modal logs for @enter errors")

        pipe = self.pipe

        seed = int(req.seed) if req.seed is not None else random.randint(0, 2**32 - 1)
        gen = torch.Generator("cuda").manual_seed(seed)

        steps = int(req.num_inference_steps) if req.num_inference_steps is not None else 9
        scale = float(req.guidance_scale) if req.guidance_scale is not None else 0.0

        print(f"[generate] prompt='{req.prompt}' seed={seed} steps={steps} scale={scale}")

        img = pipe(
            prompt=req.prompt,
            height=int(req.height),
            width=int(req.width),
            num_inference_steps=steps,
            guidance_scale=scale,
            generator=gen,
            negative_prompt=req.negative_prompt,
        ).images[0]

        bucket = os.getenv("AWS_S3_BUCKET_NAME")
        key = f"images/{uuid.uuid4()}.png"

        with tempfile.TemporaryDirectory(prefix="zimg_") as d:
            path = os.path.join(d, "out.png")
            img.save(path)
            s3 = boto3.client("s3")
            s3.upload_file(path, bucket, key, ExtraArgs={"ContentType": "image/png"})

        url = f"https://{bucket}.s3.amazonaws.com/{key}"
        print(f"[generate] Uploaded -> {url}")

        return {
            "image_s3_key": key,
            "image_url": url,
            "seed": seed,
            "model_id": MODEL_ID
        }


@app.local_entrypoint()
def main(
    prompt: str = "a dragon flying over mountains, epic fantasy, 8k",
    negative_prompt: str = "",
    width: int = 1024,
    height: int = 1024,
    steps: int = 9,
    scale: float = 0.0,
    seed: int = -1,
):
    import requests
    from dotenv import load_dotenv

    load_dotenv()

    modal_key = os.getenv("MODAL_KEY_ID")
    modal_secret = os.getenv("MODAL_SECRET_KEY")

    if not modal_key or not modal_secret:
        raise ValueError("MODAL_KEY_ID or MODAL_SECRET_KEY is not set in .env")

    server = ZImageServer()
    endpoint_url = server.generate_image.get_web_url()

    headers = {
        "Content-Type": "application/json",
        "Modal-Key": modal_key,
        "Modal-Secret": modal_secret,
    }

    payload = {
        "prompt": prompt,
        "negative_prompt": negative_prompt or None,
        "width": width,
        "height": height,
        "num_inference_steps": steps,
        "guidance_scale": scale,
        "seed": seed if seed >= 0 else None,
    }

    print(f"\nSending request to: {endpoint_url}")
    print(f"    prompt      : {prompt}")
    print(f"    size        : {width}x{height}")
    print(f"    steps/scale : {steps} / {scale}")
    print(f"    seed        : {'random' if seed < 0 else seed}\n")

    response = requests.post(endpoint_url, json=payload, headers=headers, timeout=300)

    if response.status_code != 200:
        print(f"Error {response.status_code}: {response.text}")
        return

    result = response.json()

    print(f"Done!")
    print(f"    seed    : {result['seed']}")
    print(f"    s3 key  : {result['image_s3_key']}")
    print(f"    url     : {result['image_url']}")