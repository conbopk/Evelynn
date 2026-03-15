"use client";

import Image from "next/image";
import type {GeneratedImage} from "~/app/(dashboard)/dashboard/create/page";
import {Card, CardContent} from "~/components/ui/card";
import {Button} from "~/components/ui/button";
import {Download, X} from "lucide-react";
import { ExpandableText } from "./expandable-text";

interface PromptInputProps {
  prompt: string;
  setPrompt: (text: string) => void;
  negativePrompt: string;
  setNegativePrompt: (text: string) => void;
  currentImage: GeneratedImage | null;
  onDownload: (img: GeneratedImage) => void;
}

export default function PromptInput({
    prompt,
    setPrompt,
    negativePrompt,
    setNegativePrompt,
    currentImage,
    onDownload,
}: PromptInputProps) {
  return (
      <Card className='shadow-lg'>
        <CardContent className='p-2 sm:p-3'>
          <div className='mb-2 flex items-start justify-between'>
            <div>
              <h3 className='mb-0.5 text-sm font-bold'>Prompt</h3>
              <p className='text-muted-foreground text-xs'>
                Describe the image you want to generate
              </p>
            </div>
          </div>

          <div className='space-y-3'>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A high quality product photo of a nano banana on a wooden table, studio lighting"
                maxLength={10000}
                rows={9}
                className='border border-input bg-background w-full rounded-md px-3 py-2 text-sm resize-none overflow-y-auto focus:border-blue-400 focus:ring-2 focus:ring-blue-400'
            />
            <input
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="Negative prompt (optional)"
                className='border border-input bg-background w-full rounded-md px-3 py-2 text-sm'
            />
            <div className='flex items-center justify-between text-xs text-gray-500'>
              <span>{prompt.length}/10000 characters</span>
              {prompt.length > 0 && (
                  <Button
                    onClick={() => setPrompt("")}
                    variant="ghost"
                    size='sm'
                    className='h-6 gap-1 px-2 cursor-pointer'
                  >
                    <X className='h-3 w-3'/>
                    Clear
                  </Button>
              )}
            </div>

            {currentImage && (
                <div className='rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-3'>
                  <div className='mb-2 flex items-center justify-between'>
                    <h4 className='text-xs font-bold text-blue-900'>
                      Latest Generation
                    </h4>
                    <Button
                      onClick={() => onDownload(currentImage)}
                      variant="ghost"
                      size='sm'
                      className='cursor-pointer h-6 gap-1 px-2 text-blue-700 hover:bg-blue-100'
                    >
                      <Download className='h-3 w-3'/>
                      <span className='text-sm'>Download</span>
                    </Button>
                  </div>
                  <ExpandableText
                    text={currentImage.prompt}
                    className='text-xs text-blue-800'
                    collapsedLines={2}
                  />
                  <div className='relative aspect-square w-full overflow-hidden rounded-md bg-white/50'>
                    <Image
                      src={`/api/images/${currentImage.s3_key}`}
                      alt={currentImage.prompt}
                      fill
                      unoptimized
                      className='object-contain'
                    />
                  </div>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
  )
}