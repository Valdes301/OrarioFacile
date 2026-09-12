export const DAYS = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"] as const;
export type Day = (typeof DAYS)[number];

export type Lesson = {
  id: string;
  recurringId?: string; // ID per raggruppare lezioni ricorrenti
  subject: string;
  information: string;
  day: Day;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  color: string; // rgba(r,g,b,a)
  textColor?: 'white' | 'black'; // Opzione per forzare il colore del testo
};
