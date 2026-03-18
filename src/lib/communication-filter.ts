import { db } from '@/lib/firebase-admin'

export async function getTeachersForStudent(studentId: string): Promise<string[]> {
  try {
    const snapshot = await db.collection('lessons')
      .where('studentIds', 'array-contains', studentId)
      .get()

    const teacherIds = new Set<string>()
    snapshot.docs.forEach(doc => {
      const teacherId = doc.data().teacherId
      if (teacherId) {
        teacherIds.add(teacherId)
      }
    })

    return Array.from(teacherIds)
  } catch (error) {
    console.error('Error getting teachers for student:', error)
    return []
  }
}

export async function getStudentsForParent(parentId: string): Promise<string[]> {
  try {
    const snapshot = await db.collection('parentChild')
      .where('parentId', '==', parentId)
      .get()

    return snapshot.docs.map(doc => doc.data().childId)
  } catch (error) {
    console.error('Error getting students for parent:', error)
    return []
  }
}

export async function canParentChatWithTeacher(parentId: string, teacherId: string): Promise<boolean> {
  try {
    const students = await getStudentsForParent(parentId)

    for (const studentId of students) {
      const teachers = await getTeachersForStudent(studentId)
      if (teachers.includes(teacherId)) {
        return true
      }
    }

    return false
  } catch (error) {
    console.error('Error checking parent-teacher chat permission:', error)
    return false
  }
}
