import { db } from '@/lib/firebase'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'

export async function notifyParentAboutBehavior(studentId: string, behaviorType: string, description: string) {
  try {
    const parentQuery = query(collection(db, 'parent_children'), where('childId', '==', studentId))
    const parentSnapshot = await getDocs(parentQuery)

    if (parentSnapshot.empty) {
      console.log('Nincs szülő a diákhoz')
      return
    }

    const parentData = parentSnapshot.docs[0].data()
    const parentId = parentData.parentId

    const parentQuery2 = query(collection(db, 'users'), where('uid', '==', parentId))
    const parentSnapshot2 = await getDocs(parentQuery2)

    if (parentSnapshot2.empty) {
      console.log('Szülő nem található')
      return
    }

    const parent = parentSnapshot2.docs[0].data()

    await addDoc(collection(db, 'notifications'), {
      parentId,
      parentEmail: parent.email,
      studentId,
      studentName: parent.childName,
      type: behaviorType,
      description,
      createdAt: new Date().toISOString(),
      read: false
    })

    console.log(`Szülő értesítve: ${parent.email}`)
  } catch (error) {
    console.error('Notification error:', error)
  }
}
