
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
  const [sizeCategory, setSizeCategory] = useState<'tiny' | 'small' | 'normal'>('normal');

  useEffect(() => {
    if (!cardRef.current) return;

    const checkSize = () => {
      if (cardRef.current) {
        const height = cardRef.current.offsetHeight;
        if (height < 45) {
          setSizeCategory('tiny');
        } else if (height < 70) {
          setSizeCategory('small');
        } else {
          setSizeCategory('normal');
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
        <CardContent className={cn("p-1 flex-grow overflow-hidden flex flex-col justify-start", sizeCategory === 'tiny' && "p-0.5")}>
          <div className="overflow-hidden flex flex-col h-full justify-between">
            <div>
              <p className={cn("font-bold truncate leading-tight", 
                sizeCategory === 'tiny' ? "text-[10px]" : sizeCategory === 'small' ? "text-xs" : "text-sm"
              )}>
                {lesson.subject}
              </p>
            </div>
            <div className={cn("opacity-90 flex flex-col space-y-0.5", 
              sizeCategory === 'tiny' ? "text-[9px]" : "text-xs"
            )}>
              {lesson.information && (
                <div className="flex items-center truncate">
                  <Info className={cn("shrink-0 mr-0.5", sizeCategory === 'tiny' ? "w-2.5 h-2.5" : "w-3 h-3")} />
                  <span className="truncate">{lesson.information}</span>
                </div>
              )}
              <div className="flex items-center truncate">
                <Clock className={cn("shrink-0 mr-0.5", sizeCategory === 'tiny' ? "w-2.5 h-2.5" : "w-3 h-3")} />
                <span className="truncate">{lesson.startTime} - {lesson.endTime}</span>
              </div>
            </div>
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
