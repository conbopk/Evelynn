"use client";

import Image from "next/image";
import {Download, Expand, ImageIcon } from "lucide-react";
import type {GeneratedImage} from "~/app/(dashboard)/dashboard/create/page";
import {Button} from "~/components/ui/button";
import {useState} from "react";
import { ImageLightbox } from "./image-lightbox";

interface ImageHistoryProps {
  generatedImages: GeneratedImage[];
  onDownload: (img: GeneratedImage) => void;
}

export default function ImageHistory({ generatedImages, onDownload }: ImageHistoryProps) {
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);

  return (
      <>
        <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)}/>

        <div className='border-t border-border bg-background px-2 py-3 sm:px-4 sm:py-4'>
          <div className='mx-auto max-w-7xl'>

            {/* Section header */}
            <div className='mb-6 text-center'>
              <div className='mb-2 inline-flex items-center gap-2'>
                <div className='h-6 w-0.5 rounded-full bg-gradient-to-b from-primary to-accent'/>
                <h2 className='bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent'>
                  Recent Generations
                </h2>
                <div className='h-6 w-0.5 rounded-full bg-gradient-to-b from-accent to-primary'/>
              </div>
              <p className='mx-auto max-w-md text-sm text-muted-foreground'>
                Your image generation history
              </p>
            </div>

            {generatedImages.length > 0 ? (
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                  {generatedImages.map((img, index) => (
                      <div
                          key={`${img.seed}_${index}`}
                          className='group relative overflow-hidden rounded-xl border-2 border-border bg-card p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-primary/10 hover:shadow-xl'
                      >
                        {/* Card header */}
                        <div className='mb-3 flex items-start justify-between'>
                          <div className='flex items-center gap-2'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent'>
                              <ImageIcon className='h-4 w-4 text-white'/>
                            </div>
                            <p className='text-xs text-muted-foreground'>
                              {new Date(img.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>

                        {/* Image */}
                        <div
                            className='relative mb-3 aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg bg-muted/30'
                            onClick={() => setLightboxImage(img)}
                        >
                          <Image
                              src={`/api/images/${img.s3_key}`}
                              alt={img.prompt}
                              fill
                              unoptimized
                              className='object-contain'
                          />
                          {/* Hover overlay */}
                          <div className='absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/20'>
                            <Expand className='h-6 w-6 text-white opacity-0 drop-shadow-lg transition-opacity duration-200 group-hover:opacity-100'/>
                          </div>
                        </div>

                        {/* Prompt */}
                        <p className='mb-3 line-clamp-2 text-xs text-muted-foreground hover:line-clamp-none'>
                          {img.prompt}
                        </p>

                        {/* Actions */}
                        <div className='flex gap-2'>
                          <Button
                              onClick={() => setLightboxImage(img)}
                              variant="outline"
                              size='sm'
                              className='h-7 flex-1 cursor-pointer gap-1 px-2 text-xs hover:border-primary/50 hover:bg-primary/10 hover:text-primary'
                          >
                            <Expand className='h-3 w-3'/>
                            View
                          </Button>
                          <Button
                              onClick={() => onDownload(img)}
                              variant="outline"
                              size='sm'
                              className='h-7 flex-1 cursor-pointer gap-1 px-2 text-xs hover:border-primary/50 hover:bg-primary/10 hover:text-primary'
                          >
                            <Download className='h-3 w-3'/>
                            Download
                          </Button>
                        </div>
                      </div>
                  ))}
                </div>
            ) : (
                <div className='py-16 text-center'>
                  <div className='relative mx-auto mb-8'>
                    {/* Pulse glow */}
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-primary/15 to-accent/15'/>
                    </div>
                    {/* Icon circle */}
                    <div className='relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-border bg-card shadow-lg'>
                      <ImageIcon className='h-10 w-10 text-muted-foreground'/>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <h3 className='text-xl font-bold text-foreground'>No generations yet</h3>
                    <p className='mx-auto max-w-md text-lg leading-relaxed text-muted-foreground'>
                      Start by entering a prompt and generating your first image
                    </p>
                  </div>
                </div>
            )}
          </div>
        </div>
      </>
  );
}