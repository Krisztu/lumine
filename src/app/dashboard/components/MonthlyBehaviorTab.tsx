'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { Calendar, Star, Heart, Award, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface MonthlyBehaviorTabProps {
  allUsers: any[]
  currentUser: any
  selectedClass: string
  setSelectedClass: (className: string) => void
  showAlert: (message: string, type: 'success' | 'error') => void
}

export function MonthlyBehaviorTab({
  allUsers,
  currentUser,
  selectedClass,
  setSelectedClass,
  showAlert
}: MonthlyBehaviorTabProps) {
  const [monthlyForm, setMonthlyForm] = useState({
    studentId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    szorgalom: 5,
    magatartas: 5,
    megjegyzes: ''
  })

  const [recognitionForm, setRecognitionForm] = useState({
    studentId: '',
    type: 'praise' as 'praise' | 'warning',
    reason: '',
    description: ''
  })

  const [monthlyBehavior, setMonthlyBehavior] = useState<any[]>([])
  const [recognitions, setRecognitions] = useState<any[]>([])

  // Csak az osztályfőnök saját osztályának diákjai
  const students = allUsers.filter(user => 
    (user.role === 'student' || user.role === 'dj') && 
    user.class === currentUser?.class // Csak saját osztályának diákjai
  )

  const classes = [...new Set(allUsers
    .filter(user => user.role === 'student' || user.role === 'dj')
    .map(user => user.class)
    .filter(Boolean)
  )].sort()

  useEffect(() => {
    loadMonthlyBehavior()
    loadRecognitions()
  }, [selectedClass])

  const loadMonthlyBehavior = async () => {
    try {
      const response = await fetch(`/api/behavior/monthly?teacherId=${currentUser?.id}`)
      if (response.ok) {
        const data = await response.json()
        setMonthlyBehavior(data)
      }
    } catch (error) {
      console.log('Havi értékelések betöltése sikertelen')
    }
  }

  const loadRecognitions = async () => {
    try {
      const response = await fetch(`/api/behavior/recognition?teacherId=${currentUser?.id}`)
      if (response.ok) {
        const data = await response.json()
        setRecognitions(data)
      }
    } catch (error) {
      console.log('Dicséret/figyelmeztetés betöltése sikertelen')
    }
  }

  const submitMonthlyBehavior = async () => {
    if (!monthlyForm.studentId) {
      showAlert('Válassz diákot!', 'error')
      return
    }

    // Ellenőrzés: csak osztályfőnök adhat havi értékelést
    if (currentUser?.role !== 'homeroom_teacher') {
      showAlert('Csak osztályfőnök adhat havi értékelést!', 'error')
      return
    }

    // Ellenőrzés: csak saját osztályának diákjainak adhat értékelést
    const student = students.find(s => s.id === monthlyForm.studentId)
    if (!student || student.class !== currentUser?.class) {
      showAlert('Csak saját osztályod diákjainak adhatsz értékelést!', 'error')
      return
    }

    if (!student) return

    try {
      const response = await fetch('/api/behavior/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...monthlyForm,
          studentName: student.fullName || student.name,
          teacherId: currentUser?.id,
          teacherName: currentUser?.fullName || currentUser?.name
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        showAlert('Havi értékelés rögzítve!', 'success')
        setMonthlyForm({
          studentId: '',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          szorgalom: 5,
          magatartas: 5,
          megjegyzes: ''
        })
        loadMonthlyBehavior()
      } else {
        showAlert(result.error || 'Hiba történt', 'error')
      }
    } catch (error) {
      showAlert('Hiba történt', 'error')
    }
  }

  const submitRecognition = async () => {
    if (!recognitionForm.studentId || !recognitionForm.reason) {
      showAlert('Töltsd ki a kötelező mezőket!', 'error')
      return
    }

    const student = students.find(s => s.id === recognitionForm.studentId)
    if (!student) return

    try {
      const response = await fetch('/api/behavior/recognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...recognitionForm,
          studentName: student.fullName || student.name,
          teacherId: currentUser?.id,
          teacherName: currentUser?.fullName || currentUser?.name
        })
      })

      if (response.ok) {
        showAlert(recognitionForm.type === 'praise' ? 'Dicséret rögzítve!' : 'Figyelmeztetés rögzítve!', 'success')
        setRecognitionForm({
          studentId: '',
          type: 'praise',
          reason: '',
          description: ''
        })
        loadRecognitions()
      }
    } catch (error) {
      showAlert('Hiba történt', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Havi értékelés */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Havi Viselkedési Értékelés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Osztály</Label>
              <div className="p-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 text-sm">
                {currentUser?.class || 'Nincs osztály hozzárendelve'}
              </div>
            </div>

            <div>
              <Label>Diák</Label>
              <Select value={monthlyForm.studentId} onValueChange={(value) => setMonthlyForm({...monthlyForm, studentId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Válassz diákot" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.fullName || student.name} ({student.class})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hónap</Label>
                <Select value={monthlyForm.month.toString()} onValueChange={(value) => setMonthlyForm({...monthlyForm, month: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 12}, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(2024, i).toLocaleDateString('hu-HU', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Év</Label>
                <Input 
                  type="number" 
                  value={monthlyForm.year} 
                  onChange={(e) => setMonthlyForm({...monthlyForm, year: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-purple-500" />
                  Szorgalom
                </Label>
                <Select value={monthlyForm.szorgalom.toString()} onValueChange={(value) => setMonthlyForm({...monthlyForm, szorgalom: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(grade => (
                      <SelectItem key={grade} value={grade.toString()}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-indigo-500" />
                  Magatartás
                </Label>
                <Select value={monthlyForm.magatartas.toString()} onValueChange={(value) => setMonthlyForm({...monthlyForm, magatartas: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(grade => (
                      <SelectItem key={grade} value={grade.toString()}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Megjegyzés</Label>
              <Textarea 
                value={monthlyForm.megjegyzes}
                onChange={(e) => setMonthlyForm({...monthlyForm, megjegyzes: e.target.value})}
                placeholder="Opcionális megjegyzés..."
              />
            </div>

            <Button onClick={submitMonthlyBehavior} className="w-full">
              Értékelés Rögzítése
            </Button>
          </CardContent>
        </Card>

        {/* Dicséret/Figyelmeztetés */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Dicséret / Figyelmeztetés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Diák</Label>
              <Select value={recognitionForm.studentId} onValueChange={(value) => setRecognitionForm({...recognitionForm, studentId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Válassz diákot" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.fullName || student.name} ({student.class})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Típus</Label>
              <Select value={recognitionForm.type} onValueChange={(value: 'praise' | 'warning') => setRecognitionForm({...recognitionForm, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="praise">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-green-500" />
                      Dicséret
                    </div>
                  </SelectItem>
                  <SelectItem value="warning">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Figyelmeztetés
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Indoklás</Label>
              <Input 
                value={recognitionForm.reason}
                onChange={(e) => setRecognitionForm({...recognitionForm, reason: e.target.value})}
                placeholder="Rövid indoklás..."
              />
            </div>

            <div>
              <Label>Részletes leírás</Label>
              <Textarea 
                value={recognitionForm.description}
                onChange={(e) => setRecognitionForm({...recognitionForm, description: e.target.value})}
                placeholder="Opcionális részletes leírás..."
              />
            </div>

            <Button onClick={submitRecognition} className="w-full">
              {recognitionForm.type === 'praise' ? 'Dicséret Rögzítése' : 'Figyelmeztetés Rögzítése'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Korábbi értékelések */}
      <Card>
        <CardHeader>
          <CardTitle>Korábbi Értékelések</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyBehavior.length === 0 && recognitions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Még nincsenek értékelések</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {monthlyBehavior.map(mb => (
                  <div key={mb.id} className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{mb.studentName}</span>
                      <span className="text-sm text-gray-500">{mb.month}. hónap {mb.year}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-purple-500" />
                        <span>Szorgalom: {mb.szorgalom}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-indigo-500" />
                        <span>Magatartás: {mb.magatartas}</span>
                      </div>
                    </div>
                    {mb.megjegyzes && (
                      <p className="text-sm text-gray-600 mt-2">{mb.megjegyzes}</p>
                    )}
                  </div>
                ))}
                
                {recognitions.map(rec => (
                  <div key={rec.id} className={`p-4 border rounded-lg ${
                    rec.type === 'praise' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{rec.studentName}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(rec.createdAt).toLocaleDateString('hu-HU')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      {rec.type === 'praise' ? (
                        <Star className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">{rec.reason}</span>
                    </div>
                    {rec.description && (
                      <p className="text-sm text-gray-600">{rec.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}