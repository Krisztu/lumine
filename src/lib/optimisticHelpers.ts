export const optimisticMusicRequest = (musicUrl: string, platform: string, user: any, student: any) => {
  return {
    id: 'temp-' + Date.now(),
    url: musicUrl,
    platform,
    userId: user.uid,
    userName: student?.Name || user.email,
    userClass: student?.Class || 'N/A',
    title: 'Betöltés...',
    createdAt: new Date().toISOString()
  }
}

export const optimisticGrade = (gradeForm: any, currentUser: any, selectedClass: string) => {
  return {
    id: 'temp-' + Date.now(),
    studentName: gradeForm.student,
    studentClass: selectedClass,
    subject: currentUser?.subject || 'Egyéb',
    grade: gradeForm.grade,
    title: gradeForm.title,
    description: gradeForm.description,
    teacherName: currentUser?.fullName || currentUser?.name,
    date: new Date().toISOString()
  }
}

export const optimisticClassGrades = (grades: any[], title: string, description: string, currentUser: any, selectedClass: string) => {
  return grades.map(g => ({
    id: 'temp-' + Date.now() + '-' + g.studentName,
    studentName: g.studentName,
    studentClass: selectedClass,
    subject: currentUser?.subject || 'Egyéb',
    grade: g.grade,
    title,
    description,
    teacherName: currentUser?.fullName || currentUser?.name,
    date: new Date().toISOString()
  }))
}

export const optimisticAttendance = (lessonId: string, selectedDate: Date, selectedLesson: any, data: any, currentUser: any) => {
  return {
    id: 'temp-' + Date.now(),
    lessonId,
    teacherId: currentUser?.id,
    date: selectedDate.toISOString().split('T')[0],
    startTime: selectedLesson.StartTime,
    subject: selectedLesson.Subject,
    className: selectedLesson.Class,
    topic: data.topic,
    students: data.students
  }
}

export const optimisticHomework = (homeworkForm: any, currentUser: any, selectedClass: string, user: any) => {
  return {
    id: 'temp-' + Date.now(),
    title: homeworkForm.title,
    description: homeworkForm.description,
    dueDate: homeworkForm.dueDate,
    teacherId: currentUser?.id || user?.uid,
    teacherName: currentUser?.fullName || currentUser?.name,
    subject: currentUser?.subject || 'Egyéb',
    className: selectedClass,
    createdAt: new Date().toISOString()
  }
}

export const optimisticSubmission = (selectedHomework: any, content: string, currentUser: any, user: any) => {
  return {
    id: 'temp-' + Date.now(),
    homeworkId: selectedHomework.id,
    studentId: currentUser?.id || user?.uid,
    studentName: currentUser?.fullName || currentUser?.name,
    content,
    submittedAt: new Date().toISOString(),
    status: 'pending'
  }
}

export const optimisticUser = (form: any) => {
  return {
    id: 'temp-' + Date.now(),
    email: form.email,
    fullName: form.fullName,
    role: form.role,
    class: form.class,
    subject: form.subject,
    studentId: form.studentId
  }
}

export const optimisticJustification = (justificationForm: any, currentUser: any, user: any) => {
  return {
    id: 'temp-' + Date.now(),
    studentId: currentUser?.id || user?.uid,
    studentName: currentUser?.fullName || currentUser?.name,
    studentClass: currentUser?.class,
    date: justificationForm.date,
    reason: justificationForm.reason,
    proofUrls: justificationForm.proofUrl ? [justificationForm.proofUrl] : [],
    status: 'pending',
    submittedAt: new Date().toISOString()
  }
}

export const rollbackItem = <T extends { id: string }>(
  items: T[],
  tempId: string,
  originalItem?: T
): T[] => {
  const filtered = items.filter(item => item.id !== tempId)
  return originalItem ? [...filtered, originalItem] : filtered
}
