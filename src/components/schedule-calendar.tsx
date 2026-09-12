
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Lesson, Day } from "@/lib/types";
import { DAYS } from "@/lib/types";
import { LessonCard } from "./lesson-card";
import { cn, timeToMinutes, minutesToTime } from "@/lib/utils";

const TIME_SLOTS_START = 8;
const TIME_SLOTS_END = 21;
const SLOT_DURATION_MINUTES = 15;

interface ScheduleCalendarProps {
  lessons: Lesson[];
  onLessonClick: (lesson: Lesson) => void;
  onLessonDrop: (lessonId: string, newDay: Day, newStartTime: string) => void;
  onLessonResize: (lessonId: string, newStartTime: string, newEndTime: string) => void;
  onEmptyCellClick: (day: Day, startTime: string) => void;
  zoomLevel: number;
  isExporting: boolean;
}

export function ScheduleCalendar({ lessons, onLessonClick, onLessonDrop, onLessonResize, onEmptyCellClick, zoomLevel, isExporting }: ScheduleCalendarProps) {
  const [draggedOver, setDraggedOver] = useState<{day: Day, time: string} | null>(null);
  const [resizingLesson, setResizingLesson] = useState<{ id: string; direction: 'top' | 'bottom'; initialY: number; initialStartTime: string; initialEndTime: string; } | null>(null);

  const timeSlots = useMemo(() => 
    Array.from(
      { length: (TIME_SLOTS_END - TIME_SLOTS_START) * (60 / SLOT_DURATION_MINUTES) },
      (_, i) => {
        const totalMinutes = TIME_SLOTS_START * 60 + i * SLOT_DURATION_MINUTES;
        return minutesToTime(totalMinutes);
      }
    ),
  []);
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, lessonId: string) => {
    if (resizingLesson || isExporting) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("lessonId", lessonId);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, day: Day, time: string) => {
    e.preventDefault();
    if (isExporting) return;
    const lessonId = e.dataTransfer.getData("lessonId");
    if (lessonId) {
      onLessonDrop(lessonId, day, time);
    }
    setDraggedOver(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, day: Day, time: string) => {
    e.preventDefault();
    if (isExporting) return;
    setDraggedOver({ day, time });
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedOver(null);
  };

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>, lessonId: string, direction: 'top' | 'bottom') => {
    e.preventDefault();
    e.stopPropagation();
    if (isExporting) return;
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    
    document.body.style.cursor = 'ns-resize';
    setResizingLesson({
        id: lessonId,
        direction,
        initialY: e.clientY,
        initialStartTime: lesson.startTime,
        initialEndTime: lesson.endTime,
    });
  };
  
  const getLessonStyle = useCallback((lesson: Lesson): React.CSSProperties => {
    const topOffset = TIME_SLOTS_START * 60;
    
    const startMinutes = timeToMinutes(lesson.startTime);
    const endMinutes = timeToMinutes(lesson.endTime);
    const top = ((startMinutes - topOffset) / SLOT_DURATION_MINUTES);
    const height = ((endMinutes - startMinutes) / SLOT_DURATION_MINUTES);

    return {
      gridRowStart: Math.max(0, top) + 2, 
      gridRowEnd: Math.max(0, top + height) + 2,
      gridColumn: DAYS.indexOf(lesson.day) + 2,
    };
  }, []);

  const gridTemplateRows = useMemo(() => {
    if (isExporting) {
      return `auto repeat(${timeSlots.length}, minmax(14px, 1fr))`;
    }
    return `auto repeat(${timeSlots.length}, ${zoomLevel}px)`;
  }, [isExporting, timeSlots.length, zoomLevel]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingLesson) return;
      
      const pixelsPerSlot = zoomLevel;
      const dy = e.clientY - resizingLesson.initialY;
      const minuteChange = (dy / pixelsPerSlot) * SLOT_DURATION_MINUTES;
      
      let newStartTime = resizingLesson.initialStartTime;
      let newEndTime = resizingLesson.initialEndTime;

      if (resizingLesson.direction === 'top') {
          const initialStartMinutes = timeToMinutes(resizingLesson.initialStartTime);
          let newStartMinutes = initialStartMinutes + minuteChange;
          newStartMinutes = Math.max(TIME_SLOTS_START * 60, newStartMinutes);
          newStartTime = minutesToTime(newStartMinutes);

          if (timeToMinutes(newStartTime) >= timeToMinutes(resizingLesson.initialEndTime)) {
              newStartTime = minutesToTime(timeToMinutes(resizingLesson.initialEndTime) - SLOT_DURATION_MINUTES);
          }
      } else { // 'bottom'
          const initialEndMinutes = timeToMinutes(resizingLesson.initialEndTime);
          let newEndMinutes = initialEndMinutes + minuteChange;
          newEndMinutes = Math.min(TIME_SLOTS_END * 60, newEndMinutes);
          newEndTime = minutesToTime(newEndMinutes);
          
          if (timeToMinutes(newEndTime) <= timeToMinutes(resizingLesson.initialStartTime)) {
              newEndTime = minutesToTime(timeToMinutes(resizingLesson.initialStartTime) + SLOT_DURATION_MINUTES);
          }
      }

      const lesson = lessons.find(l => l.id === resizingLesson.id);
      if(lesson && (lesson.startTime !== newStartTime || lesson.endTime !== newEndTime)) {
         onLessonResize(resizingLesson.id, newStartTime, newEndTime);
      }
    };

    const handleMouseUp = () => {
      if(resizingLesson) {
          const lesson = lessons.find(l => l.id === resizingLesson.id);
          if (lesson) {
              const snapToGrid = (time: string) => {
                  const minutes = timeToMinutes(time);
                  const snappedMinutes = Math.round(minutes / 15) * 15;
                  return minutesToTime(snappedMinutes);
              }
              const finalStartTime = snapToGrid(lesson.startTime);
              const finalEndTime = snapToGrid(lesson.endTime);

              if (timeToMinutes(finalStartTime) < timeToMinutes(finalEndTime)) {
                  onLessonResize(resizingLesson.id, finalStartTime, finalEndTime);
              } else {
                  // Revert to original if invalid
                  onLessonResize(resizingLesson.id, resizingLesson.initialStartTime, resizingLesson.initialEndTime);
              }
          }
      }
      document.body.style.cursor = '';
      setResizingLesson(null);
    };

    if (resizingLesson) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingLesson, lessons, onLessonResize, zoomLevel]);

  const containerClass = cn(
    'relative',
    isExporting ? 'exporting bg-white' : 'bg-white'
  );

  const gridClass = cn(
    'grid',
    isExporting && 'h-full'
  );

  return (
    <div className={containerClass}>
      <div 
        className={gridClass}
        style={{ 
          gridTemplateColumns: isExporting 
            ? `44px repeat(${DAYS.length}, 1fr)` 
            : `40px repeat(${DAYS.length}, minmax(115px, 1fr))`, 
          gridTemplateRows 
        }}
      >
        {/* Time column header */}
        <div className={cn("sticky top-0 z-20 text-center bg-background border-b border-r", isExporting ? "p-1" : "p-2")}></div>
        
        {/* Day headers */}
        {DAYS.map((day) => (
          <div key={day} className={cn("sticky top-0 z-20 text-center font-semibold bg-background border-b", isExporting ? "py-1.5 px-1 text-xs text-gray-900" : "p-2")}>
            {day}
          </div>
        ))}
        
        {/* Time slots labels */}
        {timeSlots.map((time) => {
          const isHour = time.endsWith(':00');
          const isHalfHour = time.endsWith(':30');
          
          return (
            <div 
              key={time} 
              style={{gridRow: timeSlots.indexOf(time) + 2}}
              className={cn(
                "flex items-center pr-2 justify-end text-xs text-muted-foreground border-r", 
                isHour ? "font-medium text-gray-600" : "text-gray-400"
              )}
            >
              {(isHour || isHalfHour) ? time : ""}
            </div>
          );
        })}

        {/* Grid cells for dropping and background lines */}
        {DAYS.map((day) => 
          timeSlots.map((time, timeIndex) => (
            <div
              key={`${day}-${time}`}
              onDrop={(e) => handleDrop(e, day, time)}
              onDragOver={(e) => handleDragOver(e, day, time)}
              onDragLeave={handleDragLeave}
              onClick={() => onEmptyCellClick(day, time)}
              className={cn(
                  "border-l",
                  time.endsWith(':45') ? 'border-b-2' : 'border-b',
                   !isExporting && "cursor-pointer hover:bg-muted/50 transition-colors duration-200",
                  draggedOver?.day === day && draggedOver?.time === time && "bg-primary/20"
              )}
              style={{
                  gridColumn: DAYS.indexOf(day) + 2,
                  gridRow: timeIndex + 2,
              }}
            ></div>
          ))
        )}

        {/* Lessons */}
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            style={getLessonStyle(lesson)}
            className="p-0 m-0"
            data-lesson-id={lesson.id}
          >
            <LessonCard
              lesson={lesson}
              onDragStart={handleDragStart}
              onClick={() => onLessonClick(lesson)}
              onResizeStart={handleResizeStart}
              isResizing={!!resizingLesson}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

ScheduleCalendar.displayName = "ScheduleCalendar";
