export function formatDate(date: string | Date, locale: string = 'hu-HU'): string {
    return new Date(date).toLocaleDateString(locale);
}

export function formatDateTime(date: string | Date, locale: string = 'hu-HU'): string {
    return new Date(date).toLocaleString(locale);
}

export function formatDateLong(date: string | Date): string {
    return new Date(date).toLocaleDateString('hu-HU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function getGradeColor(grade: number): string {
    if (grade >= 4) return 'bg-green-500';
    if (grade >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
}

export function getGradeTextColor(grade: number): string {
    if (grade >= 4) return 'text-green-600';
    if (grade >= 3) return 'text-yellow-600';
    return 'text-red-600';
}

export function calculateAverage(grades: Array<{ grade: number }>): number {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, g) => acc + g.grade, 0);
    return sum / grades.length;
}

export function getYouTubeVideoId(url: string): string {
    if (url.includes('music.youtube.com')) {
        return url.split('v=')[1]?.split('&')[0] || url.split('/').pop() || '';
    }
    return url.split('v=')[1]?.split('&')[0] || url.split('/').pop() || '';
}

export function detectMusicPlatform(url: string): 'spotify' | 'youtube' | null {
    if (url.includes('spotify.com')) return 'spotify';
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('music.youtube.com')) {
        return 'youtube';
    }
    return null;
}

export function fillEmptyPeriods(dayLessons: any[], timeSlots: readonly string[]): any[] {
    if (dayLessons.length === 0) return [];

    const filledLessons = [];
    const existingTimes = dayLessons.map(lesson => lesson.StartTime);
    const lastLessonIndex = Math.max(...existingTimes.map(time => timeSlots.indexOf(time)));

    for (let i = 0; i <= lastLessonIndex; i++) {
        const time = timeSlots[i];
        const existingLesson = dayLessons.find(lesson => lesson.StartTime === time);

        if (existingLesson) {
            filledLessons.push(existingLesson);
        } else {
            filledLessons.push({
                StartTime: time,
                Subject: 'Lyukas óra',
                Teacher: '',
                Class: '',
                Room: '',
                status: 'free'
            });
        }
    }

    return filledLessons;
}
