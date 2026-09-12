
"use client"

import { Button } from "@/components/ui/button";
import { Plus, ZoomIn, Download, FileText, FileImage, FileDown, FileUp } from "lucide-react";
import { Slider } from "./ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  onAddLesson: () => void;
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  onExport: (format: 'pdf' | 'jpg') => void;
  onExportBackup: () => void;
  onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isExporting: boolean;
  title: string;
  onTitleChange: (newTitle: string) => void;
}

export function PageHeader({ 
  onAddLesson, 
  zoomLevel, 
  onZoomChange, 
  onExport, 
  onExportBackup,
  onImportBackup,
  isExporting, 
  title, 
  onTitleChange 
}: PageHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && spanRef.current) {
      inputRef.current.style.width = `${spanRef.current.offsetWidth}px`;
    }
  }, [title]);

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  return (
    <header className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">
          Orario
          <div className="inline-block relative">
            <span ref={spanRef} className="absolute invisible whitespace-pre -z-10">{title}</span>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className={cn(
                "bg-transparent outline-none border-none text-primary p-0 m-0",
                "text-3xl font-bold tracking-tight"
              )}
            />
          </div>
        </h1>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-2">
              <ZoomIn className="h-5 w-5 text-muted-foreground" />
              <Slider
                  value={[zoomLevel]}
                  onValueChange={(value) => onZoomChange(value[0])}
                  min={10}
                  max={80}
                  step={1}
                  className="w-32"
              />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting}>
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Esportazione..." : "Esporta"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onExport('pdf')} disabled={isExporting}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Esporta come PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('jpg')} disabled={isExporting}>
                <FileImage className="mr-2 h-4 w-4" />
                <span>Esporta come JPG</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExportBackup}>
                <FileDown className="mr-2 h-4 w-4" />
                <span>Esporta Backup (JSON)</span>
              </DropdownMenuItem>
               <DropdownMenuItem onClick={handleImportClick}>
                <FileUp className="mr-2 h-4 w-4" />
                <span>Importa Backup (JSON)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            type="file"
            ref={importInputRef}
            className="hidden"
            accept=".json"
            onChange={onImportBackup}
          />

          <Button onClick={onAddLesson} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Lezione
          </Button>
        </div>
      </div>
    </header>
  );
}
