import type { DayColumn, TimeSlot } from './types';

export const START_HOUR = 8;
export const END_HOUR = 15; // 3:00 PM inclusive start
export const WEEKS_TO_SHOW = 4;

export const TIME_SLOTS: TimeSlot[] = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => {
    const hour = START_HOUR + i;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return {
        label: `${displayHour}:00 ${period}`,
        hour
    };
});

export const getNextShiftDays = (): DayColumn[] => {
    const days: DayColumn[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day for comparison

    let current = new Date(today);

    // Find Tuesdays (2) and Thursdays (4) for the next 4 weeks
    let weeksCount = 0;
    let safety = 0;

    while (weeksCount < WEEKS_TO_SHOW && safety < 100) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek === 2 || dayOfWeek === 4) {
            days.push({
                date: new Date(current),
                dateStr: current.toISOString().split('T')[0],
                dayName: dayOfWeek === 2 ? 'TUESDAY' : 'THURSDAY'
            });
        }

        // If we passed a Thursday, we've completed a week of Tu/Th
        if (dayOfWeek === 4) {
            weeksCount++;
        }

        current.setDate(current.getDate() + 1);
        safety++;
    }

    return days;
};
