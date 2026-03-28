"use client";

import {ChevronLeft, ChevronRight} from "lucide-react";
import { Button } from "./ui/button";

interface PaginationProps {
  hasNext: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
}


export function Pagination({
    hasNext,
    hasPrev,
    onNext,
    onPrev
}: PaginationProps) {
  if (!hasNext && !hasPrev) return null;

  return (
      <div className='flex items-center justify-center gap-2'>
        <Button
          variant='outline'
          size="sm"
          className='gap-1.5'
          disabled={!hasPrev}
          onClick={onPrev}
        >
          <ChevronLeft className='h-4 w-4'/>
          Previous
        </Button>

        <Button
            variant='outline'
            size="sm"
            className='gap-1.5'
            disabled={!hasNext}
            onClick={onNext}
        >
          Next
          <ChevronRight className='h-4 w-4'/>
        </Button>
      </div>
  );
}