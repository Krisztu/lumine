'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useState, useEffect } from 'react'

interface ProfileTabProps {
  currentUser: any
  user: any
  userRole: string
  grades: any[]
  loading: boolean
  handleProfileImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  loadLessons: (user: any) => Promise<void>
  loadAttendance: () => Promise<void>
}

export function ProfileTab({
  currentUser,
  user,
  userRole,
  grades,
  loading,
  handleProfileImageUpload,
  loadLessons,
  loadAttendance
}: ProfileTabProps) {
  const [child, setChild] = useState<any>(null)

  useEffect(() => {
    if (currentUser?.role === 'parent') {
      loadChildData()
    }
  }, [currentUser])

  const loadChildData = async () => {
    try {
      if (!user?.email) return
      
      const parentRes = await fetch(`/api/users?email=${encodeURIComponent(user.email)}&cache=false`, {
        cache: 'no-store'
      })

      if (parentRes.ok) {
        const parentData = await parentRes.json()
        if (parentData.length > 0) {
          const parentId = parentData[0].id
          
          const childrenRes = await fetch(`/api/parent-child?parentId=${parentId}`, {
            cache: 'no-store'
          })
          if (childrenRes.ok) {
            const childrenData = await childrenRes.json()
            if (childrenData.length > 0) {
              setChild(childrenData[0])
            }
          }
        }
      }
    } catch (error) {
      console.error('Child data load error:', error)
    }
  }
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'from-red-500 via-red-600 to-red-700'
      case 'homeroom_teacher': return 'from-emerald-500 via-teal-600 to-emerald-700'
      case 'teacher': return 'from-emerald-500 via-cyan-600 to-emerald-700'
      case 'dj': return 'from-yellow-500 via-yellow-600 to-orange-600'
      default: return 'from-emerald-500 via-emerald-600 to-emerald-700'
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      'admin': 'Adminisztrátor',
      'teacher': 'Tanár',
      'homeroom_teacher': 'Osztályfőnök',
      'dj': 'DJ',
      'student': 'Diák',
      'principal': 'Igazgató',
      'parent': 'Szülő'
    }
    return labels[role] || role
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/30 border border-red-300/50'
      case 'homeroom_teacher': return 'bg-emerald-500/30 border border-emerald-300/50'
      case 'teacher': return 'bg-emerald-500/30 border border-emerald-300/50'
      case 'dj': return 'bg-yellow-500/30 border border-yellow-300/50'
      default: return 'bg-emerald-500/30 border border-emerald-300/50'
    }
  }

  const getRoleDotColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-300'
      case 'homeroom_teacher': return 'bg-emerald-300'
      case 'teacher': return 'bg-emerald-300'
      case 'dj': return 'bg-yellow-300'
      default: return 'bg-emerald-300'
    }
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="max-w-4xl mx-auto">
        <div className={`relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br ${getRoleColor(userRole)}`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative p-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold overflow-hidden border-4 border-white/30 shadow-2xl">
                  {currentUser?.profileImage ? (
                    <img
                      src={currentUser.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (currentUser?.name || currentUser?.fullName || user?.email || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer rounded-full hover:bg-black/60">
                  
                  <span className="sr-only">Kép feltöltése</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                  />
                </label>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{currentUser?.name || currentUser?.fullName || 'Felhasználó'}</h1>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getRoleBadgeColor(userRole)}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${getRoleDotColor(userRole)}`}></div>
                  {getRoleLabel(userRole)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mt-4 sm:mt-8">
          {currentUser?.role === 'parent' && child && (
            <Card className="glass-card border-0 shadow-lg md:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-800 dark:text-white">Gyermek adatai</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{child.childName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{child.childClass} • OM: {child.childStudentId}</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className={`glass-card border-0 shadow-lg ${currentUser?.role === 'student' ? '' : 'md:col-span-2'}`}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-800 dark:text-white">Személyes adatok</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Teljes név</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{currentUser?.name || currentUser?.fullName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email cím</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{user?.email}</p>
                    </div>
                  </div>
                  {currentUser?.studentId && (
                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-4 0V5a2 2 0 014 0v1" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Oktatási azonosító</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{currentUser.studentId}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Telefonszám</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{currentUser?.phone || 'Nincs megadva'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Cím</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{currentUser?.address || 'Nincs megadva'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {currentUser?.role === 'student' && (
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-800 dark:text-white">Tanulmányi adatok</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentUser?.class && (
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Osztály</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{currentUser.class}</p>
                    </div>
                  </div>
                )}

                {grades && grades.length > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Összátlag</p>
                      <p className={`font-bold text-lg ${(grades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / grades.length) >= 4 ? 'text-green-600' :
                        (grades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / grades.length) >= 3 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {(grades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / grades.length).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentUser?.role === 'admin' && (
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-800 dark:text-white">Adatbázis kezelés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Adatbázis kezelés</h3>
                  <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                    <strong>Adatbázis tisztítása:</strong> Törli az összes felhasználót, órát, jegyet, mulasztást és egyéb adatot. Alap állapotba állítja a rendszert.
                  </p>
                  <button
                    onClick={async () => {
                      if (confirm('FIGYELEM!\n\nEz törli az ÖSSZES adatot az adatbázisból:\n- Felhasználók\n- Órák\n- Jegyek\n- Mulasztások\n- Házi feladatok\n- Üzenetek\n- Minden egyéb adat\n\nBiztosan folytatod?')) {
                        if (confirm('UTOLSÓ FIGYELMEZTETÉS!\n\nEz a művelet visszavonhatatlan!\n\nTisztítod az egész adatbázist?')) {
                          try {
                            const response = await fetch('/api/admin/clear', {
                              method: 'DELETE',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ fullReset: true })
                            })

                            if (response.ok) {
                              const result = await response.json()
                              alert(`Adatbázis tisztítva!\n\nTörölt elemek: ${result.totalDeleted}\n\nA rendszer alap állapotban van.`)
                              window.location.reload()
                            } else {
                              const error = await response.json()
                              alert(`Hiba: ${error.error || 'Tisztítás sikertelen'}`)
                            }
                          } catch (error) {
                            alert('Hiba történt a tisztítás során')
                          }
                        }
                      }
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 font-medium"
                  >
                    🗑️ Adatbázis tisztítása
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
