"use client";

import {ChevronLeft, ChevronRight} from "lucide-react";
import { Button } from "./ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
}


export function Pagination({
    page,
    totalPages,
    hasNext,
    hasPrev,
    onPageChange
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page number to show
  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
      <div className='flex items-center justify-center gap-1'>
        <Button
          variant='outline'
          size="sm"
          className='h-8 w-8 p-0'
          disabled={!hasPrev}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className='h-4 w-4'/>
        </Button>

        {pages.map((p, i) =>
          p === "..." ? (
              <span key={`ellipsis-${i}`} className='px-2 text-sm text-gray-400'>
                ...
              </span>
          ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                className='h-8 w-8 p-0 text-sm'
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
          ),
        )}

        <Button
            variant='outline'
            size="sm"
            className='h-8 w-8 p-0'
            disabled={!hasNext}
            onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className='h-4 w-4'/>
        </Button>
      </div>
  )

}