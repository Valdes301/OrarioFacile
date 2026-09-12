
"use client";

import { useState, useEffect, useRef } from "react";
import type { Lesson, Day } from "@/lib/types";
import { initialLessons } from "@/lib/data";
import { PageHeader } from "./page-header";
import { ScheduleCalendar } from "./schedule-calendar";
import { LessonDialog } from "./lesson-dialog";
import { useToast } from "@/hooks/use-toast";
import { calculateDuration, minutesToTime, timeToMinutes } from "@/lib/utils";
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { cn } from "@/lib/utils";
import { WeeklySummary } from "./weekly-summary";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function OrarioFacile() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [newLessonTemplate, setNewLessonTemplate] = useState<Partial<Lesson> | null>(null);
  const [zoomLevel, setZoomLevel] = useState(15);
  const scheduleRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("Facile");
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
  const [fileToImport, setFileToImport] = useState<File | null>(null);
  const [isExporting, setIsExporting] = useState(false);


  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedLessons = localStorage.getItem('lessons');
      const savedTitle = localStorage.getItem('title');
      if (savedLessons) {
        setLessons(JSON.parse(savedLessons));
      } else {
        setLessons(initialLessons);
      }
      if(savedTitle) {
        setTitle(JSON.parse(savedTitle));
      }
    } catch (error) {
        console.error("Failed to load lessons from localStorage", error);
        setLessons(initialLessons);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if(isMounted) {
      try {
        localStorage.setItem('lessons', JSON.stringify(lessons));
        localStorage.setItem('title', JSON.stringify(title));
      } catch (error) {
        console.error("Failed to save lessons or title to localStorage:", error);
      }
    }
  }, [lessons, title, isMounted]);

  const handleAddLesson = () => {
    setEditingLesson(null);
    setNewLessonTemplate(null);
    setIsDialogOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setNewLessonTemplate(null);
    setIsDialogOpen(true);
  };

  const handleCreateLessonInSlot = (day: Day, startTime: string) => {
    setEditingLesson(null);
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + 60; // Default to 1 hour duration
    setNewLessonTemplate({
      day,
      startTime,
      endTime: minutesToTime(endMinutes),
    });
    setIsDialogOpen(true);
  };
  
  const handleRescheduleLesson = (lessonId: string, newDay: Day, newStartTime: string) => {
    setLessons(prevLessons => {
        const lessonToUpdate = prevLessons.find(l => l.id === lessonId);
        if (!lessonToUpdate) return prevLessons;

        const duration = calculateDuration(lessonToUpdate.startTime, lessonToUpdate.endTime);
        const newEndTime = minutesToTime(timeToMinutes(newStartTime) + duration);

        return prevLessons.map(l =>
            l.id === lessonId ? { ...l, day: newDay, startTime: newStartTime, endTime: newEndTime } : l
        );
    });
     toast({
      title: "Lezione Riprogrammata",
      description: "La lezione è stata spostata con successo.",
    });
  };

  const handleLessonResize = (lessonId: string, newStartTime: string, newEndTime: string) => {
    if (timeToMinutes(newStartTime) >= timeToMinutes(newEndTime)) return;
    
    setLessons(prevLessons =>
      prevLessons.map(l =>
        l.id === lessonId ? { ...l, startTime: newStartTime, endTime: newEndTime } : l
      )
    );
  };

  const handleSaveLesson = (data: Omit<Lesson, 'id' | 'day'> & { days: Day[] }, lessonId?: string, recurringIdToUpdate?: string) => {
    const { days, ...lessonData } = data;
    
    setLessons(prev => {
        let updatedLessons = [...prev];
        const isEditing = !!lessonId;

        // If we are editing a recurring lesson, we want to remove all instances and recreate them
        if (isEditing && recurringIdToUpdate) {
            updatedLessons = updatedLessons.filter(l => l.recurringId !== recurringIdToUpdate);
        } else if (isEditing) {
            // Editing a single lesson (that might become recurring or stay single)
            updatedLessons = updatedLessons.filter(l => l.id !== lessonId);
        }
        
        const isRecurring = days.length > 1 || (days.length === 1 && recurringIdToUpdate);
        // Use the old recurringId if we're updating a recurring set, or create a new one.
        const recurringId = isRecurring ? (recurringIdToUpdate || `${new Date().toISOString()}-recur`) : undefined;
        
        const newLessons = days.map(day => ({
            ...lessonData,
            id: `${new Date().toISOString()}-${day}-${Math.random()}`,
            day,
            recurringId
        }));
        
        return [...updatedLessons, ...newLessons];
    });

    toast({
        title: `Lezione ${lessonId ? 'Aggiornata' : 'Aggiunta'}`,
        description: `${lessonId ? 'I dettagli della lezione sono stati salvati.' : `Aggiunta ${days.length > 1 ? days.length + ' lezioni' : '1 lezione'} al calendario.`}`
    });
    
    setIsDialogOpen(false);
    setNewLessonTemplate(null);
    setEditingLesson(null);
  };
  
  const handleDeleteLesson = (lessonId: string, recurringId?: string) => {
    if (recurringId) {
       setLessons(prev => prev.filter(l => l.recurringId !== recurringId));
       toast({
        title: "Lezioni Eliminate",
        description: "Lezioni ricorrenti rimosse.",
        variant: "destructive"
      });
    } else {
      setLessons(prev => prev.filter(l => l.id !== lessonId));
      toast({
          title: "Lezione Eliminata",
          description: "La lezione è stata rimossa.",
          variant: "destructive"
      });
    }
    setIsDialogOpen(false);
  }

  const exportSchedule = async (format: 'pdf' | 'jpg') => {
    const scheduleElement = scheduleRef.current;
    if (!scheduleElement) {
        toast({ title: 'Errore', description: 'Impossibile trovare l\'elemento dell\'orario.', variant: 'destructive' });
        return;
    }
    toast({ title: 'Esportazione in corso...', description: 'Attendere prego.' });

    setIsExporting(true);

    // Wait for the state to update and re-render
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        const dataUrl = await htmlToImage.toJpeg(scheduleElement, { 
          quality: 1, 
          pixelRatio: 2,
          backgroundColor: '#ffffff'
        });

        if (format === 'jpg') {
            const link = document.createElement('a');
            link.download = `orario-scolastico-${title}.jpeg`;
            link.href = dataUrl;
            link.click();
        } else { // pdf
            const pdf = new jsPDF({ 
                orientation: 'portrait', 
                unit: 'mm', 
                format: 'a4' 
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
            const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

            const margin = 2; // 2mm minimal margin to fill A4 portrait completely
            const usableWidth = pdfWidth - (margin * 2);
            const usableHeight = pdfHeight - (margin * 2);

            const imgProps = pdf.getImageProperties(dataUrl);
            const imgWidth = imgProps.width;
            const imgHeight = imgProps.height;
            const imgRatio = imgWidth / imgHeight;

            let finalWidth = usableWidth;
            let finalHeight = finalWidth / imgRatio;

            if (finalHeight > usableHeight) {
                finalHeight = usableHeight;
                finalWidth = finalHeight * imgRatio;
            }

            const x = (pdfWidth - finalWidth) / 2;
            const y = (pdfHeight - finalHeight) / 2;

            pdf.addImage(dataUrl, 'JPEG', x, y, finalWidth, finalHeight);
            pdf.save(`orario-scolastico-${title}.pdf`);
        }
        toast({ title: 'Esportazione completata!', variant: 'default' });
    } catch (error) {
        console.error('oops, something went wrong!', error);
        toast({ title: 'Errore durante l\'esportazione', description: 'Si è verificato un problema.', variant: 'destructive' });
    } finally {
        setIsExporting(false);
    }
};


  const handleExportBackup = () => {
    try {
      const backupData = {
        title,
        lessons,
      };
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `orario-facile-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: 'Backup Esportato', description: 'Il file di backup è stato scaricato.' });
    } catch (error) {
      console.error("Failed to export backup file:", error);
      toast({ title: 'Errore durante l\'esportazione del backup', description: 'Impossibile esportare i dati.', variant: 'destructive' });
    }
  };
  
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileToImport(file);
      setIsImportConfirmOpen(true);
    }
     if (event.target) {
      event.target.value = "";
    }
  };

  const proceedWithImport = () => {
    if (!fileToImport) return;

    const reader = new FileReader();
    reader.onerror = (error) => {
      console.error("FileReader failed to read backup file:", error);
      toast({ title: 'Errore di Lettura', description: 'Impossibile leggere il file selezionato.', variant: 'destructive' });
      closeImportConfirmation();
    };
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("File could not be read as text");
        }
        const data = JSON.parse(text);
        if (data && data.lessons && data.title) {
          setLessons(data.lessons);
          setTitle(data.title);
          toast({ title: 'Importazione Riuscita', description: 'Il tuo orario è stato ripristinato.' });
        } else {
          throw new Error("Invalid backup file format");
        }
      } catch (error) {
        console.error("Failed to import backup:", error);
        toast({ title: 'Errore di Importazione', description: 'Il file di backup non è valido.', variant: 'destructive' });
      } finally {
         closeImportConfirmation();
      }
    };
    reader.readAsText(fileToImport);
  };
  
  const closeImportConfirmation = () => {
    setIsImportConfirmOpen(false);
    setFileToImport(null);
  };


  if (!isMounted) {
    return null;
  }

  return (
    <div className="p-4 md:p-8">
      <PageHeader 
        onAddLesson={handleAddLesson} 
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        onExport={exportSchedule}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        isExporting={isExporting}
        title={title}
        onTitleChange={setTitle}
      />
      <div 
        className={cn("mt-8", !isExporting && "overflow-x-auto", isExporting && "overflow-visible")}
      >
        <div 
          ref={scheduleRef} 
          className={cn(
            "bg-white", 
            isExporting 
              ? "p-4 flex flex-col justify-start" 
              : "p-6 rounded-xl border border-gray-200"
          )}
          style={isExporting ? { width: '820px', minHeight: '1160px', boxSizing: 'border-box' } : undefined}
        >
            {isExporting && (
              <div className="mb-3 pb-2 border-b border-gray-300 flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Orario {title}
                </h1>
                <span className="text-xs text-gray-500 font-medium">Orario Scolastico</span>
              </div>
            )}
            {isExporting && <WeeklySummary lessons={lessons} isCompact className="mt-0 mb-3" />}
            <div className={cn(isExporting && "flex-1 min-h-0")}>
              <ScheduleCalendar 
                lessons={lessons} 
                onLessonClick={handleEditLesson}
                onLessonDrop={handleRescheduleLesson}
                onLessonResize={handleLessonResize}
                onEmptyCellClick={handleCreateLessonInSlot}
                zoomLevel={zoomLevel}
                isExporting={isExporting}
              />
            </div>
        </div>
      </div>
      
      {!isExporting && <WeeklySummary lessons={lessons} />}

      <LessonDialog
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setNewLessonTemplate(null);
            setEditingLesson(null);
          }
        }}
        lesson={editingLesson}
        newLessonTemplate={newLessonTemplate}
        onSave={handleSaveLesson}
        onDelete={handleDeleteLesson}
      />
       <AlertDialog open={isImportConfirmOpen} onOpenChange={setIsImportConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confermi l'importazione?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa operazione sovrascriverà l'orario corrente con i dati del file di backup. Vuoi continuare?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeImportConfirmation}>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={proceedWithImport}>Importa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
