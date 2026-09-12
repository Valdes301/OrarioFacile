
"use client"

import type { Lesson } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateDuration, formatDuration } from "@/lib/utils";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface WeeklySummaryProps {
  lessons: Lesson[];
  className?: string;
  isCompact?: boolean;
}

export function WeeklySummary({ lessons, className, isCompact = false }: WeeklySummaryProps) {
  const totalHoursBySubject = useMemo(() => {
    const totals: Record<string, number> = {};
    lessons.forEach(lesson => {
      const duration = calculateDuration(lesson.startTime, lesson.endTime);
      totals[lesson.subject] = (totals[lesson.subject] || 0) + duration;
    });
    return Object.entries(totals).sort(([, a], [, b]) => b - a);
  }, [lessons]);

  if (isCompact) {
    return (
      <div className={cn("w-full bg-slate-50/80 border border-gray-200 rounded-lg p-2.5", className)}>
        <div className="text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
          Riepilogo Ore Settimanali
        </div>
        {totalHoursBySubject.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {totalHoursBySubject.map(([subject, totalMinutes]) => (
              <span
                key={subject}
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white text-gray-800 border border-gray-200 shadow-xs"
              >
                {subject}: {formatDuration(totalMinutes)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Nessuna lezione programmata.</p>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("w-full mt-8", className)}>
      <CardHeader>
        <CardTitle>Riepilogo Ore Settimanali</CardTitle>
      </CardHeader>
      <CardContent>
        {totalHoursBySubject.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {totalHoursBySubject.map(([subject, totalMinutes]) => (
              <Badge key={subject} variant="secondary" className="text-sm">
                {subject}: {formatDuration(totalMinutes)}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Nessuna lezione programmata.</p>
        )}
      </CardContent>
    </Card>
  );
}
