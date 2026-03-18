// Időpontok
export const TIME_SLOTS = ['7:45', '8:45', '9:45', '10:45', '11:45', '12:45', '13:45', '14:45'] as const;

// Napok
export const WEEKDAYS = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek'] as const;
export const WEEKDAY_MAP = {
    'hétfő': 'Hétfő',
    'kedd': 'Kedd',
    'szerda': 'Szerda',
    'csütörtök': 'Csütörtök',
    'péntek': 'Péntek'
} as const;

// Tantárgyak
export const SUBJECTS = [
    'Matematika',
    'Magyar nyelv és irodalom',
    'Történelem',
    'Angol nyelv',
    'Német nyelv',
    'Biológia',
    'Kémia',
    'Fizika',
    'Földrajz',
    'Informatika',
    'Testnevelés',
    'Rajz és vizuális kultúra',
    'Ének-zene',
    'Etika',
    'Filozófia',
    'Pszichológia',
    'Közgazdaságtan',
    'Jog',
    'Osztályfőnöki'
] as const;

// Jegy típusok (tanulmányi)
export const GRADE_TYPES = [
    'Dolgozat',
    'Felelet',
    'Házi dolgozat',
    'Beadandó'
] as const;

// Viselkedési bejegyzések - Dicséretek
export const BEHAVIOR_PRAISE = [
    'Szaktanári dicséret',
    'Osztályfőnöki dicséret',
    'Igazgatói dicséret'
] as const;

// Viselkedési bejegyzések - Figyelmeztetések
export const BEHAVIOR_WARNING = [
    'Szaktanári figyelmeztetés',
    'Osztályfőnöki figyelmeztetés',
    'Igazgatói figyelmeztetés'
] as const;

// Összes viselkedési bejegyzés
export const BEHAVIOR_TYPES = [
    ...BEHAVIOR_PRAISE,
    ...BEHAVIOR_WARNING
] as const;

// Szerepkörök
export const USER_ROLES = {
    ADMIN: 'admin',
    PRINCIPAL: 'principal',
    TEACHER: 'teacher',
    HOMEROOM_TEACHER: 'homeroom_teacher',
    PARENT: 'parent',
    STUDENT: 'student',
    DJ: 'dj'
} as const;

// Szerepkör nevek
export const ROLE_NAMES = {
    [USER_ROLES.ADMIN]: 'Admin',
    [USER_ROLES.PRINCIPAL]: 'Igazgató',
    [USER_ROLES.TEACHER]: 'Tanár',
    [USER_ROLES.HOMEROOM_TEACHER]: 'Osztályfőnök',
    [USER_ROLES.PARENT]: 'Szülő',
    [USER_ROLES.STUDENT]: 'Diák',
    [USER_ROLES.DJ]: 'DJ'
} as const;
