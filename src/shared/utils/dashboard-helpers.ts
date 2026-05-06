import { Lesson, AttendanceRecord } from '@/shared/types';

export function getStudentsForClass(className: string, allUsers: any[]): AttendanceRecord[] {
    return allUsers
        .filter(u => u.role === 'student' && u.class === className)
        .map(u => ({
            studentId: u.uid,
            studentName: u.fullName,
            present: true,
            excused: false
        }));
}

export function generateLessonId(date: Date, startTime: string, className: string): string {
    const dateStr = date.toISOString().split('T')[0];
    return `${dateStr}_${startTime}_${className}`;
}

export function isCurrentLesson(lesson: Lesson, currentTime: Date): boolean {
    const [startHour, startMinute] = lesson.StartTime.split(':').map(Number);
    const lessonStart = new Date(currentTime);
    lessonStart.setHours(startHour, startMinute, 0, 0);
    
    const lessonEnd = new Date(lessonStart);
    lessonEnd.setMinutes(lessonEnd.getMinutes() + 45);
    
    return currentTime >= lessonStart && currentTime <= lessonEnd;
}

export function isHomeworkForLesson(homework: any, lesson: Lesson, selectedDate: Date): boolean {
    if (!homework.lessonId) return false;
    
    const [hwDate, hwTime, hwClass] = homework.lessonId.split('_');
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    
    return hwDate === selectedDateStr && 
           hwTime === lesson.StartTime && 
           hwClass === lesson.Class;
}

export function getWeekDates(currentDate: Date): Date[] {
    const dates: Date[] = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    
    for (let i = 0; i < 5; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        dates.push(date);
    }
    
    return dates;
}

export function filterLessonsByDate(lessons: Lesson[], selectedDate: Date, selectedDay: string): Lesson[] {
    return lessons.filter(lesson => lesson.Day === selectedDay);
}

export function sortLessonsByTime(lessons: Lesson[]): Lesson[] {
    return [...lessons].sort((a, b) => {
        const [aHour, aMin] = a.StartTime.split(':').map(Number);
        const [bHour, bMin] = b.StartTime.split(':').map(Number);
        return (aHour * 60 + aMin) - (bHour * 60 + bMin);
    });
}
