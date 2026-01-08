export interface ShiftData {
    [key: string]: string;
}

export interface DayColumn {
    date: Date;
    dateStr: string;
    dayName: string;
}

export interface TimeSlot {
    label: string;
    hour: number;
}
