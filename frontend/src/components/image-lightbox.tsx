"use client";

import Image from "next/image";
import type {GeneratedImage} from "~/app/(dashboard)/dashboard/create/page";
import type {ImageProject} from "~/app/(dashboard)/dashboard/projects/page";
import {useEffect} from "react";
import {Button} from "~/components/ui/button";
import { X } from "lucide-react";


interface ImageLightboxProps {
  image: GeneratedImage | ImageProject | null;
  onClose: () => void;
  onDownload?: (img: GeneratedImage | ImageProject) => void;
}

function getS3Key(image: GeneratedImage | ImageProject): string {
  return "s3_key" in image ? image.s3_key : image.s3Key;
}

function getPrompt(image: GeneratedImage | ImageProject): string {
  return image.prompt;
}

export function ImageLightbox({ image, onClose }: ImageLightboxProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (image) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [image]);

  if (!image) return null;

  const s3Key = getS3Key(image);
  const prompt = getPrompt(image);

  return (
      // Backdrop - click outside to close
      <div
        className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm'
        onClick={onClose}
      >
        {/*Modal - stop propagation so clicking inside doesn't close*/}
        <div
          className='relative w-full max-w-3xl overflow-hidden rounded-2xl bg-gray-50 shadow-2xl'
          onClick={(e) => e.stopPropagation()}
        >
          {/*Close button*/}
          <Button
              variant='ghost'
              size='sm'
              className='absolute top-2 right-2 z-10 h-8 w-8 p-0 bg-black/40 text-white hover:bg-black/60 hover:text-white rounded-full'
              onClick={onClose}
          >
            <X className='h-4 w-4'/>
          </Button>

          {/*Image*/}
          <div className='relative aspect-square w-full'>
            <Image
              src={`/api/images/${s3Key}`}
              alt={prompt}
              fill
              unoptimized
              className='object-contain'
              priority
            />
          </div>
        </div>
      </div>
  );
}