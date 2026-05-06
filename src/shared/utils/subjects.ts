export const SUBJECTS = [
  'Matematika',
  'Magyar nyelv és irodalom',
  'Történelem',
  'Földrajz',
  'Biológia',
  'Fizika',
  'Kémia',
  'Angol nyelv',
  'Német nyelv',
  'Testnevelés',
  'Informatika',
  'Művészetek',
  'Technika',
  'Etika',
  'Hittan',
  'Osztályfőnöki',
  'Egyéb'
] as const

export type Subject = typeof SUBJECTS[number]