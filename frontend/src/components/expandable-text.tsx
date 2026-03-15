"use client";

import {ChevronDown, ChevronUp } from "lucide-react";
import {useState} from "react";

interface ExpandableTextProps {
  text: string;
  className?: string;
  collapsedLines?: 2 | 3;
}

export function ExpandableText({
    text,
    className = "",
    collapsedLines = 2
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);

  const lineClamp = collapsedLines === 2 ? "line-clamp-2" : "line-clamp-3";

  return (
      <div>
        <p
            className={`${!expanded ? lineClamp : ""} cursor-pointer ${className}`}
            onClick={() => setExpanded((v) => !v)}
        >
          {text}
        </p>
        <button
          onClick={() => setExpanded((v) => !v)}
          className='mt-0.5 flex items-center gap-0.5 text-xs bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent hover:text-blue-700 mb-1'
        >
          {expanded ? (
              <>
                <ChevronUp className='h-3 w-3'/> Show less
              </>
          ) : (
              <>
                <ChevronDown className='h-3 w-3'/> Show more
              </>
          )}
        </button>
      </div>
  );
}