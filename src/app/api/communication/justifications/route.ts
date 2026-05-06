import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { studentId, studentName, studentClass, date, reason, proofUrls } = body

        if (!studentId || !date || !reason) {
            return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
        }

        const justificationData = {
            studentId,
            studentName,
            studentClass,
            date,
            reason,
            proofUrls: proofUrls || [],
            status: 'pending',
            createdAt: new Date().toISOString()
        }

        const docRef = await db.collection('justifications').add(justificationData)

        return NextResponse.json({
            success: true,
            id: docRef.id
        })
    } catch (error) {
        console.error('Error creating justification:', error)
        return NextResponse.json({ error: 'Nem sikerült létrehozni az igazolást' }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const studentId = searchParams.get('studentId')
        const studentClass = searchParams.get('class')
        const status = searchParams.get('status')

        let query: FirebaseFirestore.Query = db.collection('justifications')

        if (studentId) {
            query = query.where('studentId', '==', studentId)
        } else if (studentClass) {
            query = query.where('studentClass', '==', studentClass)
        }

        if (status) {
            query = query.where('status', '==', status)
        }

        const snapshot = await query.get()
        const justifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).sort((a: any, b: any) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })

        return NextResponse.json(justifications)
    } catch (error: any) {
        console.error('Error fetching justifications:', error)
        return NextResponse.json({
            error: 'Nem sikerült lekérni az igazolásokat',
            details: error?.message
        }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, status, excusedLessonIds } = body

        if (!id || !status) {
            return NextResponse.json({ error: 'Hiányzó azonosító vagy státusz' }, { status: 400 })
        }

        const justificationRef = db.collection('justifications').doc(id)
        const justificationDoc = await justificationRef.get()

        if (!justificationDoc.exists) {
            return NextResponse.json({ error: 'Igazolás nem található' }, { status: 404 })
        }

        const justification = justificationDoc.data()

        await justificationRef.update({
            status,
            excusedLessonIds: excusedLessonIds || [],
            updatedAt: new Date().toISOString()
        })

        if (status === 'approved' || status === 'partial') {
            const date = justification?.date
            const studentId = justification?.studentId

            if (date && studentId) {
                const attendanceSnapshot = await db.collection('attendance')
                    .where('date', '==', date)
                    .get()

                const batch = db.batch()
                let updatesCount = 0

                attendanceSnapshot.docs.forEach(doc => {
                    const data = doc.data()
                    const shouldExcuse =
                        status === 'approved' ||
                        (status === 'partial' && excusedLessonIds?.includes(data.lessonId))

                    if (shouldExcuse) {
                        const updatedStudents = data.students.map((s: any) => {
                            if (s.studentId === studentId) {
                                return { ...s, excused: true }
                            }
                            return s
                        })

                        if (JSON.stringify(updatedStudents) !== JSON.stringify(data.students)) {
                            batch.update(doc.ref, { students: updatedStudents })
                            updatesCount++
                        }
                    }
                })

                if (updatesCount > 0) {
                    await batch.commit()
                }
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating justification:', error)
        return NextResponse.json({ error: 'Nem sikerült frissíteni az igazolást' }, { status: 500 })
    }
}
