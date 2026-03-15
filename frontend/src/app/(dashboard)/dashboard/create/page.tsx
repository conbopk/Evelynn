"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {RedirectToSignIn, SignedIn} from "@daveyplate/better-auth-ui";
import ImageSettings from "~/components/image-settings";
import {generateImage as generationImageAction, getUserImageProjects} from "~/actions/text-to-image";
import {Loader2} from "lucide-react";
import PromptInput from "~/components/prompt-input";
import {getDownloadUrl} from "~/actions/download-image";
import ImageHistory from "~/components/image-history";
import {authClient} from "~/lib/auth-client";


export interface GeneratedImage {
  s3_key: string;
  // viewUrl: string;
  prompt: string;
  negativePrompt?: string | null;
  width: number;
  height: number;
  numInferenceSteps: number;
  guidanceScale: number;
  seed: number;
  modelId: string;
  timestamp: Date;
}

export default function CreatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [numInferenceSteps, setNumInferenceSteps] = useState(9);
  const [guidanceScale, setGuidanceScale] = useState(0);
  const [seed, setSeed] = useState("");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);


  useEffect(() => {
    const initializeData = async () => {
      try {
        // Run all data fetching in parallel for faster loading
        const [, projectsResult] = await Promise.all([
            authClient.getSession(),
            getUserImageProjects(),
        ]);

        // Load image projects
        if (projectsResult.success && projectsResult.imageProjects) {
          const mappedProjects = projectsResult.imageProjects.map(
              (project) => ({
                s3_key: project.s3Key,
                prompt: project.prompt,
                negativePrompt: project.negativePrompt,
                width: project.width,
                height: project.height,
                numInferenceSteps: project.numInferenceSteps,
                guidanceScale: project.guidanceScale,
                seed: project.seed,
                modelId: project.modelId,
                timestamp: new Date(project.createdAt),
              }),
          );
          setGeneratedImages(mappedProjects);
        }

        setIsLoading(false);
      } catch (e) {
        console.error("Error initializing data:", e);
        setIsLoading(false);
      }
    };

    void initializeData();
  }, []);

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generationImageAction({
        prompt,
        negative_prompt: negativePrompt.trim() ? negativePrompt.trim() : undefined,
        width: width,
        height: height,
        num_inference_steps: numInferenceSteps,
        guidance_scale: guidanceScale,
        seed: seed.trim() ? parseInt(seed, 10) : undefined,
      });

      if (!result.success || !result.s3_key) {
        throw new Error(result.error ?? "Generation failed");
      }

      router.refresh();

      const newImage: GeneratedImage = {
        s3_key: result.s3_key,
        // viewUrl: result.viewUrl,
        prompt: prompt,
        negativePrompt: negativePrompt.trim() ? negativePrompt.trim() : null,
        width: width,
        height: height,
        numInferenceSteps: numInferenceSteps,
        guidanceScale: guidanceScale,
        seed: result.seed ?? (seed.trim() ? parseInt(seed, 10) : 0),
        modelId: result.modelId ?? "Tongyi-MAI/Z-Image-Turbo",
        timestamp: new Date(),
      };

      setCurrentImage(newImage);
      setGeneratedImages([newImage, ...generatedImages].slice(0, 20));

      toast.success("Image generated successfully!");
    } catch (e) {
      console.error("Generation error:", e);
      const errorMessage = e instanceof Error ? e.message : "Failed to generate image";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (img: GeneratedImage) => {
    try {
      const result = await getDownloadUrl(img.s3_key);

      if (!result.success || !result.url) {
        toast.error(result.error ?? "Failed to get download link");
        return;
      }

      const link = document.createElement("a");
      link.href = result.url;
      link.download = result.filename ?? "generated-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      toast.error("Download failed");
    }
  };

  if (isLoading) {
    return (
        <div className='flex min-h-[400px] items-center justify-center mt-24'>
          <Loader2 className='h-8 w-8 animate-spin'/>
        </div>
    );
  }

  return (
      <>
        <RedirectToSignIn />
        <SignedIn>
          <div className='min-h-screen'>
            {/*Top Navbar*/}
            <div className='border-b border-b-gray-200 bg-white py-2'>
              <div className='mx-auto max-w-7xl text-center'>
                <h1 className='from-primary to-primary/70 mb-1 bg-gradient-to-r bg-clip-text text-lg font-bold text-transparent'>
                  Text-to-Image Generator
                </h1>
                <p className='text-muted-foreground mx-auto max-w-xl text-xs'>
                  Generate images from text prompts
                </p>
              </div>
            </div>

            {/*Main Content Area*/}
            <div className='mx-auto max-w-7xl px-2 py-4 sm:px-4 sm:py-6'>
              <div className='grid grid-cols-1 gap-2 sm:gap-4 lg:grid-cols-3'>
                {/*Left Side - Controls (1/3 width)*/}
                <div className='order-2 space-y-2 sm:space-y-3 lg:order-1 lg:col-span-1'>
                  <ImageSettings
                      prompt={prompt}
                      width={width}
                      setWidth={setWidth}
                      height={height}
                      setHeight={setHeight}
                      numInferenceSteps={numInferenceSteps}
                      setNumInferenceSteps={setNumInferenceSteps}
                      guidanceScale={guidanceScale}
                      setGuidanceScale={setGuidanceScale}
                      seed={seed}
                      setSeed={setSeed}
                      isGenerating={isGenerating}
                      onGenerate={generateImage}
                  />
                </div>

                {/*Right Side - Text Input & Preview (2/3 width)*/}
                <div className='order-1 space-y-2 sm:space-y-3 lg:order-2 lg:col-span-2'>
                  <PromptInput
                    prompt={prompt}
                    setPrompt={setPrompt}
                    negativePrompt={negativePrompt}
                    setNegativePrompt={setNegativePrompt}
                    currentImage={currentImage}
                    onDownload={downloadImage}
                  />
                </div>
              </div>
            </div>

            {/*History Section*/}
            <ImageHistory
              generatedImages={generatedImages}
              onDownload={downloadImage}
            />
          </div>
        </SignedIn>
      </>
  );
}