# 📅 Orario Facile

**Orario Facile** è un'applicazione web moderna, intuitiva e reattiva per la pianificazione, personalizzazione ed esportazione del proprio orario settimanale di lezioni, attività scolastiche o corsi.

---

## ✨ Funzionalità Principali

### 1. 📆 Calendario Interattivo Settimanale
- **Visualizzazione Completa**: Orario strutturato dal **Lunedì al Sabato**, dalle **08:00 alle 21:00** con intervalli modulari di 15 minuti.
- **Creazione Rapida**: Clic su qualsiasi cella vuota della griglia per aggiungere una lezione in quell'esatta fascia oraria e giorno.
- **Drag & Drop**: Trascina e rilascia le schede delle lezioni tra giorni e orari diversi con aggiornamento istantaneo.
- **Ridimensionamento Diretto (Resize)**: Modifica l'orario di inizio e fine trascinando le maniglie superiore e inferiore di ciascuna card lezione.
- **Card Lezione Adattive**: Tipografia e spaziature dinamiche (`tiny`, `small`, `normal`) che si adattano all'altezza e alla durata della lezione, garantendo la visibilità costante di materia, aula/note e orario.

---

### 2. 📝 Gestione e Personalizzazione Lezioni
- **Dettagli Completi**: Configurazione di materia, aula, note o informazioni aggiuntive.
- **Lezioni Ricorrenti**: Assegnazione simultanea a più giorni della settimana con un solo clic.
- **Palette Colori & Trasparenza**: Selezione del colore di sfondo con selettore dedicato e regolazione dell'opacità/trasparenza tramite slider.
- **Contrasto Testo Intelligente**: Calcolo automatico del contrasto (bianco/nero) in base alla luminosità dello sfondo, con possibilità di forzatura manuale.
- **Modifica ed Eliminazione Flessibile**: Possibilità di modificare o eliminare la singola istanza o l'intera serie di lezioni ricorrenti collegate.

---

### 3. 📊 Riepilogo Ore Settimanali
- **Conteggio Automatico**: Calcolo in tempo reale del monte ore settimanale complessivo per ogni singola materia.
- **Visualizzazione Chiara**: Badge informativi con ore e minuti formattati con precisione.
- **Versione Compatta**: Visualizzazione ottimizzata salvaspazio durante l'esportazione di stampe e documenti.

---

### 4. 📄 Esportazione e Stampa ad Alta Risoluzione
- **Esportazione PDF (A4 Verticale)**:
  - Layout calibrato sulle dimensioni esatte del formato A4 Portrait (`210mm × 297mm`).
  - Visualizzazione integrale di tutti i giorni della settimana (Lunedì–Sabato) senza tagli laterali o colonne nascoste.
  - Inclusione automatica del titolo personalizzato e del riepilogo ore in testata.
  - Margini ottimizzati per massimizzare la leggibilità e l'area di stampa.
- **Esportazione Immagine (JPEG)**:
  - Generazione di file immagine ad alta risoluzione (pixel ratio 2x) pronti per la condivisione e la visualizzazione su qualsiasi dispositivo.

---

### 5. 💾 Backup, Ripristino e Personalizzazione
- **Salvataggio Backup (JSON)**: Esportazione dell'intero set di lezioni e configurazioni in un file JSON leggero e portabile.
- **Ripristino Backup (JSON)**: Importazione istantanea del file di backup per ripristinare il calendario in qualsiasi momento.
- **Titolo Personalizzabile**: Modifica immediata del titolo dell'orario (es. *"Orario Artemisia"*, *"Orario Classe 3B"*, *"Orario Studio"*).
- **Regolazione Zoom Griglia**: Slider interattivo per aumentare o diminuire la densità verticale delle fasce orarie a seconda delle preferenze di visualizzazione.

---

## 🛠️ Tecnologie Utilizzate

- **Framework**: Next.js 15 (App Router) & React 18
- **Linguaggio**: TypeScript
- **Stile & Componenti**: Tailwind CSS, Radix UI, Lucide Icons, Class Variance Authority
- **Generazione Documenti**: `jspdf` & `html-to-image`
- **Gestione Form**: `react-hook-form` & `zod`
