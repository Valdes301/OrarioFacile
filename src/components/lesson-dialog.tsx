"use client"

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Lesson, Day } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DAYS } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { hexToRgba, rgbaToHex } from "@/lib/utils";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";


const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

const formSchema = z.object({
  subject: z.string().min(1, "La materia è obbligatoria."),
  information: z.string().optional(),
  days: z.array(z.enum(DAYS)).min(1, "Seleziona almeno un giorno."),
  startTime: z.string().regex(timeRegex, { message: "Formato ora non valido (HH:MM)." }),
  endTime: z.string().regex(timeRegex, { message: "Formato ora non valido (HH:MM)." }),
  color: z.string().refine(val => val.startsWith('#') || val.startsWith('rgba'), {
    message: "Formato colore non valido.",
  }),
  opacity: z.number().min(0).max(1),
  textColor: z.enum(['auto', 'white', 'black']).optional(),
}).refine(data => {
    if(data.startTime && data.endTime) {
        return data.startTime < data.endTime;
    }
    return true;
}, {
  message: "L'orario di fine deve essere successivo all'orario di inizio.",
  path: ["endTime"],
});

type LessonFormValues = z.infer<typeof formSchema>;

interface LessonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: Lesson | null;
  newLessonTemplate?: Partial<Lesson> & { day?: Day };
  onSave: (data: Omit<Lesson, 'id' | 'day'> & { days: Day[] }, lessonId?: string, recurringId?: string) => void;
  onDelete?: (lessonId: string, recurringId?: string) => void;
}

export function LessonDialog({ isOpen, onOpenChange, lesson, newLessonTemplate, onSave, onDelete }: LessonDialogProps) {
  const form = useForm<LessonFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      information: "",
      days: ["Lunedì"],
      startTime: "09:00",
      endTime: "10:00",
      color: "#89cff0",
      opacity: 1,
      textColor: 'auto',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (lesson) {
        const { hex, alpha } = rgbaToHex(lesson.color);
        form.reset({ 
          subject: lesson.subject,
          information: lesson.information,
          days: [lesson.day],
          startTime: lesson.startTime,
          endTime: lesson.endTime,
          color: hex,
          opacity: alpha,
          textColor: lesson.textColor || 'auto',
        });
      } else {
        const { hex, alpha } = rgbaToHex(newLessonTemplate?.color || '#89cff0');
        form.reset({
          subject: newLessonTemplate?.subject || "",
          information: newLessonTemplate?.information || "",
          days: newLessonTemplate?.day ? [newLessonTemplate.day] : ["Lunedì"],
          startTime: newLessonTemplate?.startTime || "09:00",
          endTime: newLessonTemplate?.endTime || "10:00",
          color: hex,
          opacity: alpha,
          textColor: newLessonTemplate?.textColor || 'auto',
        });
      }
    }
  }, [isOpen, lesson, newLessonTemplate, form]);

  const isEditing = !!lesson;

  function onSubmit(data: LessonFormValues) {
    const rgbaColor = hexToRgba(data.color, data.opacity);
    const finalData = { 
      subject: data.subject,
      information: data.information || "",
      days: data.days,
      startTime: data.startTime,
      endTime: data.endTime,
      color: rgbaColor,
      textColor: data.textColor === 'auto' ? undefined : data.textColor
    };
    onSave(finalData, lesson?.id, lesson?.recurringId);
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifica Lezione" : "Aggiungi Lezione"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifica i dettagli della lezione." : "Aggiungi una nuova lezione al tuo orario. Puoi selezionare più giorni per creare lezioni ricorrenti."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Materia</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Matematica" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="information"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Informazioni (Opzionale)</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Compiti per casa" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="days"
              render={() => (
                <FormItem>
                  <FormLabel>Giorno/i</FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                    {DAYS.map((day) => (
                      <FormField
                        key={day}
                        control={form.control}
                        name="days"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={day}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(day)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), day])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== day
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {day}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Inizio</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Fine</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colore Sfondo</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                       <Input 
                         type="color" 
                         value={rgbaToHex(field.value).hex}
                         onChange={(e) => field.onChange(e.target.value)}
                         className="w-12 h-10 p-1" 
                       />
                       <Input
                         type="text"
                         value={rgbaToHex(field.value).hex.toUpperCase()}
                         onChange={(e) => field.onChange(e.target.value)}
                         className="font-mono w-28"
                       />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="opacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opacità Sfondo</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        min={0}
                        max={1}
                        step={0.05}
                      />
                      <span className="font-mono text-sm">{(field.value * 100).toFixed(0)}%</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="textColor"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Colore Testo</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="auto" />
                        </FormControl>
                        <FormLabel className="font-normal">Automatico</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="white" />
                        </FormControl>
                        <FormLabel className="font-normal">Bianco</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="black" />
                        </FormControl>
                        <FormLabel className="font-normal">Nero</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              {isEditing && onDelete && lesson && (
                <div className="mr-auto flex flex-col sm:flex-row gap-2">
                  <Button type="button" variant="destructive" onClick={() => onDelete(lesson.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Elimina
                  </Button>
                  {lesson.recurringId && (
                     <Button type="button" variant="destructive" onClick={() => onDelete(lesson.id, lesson.recurringId)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Elimina tutte
                    </Button>
                  )}
                </div>
              )}
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Annulla</Button>
              <Button type="submit">Salva</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
