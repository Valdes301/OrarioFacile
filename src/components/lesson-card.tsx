
"use client"

import type { Lesson } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Clock, Info } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useRef, useState, useEffect } from "react";

interface LessonCardProps {
  lesson: Lesson;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, lessonId: string) => void;
  onClick: () => void;
  isResizing: boolean;
  onResizeStart: (e: React.MouseEvent<HTMLDivElement>, lessonId: string, direction: 'top' | 'bottom') => void;
}

const getContrastingTextColor = (rgbaColor: string): string => {
  const rgba = rgbaColor.match(/[\d.]+/g);
  if (!rgba || rgba.length < 3) return '#000000';
  
  const r = parseInt(rgba[0]);
  const g = parseInt(rgba[1]);
  const b = parseInt(rgba[2]);
  const alpha = rgba.length > 3 ? parseFloat(rgba[3]) : 1;

  if (alpha < 0.5) return '#000000';

  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
}

export function LessonCard({ lesson, onDragStart, onClick, isResizing, onResizeStart }: LessonCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sizeCategory, setSizeCategory] = useState<'tiny' | 'small-3' | 'compact-3' | 'normal'>('normal');

  useEffect(() => {
    if (!cardRef.current) return;

    const checkSize = () => {
      if (cardRef.current) {
        const height = cardRef.current.offsetHeight;
        if (height < 34) {
          setSizeCategory('tiny'); // < 30m
        } else if (height < 50) {
          setSizeCategory('small-3'); // 30m - 45m: 3 very compact lines (full width each)
        } else if (height < 85) {
          setSizeCategory('compact-3'); // 1h - 1h30m: 3 standard compact lines
        } else {
          setSizeCategory('normal'); // >= 1h30m: 3 spacious lines
        }
      }
    };
    
    checkSize();

    const resizeObserver = new ResizeObserver(checkSize);
    resizeObserver.observe(cardRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isResizing) {
      onClick();
    }
  }
  
  const textColor = lesson.textColor || getContrastingTextColor(lesson.color);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lesson.id)}
      onClick={handleCardClick}
      ref={cardRef}
      className="relative z-10 h-full w-full"
    >
      <div 
        className="absolute top-0 left-0 w-full h-2 cursor-ns-resize z-20"
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeStart(e, lesson.id, 'top');
        }}
      />
      <Card
        className="h-full w-full cursor-pointer transition-all duration-200 flex flex-col"
        style={{ 
          backgroundColor: lesson.color, 
          color: textColor,
          borderColor: 'transparent'
        }}
      >
        <CardContent className={cn(
          "flex-grow overflow-hidden flex flex-col justify-start",
          sizeCategory === 'tiny' ? "p-0.5 px-1" :
          sizeCategory === 'small-3' ? "px-1.5 py-0.5" :
          sizeCategory === 'compact-3' ? "p-1 px-1.5" : "p-2"
        )}>
          <div className="overflow-hidden flex flex-col justify-start w-full">
            {/* Subject Title */}
            <div>
              <p className={cn(
                "font-bold truncate leading-none", 
                sizeCategory === 'tiny' ? "text-[10px]" : 
                sizeCategory === 'small-3' ? "text-[11px]" : 
                sizeCategory === 'compact-3' ? "text-[14px]" : "text-[16px]"
              )}>
                {lesson.subject}
              </p>
            </div>

            {/* Content for Tall Boxes (>= 1h30m): 3 spacious lines */}
            {sizeCategory === 'normal' && (
              <div className="opacity-90 flex flex-col text-xs leading-snug space-y-0.5 mt-1">
                {lesson.information && (
                  <div className="flex items-center truncate">
                    <Info className="shrink-0 mr-1 w-3 h-3" />
                    <span className="truncate">{lesson.information}</span>
                  </div>
                )}
                <div className="flex items-center truncate">
                  <Clock className="shrink-0 mr-1 w-3 h-3" />
                  <span className="truncate font-medium">{lesson.startTime} - {lesson.endTime}</span>
                </div>
              </div>
            )}

            {/* Content for 1 Hour Boxes (~1h / 50px - 85px): 3 lines in compact format */}
            {sizeCategory === 'compact-3' && (
              <div className="opacity-90 flex flex-col text-[10.5px] leading-tight space-y-0.5 mt-0.5">
                {lesson.information && (
                  <div className="flex items-center truncate">
                    <Info className="shrink-0 mr-0.5 w-2.5 h-2.5" />
                    <span className="truncate">{lesson.information}</span>
                  </div>
                )}
                <div className="flex items-center truncate">
                  <Clock className="shrink-0 mr-0.5 w-2.5 h-2.5" />
                  <span className="truncate font-medium">{lesson.startTime} - {lesson.endTime}</span>
                </div>
              </div>
            )}

            {/* Content for 30m - 45m Boxes: 3 micro lines with full width for each item */}
            {sizeCategory === 'small-3' && (
              <div className="opacity-90 flex flex-col text-[8.5px] leading-tight space-y-0 mt-[1px]">
                {lesson.information && (
                  <div className="flex items-center truncate">
                    <Info className="shrink-0 mr-0.5 w-2 h-2" />
                    <span className="truncate">{lesson.information}</span>
                  </div>
                )}
                <div className="flex items-center truncate">
                  <Clock className="shrink-0 mr-0.5 w-2 h-2" />
                  <span className="truncate font-semibold">{lesson.startTime} - {lesson.endTime}</span>
                </div>
              </div>
            )}

            {/* Content for Ultra-Tiny Boxes (< 30m) */}
            {sizeCategory === 'tiny' && (
              <div className="opacity-90 flex items-center flex-nowrap text-[8.5px] leading-tight gap-1 overflow-hidden mt-0.5">
                {lesson.information && (
                  <>
                    <span className="truncate">{lesson.information}</span>
                    <span className="opacity-50 shrink-0">•</span>
                  </>
                )}
                <div className="flex items-center shrink-0">
                  <span className="whitespace-nowrap font-medium">{lesson.startTime}-{lesson.endTime}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <div 
        className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize z-20"
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeStart(e, lesson.id, 'bottom');
        }}
      />
    </div>
  );
}
