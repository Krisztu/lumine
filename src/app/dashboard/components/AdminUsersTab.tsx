'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
interface AdminUsersTabProps {
  allUsers: any[]
  availableClasses: any[]
  setAvailableClasses: (classes: any[]) => void
  userSearch: string
  setUserSearch: (search: string) => void
  selectedClass: string
  setSelectedClass: (cls: string) => void
  gradeForm: any
  setGradeForm: (form: any) => void
  loadAllUsers: (role?: string) => Promise<void>
  loadClasses: () => Promise<void>
  showAlert: (msg: string, type?: 'success' | 'error' | 'warning' | 'info', title?: string) => void
}

export function AdminUsersTab({
  allUsers,
  availableClasses,
  setAvailableClasses,
  userSearch,
  setUserSearch,
  selectedClass,
  setSelectedClass,
  gradeForm,
  setGradeForm,
  loadAllUsers,
  loadClasses,
  showAlert
}: AdminUsersTabProps) {
  const [selectedUserType, setSelectedUserType] = useState('')
  const [newClassName, setNewClassName] = useState('')
  const [selectedClassToDelete, setSelectedClassToDelete] = useState('')
  const [userForm, setUserForm] = useState({
    email: '', password: '', fullName: '', subject: '', classes: [] as string[], 
    isHomeroom: false, homeroomClass: '', studentId: '', class: '', isDJ: false,
    phone: '', address: '', childStudentId: '', relationship: ''
  })
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

  const subjects = [
    'Matematika', 'Magyar nyelv és irodalom', 'Történelem', 'Angol nyelv', 'Német nyelv',
    'Biológia', 'Kémia', 'Fizika', 'Földrajz', 'Informatika', 'Testnevelés'
  ]

  const resetForm = () => {
    setUserForm({
      email: '', password: '', fullName: '', subject: '', classes: [], 
      isHomeroom: false, homeroomClass: '', studentId: '', class: '', isDJ: false,
      phone: '', address: '', childStudentId: '', relationship: ''
    })
    setSelectedSubjects([])
  }

  const addNewClass = async () => {
    if (!newClassName.trim()) {
      showAlert('Add meg az osztály nevét!', 'warning')
      return
    }
    
    const className = newClassName.trim()
    
    if (availableClasses.some(cls => cls.name === className)) {
      showAlert('Ez az osztály már létezik!', 'warning')
      return
    }
    
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({ name: className })
      })
      
      if (response.ok) {
        await loadClasses() // Osztályok újratöltése az API-ból
        
        setNewClassName('')
        showAlert(`Új osztály létrehozva: ${className}`, 'success')
      } else {
        const error = await response.json()
        showAlert(`Hiba: ${error.error}`, 'error')
      }
    } catch (error) {
      showAlert('Hiba történt az osztály létrehozása során', 'error')
    }
  }

  const deleteClass = async () => {
    if (!selectedClassToDelete) {
      showAlert('Válassz ki egy osztályt a törléshez!', 'warning')
      return
    }
    
    const studentsInClass = allUsers.filter(user => user.class === selectedClassToDelete)
    
    if (studentsInClass.length > 0) {
      showAlert(`Nem törölhető! Az osztályban ${studentsInClass.length} felhasználó van.`, 'error')
      return
    }
    
    if (!confirm(`Biztosan törlöd a(z) ${selectedClassToDelete} osztályt?`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/classes?name=${encodeURIComponent(selectedClassToDelete)}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': 'admin'
        }
      })
      
      if (response.ok) {
        await loadClasses() // Osztályok újratöltése az API-ból
        setSelectedClassToDelete('')
        
        showAlert(`Osztály törölve: ${selectedClassToDelete}`, 'success')
      } else {
        const error = await response.json()
        showAlert(`Hiba: ${error.error}`, 'error')
      }
    } catch (error) {
      showAlert('Hiba történt az osztály törlése során', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Class Management */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Osztálykezelés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Add Class */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Új osztály neve</label>
                <Input
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="például: 12.C"
                  className="text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addNewClass()}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={addNewClass}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  Hozzáad
                </Button>
              </div>
            </div>
            
            {/* Delete Class */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Osztály törlése</label>
                <select
                  value={selectedClassToDelete}
                  onChange={(e) => setSelectedClassToDelete(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                >
                  <option value="">Válassz osztályt...</option>
                  {availableClasses.map(cls => (
                    <option key={cls.name} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={deleteClass}
                  variant="destructive"
                  size="sm"
                >
                  Töröl
                </Button>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Jelenlegi osztályok ({availableClasses.length}): {availableClasses.map(cls => cls.name).join(', ')}
          </div>
        </CardContent>
      </Card>

      {/* Single User Registration Form */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Felhasználó regisztráció</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fiók típusa</label>
            <select
              value={selectedUserType}
              onChange={(e) => {
                setSelectedUserType(e.target.value)
                resetForm()
              }}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
            >
              <option value="">Válassz fiók típust...</option>
              <option value="teacher">Tanár</option>
              <option value="student">Diák</option>
              <option value="parent">Szülő</option>
              <option value="principal">Igazgató</option>
            </select>
          </div>

          {selectedUserType && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                    placeholder={selectedUserType === 'teacher' ? 'tanar@lumine.edu.hu' : selectedUserType === 'student' ? 'diak@lumine.edu.hu' : selectedUserType === 'parent' ? 'szulo@lumine.edu.hu' : 'igazgato@lumine.edu.hu'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jelszó</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                    placeholder="legalább 6 karakter"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teljes név</label>
                <input
                  type="text"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                  placeholder="Teljes név"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Telefonszám</label>
                  <input
                    type="tel"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                    placeholder="+36 30 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cím</label>
                  <input
                    type="text"
                    value={userForm.address}
                    onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                    placeholder="5600 Békéscsaba, Kossuth Lajos utca 15."
                  />
                </div>
              </div>

              {/* Teacher specific fields */}
              {selectedUserType === 'teacher' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tantárgyak</label>
                    <select
                      onChange={(e) => {
                        const value = e.target.value
                        if (value && !selectedSubjects.includes(value)) {
                          const newSubjects = [...selectedSubjects, value]
                          setSelectedSubjects(newSubjects)
                          setUserForm({ ...userForm, subject: newSubjects.join(', ') })
                        }
                        e.target.value = ''
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                    >
                      <option value="">Válassz tantárgyat...</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                    {selectedSubjects.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedSubjects.map((subject, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded text-xs"
                          >
                            {subject}
                            <button
                              type="button"
                              onClick={() => {
                                const newSubjects = selectedSubjects.filter((_, i) => i !== index)
                                setSelectedSubjects(newSubjects)
                                setUserForm({ ...userForm, subject: newSubjects.join(', ') })
                              }}
                              className="hover:text-red-600"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <input
                      type="checkbox"
                      id="isHomeroom"
                      checked={userForm.isHomeroom}
                      onChange={(e) => setUserForm({ ...userForm, isHomeroom: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="isHomeroom" className="text-sm font-medium cursor-pointer">
                      Osztályfőnök
                    </label>
                  </div>
                  {userForm.isHomeroom && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Osztályfőnöki osztály</label>
                      <select
                        value={userForm.homeroomClass}
                        onChange={(e) => setUserForm({ ...userForm, homeroomClass: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                      >
                        <option value="">Válassz osztályt</option>
                        {availableClasses.map(cls => (
                          <option key={cls.name} value={cls.name}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Student specific fields */}
              {selectedUserType === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Oktatási azonosító</label>
                    <input
                      type="text"
                      value={userForm.studentId}
                      onChange={(e) => setUserForm({ ...userForm, studentId: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                      placeholder="tizenegy számjegy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Osztály</label>
                    <select
                      value={userForm.class}
                      onChange={(e) => setUserForm({ ...userForm, class: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                    >
                      <option value="">Válassz osztályt</option>
                      {availableClasses.map(cls => (
                        <option key={cls.name} value={cls.name}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <input
                      type="checkbox"
                      id="isDJ"
                      checked={userForm.isDJ}
                      onChange={(e) => setUserForm({ ...userForm, isDJ: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="isDJ" className="text-sm font-medium cursor-pointer">
                      DJ szerepkör
                    </label>
                  </div>
                </>
              )}

              {/* Parent specific fields */}
              {selectedUserType === 'parent' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Gyermek OM azonosítója</label>
                      <input
                        type="text"
                        value={userForm.childStudentId}
                        onChange={(e) => setUserForm({ ...userForm, childStudentId: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                        placeholder="például: 12345678901"
                        maxLength={11}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Kapcsolat típusa</label>
                      <select
                        value={userForm.relationship}
                        onChange={(e) => setUserForm({ ...userForm, relationship: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                      >
                        <option value="">Válassz...</option>
                        <option value="anya">Anya</option>
                        <option value="apa">Apa</option>
                        <option value="gyam">Gyám</option>
                        <option value="egyeb">Egyéb</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <Button
                onClick={async () => {
                  const requiredFields = ['email', 'password', 'fullName']
                  if (selectedUserType === 'student') requiredFields.push('studentId')
                  
                  const isValid = requiredFields.every(field => userForm[field as keyof typeof userForm])
                  
                  if (!isValid) {
                    showAlert('Töltsd ki az összes kötelező mezőt!', 'warning')
                    return
                  }

                  try {
                    const payload: any = {
                      email: userForm.email,
                      password: userForm.password,
                      fullName: userForm.fullName
                    }

                    if (selectedUserType === 'teacher') {
                      payload.role = userForm.isHomeroom ? 'homeroom_teacher' : 'teacher'
                      payload.subject = userForm.subject
                      payload.classes = userForm.classes
                      payload.class = userForm.homeroomClass
                    } else if (selectedUserType === 'student') {
                      payload.role = userForm.isDJ ? 'dj' : 'student'
                      payload.studentId = userForm.studentId
                      payload.class = userForm.class || availableClasses[0]?.name
                    } else if (selectedUserType === 'parent') {
                      payload.role = 'parent'
                      payload.childStudentId = userForm.childStudentId
                      payload.relationship = userForm.relationship
                      payload.children = []
                    } else if (selectedUserType === 'principal') {
                      payload.role = 'principal'
                    }

                    // Telefonszám és cím minden felhasználó típushoz
                    payload.phone = userForm.phone
                    payload.address = userForm.address

                    const response = await fetch('/api/auth/register', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload)
                    })

                    if (response.ok) {
                      showAlert(`${selectedUserType === 'teacher' ? 'Tanár' : selectedUserType === 'student' ? 'Diák' : selectedUserType === 'parent' ? 'Szülő' : 'Igazgató'} regisztrálva: ${userForm.fullName}`, 'success')
                      resetForm()
                      setSelectedUserType('')
                      loadAllUsers()
                    } else {
                      const error = await response.json()
                      showAlert(`Hiba: ${error.error || 'Ismeretlen hiba'}`, 'error')
                    }
                  } catch (error) {
                    showAlert('Hiba történt', 'error')
                  }
                }}
                className={`w-full flex items-center justify-center gap-2 ${
                  selectedUserType === 'teacher' ? 'bg-green-600 hover:bg-green-700' :
                  selectedUserType === 'student' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  selectedUserType === 'parent' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  'bg-orange-600 hover:bg-orange-700'
                }`}
                size="sm"
              >
                
                {selectedUserType === 'teacher' ? 'Tanár' : selectedUserType === 'student' ? 'Diák' : selectedUserType === 'parent' ? 'Szülő' : 'Igazgató'} regisztrálása
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* User Management */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Felhasználók kezelése</CardTitle>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Keresés név vagy email alapján..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full"
            />
            <div className="flex gap-4">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
              >
                <option value="">Összes osztály</option>
                {availableClasses.map(cls => (
                  <option key={cls.name} value={cls.name}>{cls.name}</option>
                ))}
              </select>
              <select
                value={gradeForm.student}
                onChange={(e) => setGradeForm({ ...gradeForm, student: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
              >
                <option value="">Összes szerepkör</option>
                <option value="admin">Admin</option>
                <option value="principal">Igazgató</option>
                <option value="teacher">Tanár</option>
                <option value="homeroom_teacher">Osztályfőnök</option>
                <option value="parent">Szülő</option>
                <option value="student">Diák</option>
                <option value="dj">DJ</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allUsers.filter(user => {
              const matchesClass = !selectedClass || user.class === selectedClass
              const matchesRole = !gradeForm.student || user.role === gradeForm.student ||
                (gradeForm.student === 'teacher' && user.role === 'homeroom_teacher')
              const matchesSearch = !userSearch ||
                (user.fullName || user.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                (user.email || '').toLowerCase().includes(userSearch.toLowerCase())
              return matchesClass && matchesRole && matchesSearch
            })
              .sort((a, b) => (a.fullName || a.name || '').localeCompare(b.fullName || b.name || ''))
              .map((user, index) => (
                <div key={user.id || index} className={`flex items-center justify-between p-4 rounded-lg ${user.id ? 'bg-primary/10 border border-primary/20' : 'glass-panel'
                  }`}>
                  <div>
                    <h3 className="font-semibold">{user.fullName || user.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    {user.phone && <p className="text-xs text-gray-500 dark:text-gray-500">Tel: {user.phone}</p>}
                    {user.address && <p className="text-xs text-gray-500 dark:text-gray-500">Cím: {user.address}</p>}
                    {user.studentId && <p className="text-xs text-gray-500 dark:text-gray-500">ID: {user.studentId}</p>}
                    {user.class && <p className="text-xs text-emerald-600 dark:text-emerald-400">Osztály: {user.class}</p>}
                    {user.subject && <p className="text-xs text-green-600 dark:text-green-400">Tantárgy: {user.subject}</p>}
                    <p className="text-xs text-gray-400">Firebase ID: {user.id || 'Nincs ID'}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'principal' ? 'bg-orange-100 text-orange-800' :
                        user.role === 'teacher' ? 'bg-emerald-100 text-emerald-800' :
                          user.role === 'homeroom_teacher' ? 'bg-emerald-100 text-emerald-800' :
                            user.role === 'parent' ? 'bg-pink-100 text-pink-800' :
                              user.role === 'dj' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                      }`}>
                      {user.role === 'admin' ? 'Admin' :
                        user.role === 'principal' ? 'Igazgató' :
                          user.role === 'teacher' ? 'Tanár' :
                            user.role === 'homeroom_teacher' ? 'Osztályfőnök' :
                              user.role === 'parent' ? 'Szülő' :
                                user.role === 'dj' ? 'DJ' : 'Diák'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <select
                      value={user.class || ''}
                      onChange={async (e) => {
                        const newClass = e.target.value
                        if (user.id) {
                          try {
                            const response = await fetch('/api/users', {
                              method: 'PUT',
                              headers: { 
                                'Content-Type': 'application/json',
                                'x-user-role': 'admin'
                              },
                              body: JSON.stringify({
                                id: user.id,
                                class: newClass
                              })
                            })

                            if (response.ok) {
                              showAlert(`${user.fullName || user.name} áthelyezve: ${newClass}`, 'success')
                              loadAllUsers()
                            } else {
                              const error = await response.json()
                              showAlert(`Hiba: ${error.error || 'Ismeretlen hiba'}`, 'error')
                            }
                          } catch (error) {
                            showAlert('Hiba történt a módosítás során', 'error')
                          }
                        } else {
                          showAlert('Csak dinamikus felhasználók módosíthatók', 'warning')
                        }
                      }}
                      className="px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">Osztály</option>
                      {availableClasses.map(cls => (
                        <option key={cls.name} value={cls.name}>{cls.name}</option>
                      ))}
                    </select>
                    <select
                      value={user.role}
                      onChange={async (e) => {
                        const newRole = e.target.value
                        
                        // Védelem: utolsó admin szerepkörét nem lehet megváltoztatni
                        const adminCount = allUsers.filter(u => u.role === 'admin').length
                        if (user.role === 'admin' && adminCount <= 1 && newRole !== 'admin') {
                          showAlert('Az utolsó admin szerepköre nem változtatható meg!', 'error')
                          return
                        }
                        
                        if (user.id) {
                          try {
                            const response = await fetch('/api/users', {
                              method: 'PUT',
                              headers: { 
                                'Content-Type': 'application/json',
                                'x-user-role': 'admin'
                              },
                              body: JSON.stringify({
                                id: user.id,
                                role: newRole
                              })
                            })

                            if (response.ok) {
                              showAlert(`${user.fullName || user.name} szerepköre megváltoztatva: ${newRole}`, 'success')
                              loadAllUsers()
                            } else {
                              const error = await response.json()
                              showAlert(`Hiba: ${error.error || 'Ismeretlen hiba'}`, 'error')
                            }
                          } catch (error) {
                            showAlert('Hiba történt a módosítás során', 'error')
                          }
                        } else {
                          showAlert('Csak dinamikus felhasználók módosíthatók', 'warning')
                        }
                      }}
                      className="px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="student">Diák</option>
                      <option value="teacher">Tanár</option>
                      <option value="homeroom_teacher">Osztályfőnök</option>
                      <option value="dj">DJ</option>
                      <option value="parent">Szülő</option>
                      <option value="principal">Igazgató</option>
                      <option value="admin">Admin</option>
                    </select>
                    {user.id && user.role !== 'admin' && (
                      <button
                        onClick={async () => {
                          // Védelem: utolsó admin nem törölhető
                          const adminCount = allUsers.filter(u => u.role === 'admin').length
                          if (user.role === 'admin' && adminCount <= 1) {
                            showAlert('Az utolsó admin felhasználó nem törölhető!', 'error')
                            return
                          }
                          
                          if (confirm(`Biztosan törlöd ${user.fullName || user.name} felhasználót?\\n\\nID: ${user.id}\\n\\nEz véglegesen törli a felhasználót a Firebase adatbázisból is!`)) {
                            try {
                              const response = await fetch(`/api/users?id=${encodeURIComponent(user.id)}`, {
                                method: 'DELETE',
                                headers: {
                                  'x-user-role': 'admin'
                                }
                              })

                              if (response.ok) {
                                showAlert(`${user.fullName || user.name} felhasználó sikeresen törölve a Firebase adatbázisból`, 'success')
                                loadAllUsers()
                              } else {
                                const error = await response.json()
                                showAlert(`Hiba: ${error.error || 'Törlés sikertelen'}`, 'error')
                              }
                            } catch (error) {
                              showAlert('Hiba történt a törlés során', 'error')
                            }
                          }
                        }}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      >
                        Törlés
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
