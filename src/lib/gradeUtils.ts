export const ALL_SUBJECTS = [
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
  'Magatartás',
  'Szorgalom'
]

export function getGradesBySubject(grades: any[]) {
  const gradesBySubject: Record<string, any[]> = {}
  
  ALL_SUBJECTS.forEach(subject => {
    gradesBySubject[subject] = grades.filter(g => g.subject === subject)
  })
  
  return gradesBySubject
}

export function calculateAverage(grades: any[]) {
  if (grades.length === 0) return 0
  return grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length
}
