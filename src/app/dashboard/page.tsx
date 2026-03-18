'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { CustomAlert } from '@/shared/components/ui/custom-alert'
import { DashboardHeader } from './components/DashboardHeader'
import { AdminDashboard } from './components/AdminDashboard'
import { StudentDashboard } from './components/StudentDashboard'
import { ParentDashboard } from './components/ParentDashboard'
import { PrincipalDashboard } from './components/NewPrincipalDashboard'
import { ScheduleTab } from './components/ScheduleTab'
import { GradesTab } from './components/GradesTab'
import { TeacherGradesTab } from './components/TeacherGradesTab'
import { ClassGradeModal } from './components/ClassGradeModal'
import { ChartModal } from './components/ChartModal'
import { RadioTab } from './components/RadioTab'
import { ChatTab } from './components/ChatTab'
import { QRTab } from './components/QRTab'
import { AttendanceTab } from './components/AttendanceTab'
import { ExcusesTab } from './components/ExcusesTab'
import { StudentExcusesTab } from './components/StudentExcusesTab'
import { HomeworkTab } from './components/HomeworkTab'
import { TeacherHomeworkTab } from './components/TeacherHomeworkTab'
import { HomeworkModal } from './components/HomeworkModal'
import { SubmissionModal } from './components/SubmissionModal'
import { AdminScheduleTab } from './components/AdminScheduleTab'
import { AdminGradesTab } from './components/AdminGradesTab'
import { AdminUsersTab } from './components/AdminUsersTab'
import { AdminStatisticsTab } from './components/AdminStatisticsTab'
import { ProfileTab } from './components/ProfileTab'
import { HomeRoomTeacherDashboard } from './components/HomeRoomTeacherDashboard'
import { HomeRoomTeacherExcusesTab } from './components/HomeRoomTeacherExcusesTab'
import { AttendanceModal } from './components/AttendanceModal'
import { TeacherBehaviorTab } from './components/TeacherBehaviorTab'
import { PrincipalBehaviorTab } from './components/PrincipalBehaviorTab'
import { BehaviorGradingTab } from './components/BehaviorGradingTab'
import { Home, CalendarDays, BarChart3, ClipboardList, FileText, CheckCircle, Radio, MessageSquare, Smartphone, Users, AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState('student')
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [cookieConsent, setCookieConsent] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [alertData, setAlertData] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({ isOpen: false, title: '', message: '', type: 'info' })

  const [grades, setGrades] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [musicRequests, setMusicRequests] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [qrCode, setQrCode] = useState<string>('')
  const [qrType, setQrType] = useState<'entry' | 'exit'>('entry')
  const [homework, setHomework] = useState<any[]>([])
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<any>({})
  const [attendance, setAttendance] = useState<any[]>([])
  const [excuses, setExcuses] = useState<any[]>([])
  const [justifications, setJustifications] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [availableClasses, setAvailableClasses] = useState<any[]>([])
  const [parents, setParents] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(() => {
    // Mindig a mai napra állítjuk be alapértelmezetten
    return new Date()
  })
  const [currentWeek, setCurrentWeek] = useState(0)
  const [activeTab, setActiveTab] = useState('dashboard')

  const [teacherSearch, setTeacherSearch] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [homeworkForm, setHomeworkForm] = useState<{ title: string; description: string; dueDate: string; lessonId: string; attachments: string[] }>({ title: '', description: '', dueDate: '', lessonId: '', attachments: [] })
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedAbsences, setSelectedAbsences] = useState<any[]>([])
  const [excuseForm, setExcuseForm] = useState<{ absenceIds: string[]; excuseType: string; description: string }>({ absenceIds: [], excuseType: '', description: '' })
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<any>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [showChartModal, setShowChartModal] = useState(false)
  const [gradeForm, setGradeForm] = useState<{ student: string; grade: string; title: string; description: string }>({ student: '', grade: '', title: '', description: '' })
  const [musicUrl, setMusicUrl] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [expandedDates, setExpandedDates] = useState<{ [key: string]: boolean }>({})
  const [selectedHomework, setSelectedHomework] = useState<any>(null)
  const [showHomeworkModal, setShowHomeworkModal] = useState(false)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [attendanceForm, setAttendanceForm] = useState<{ topic: string; students: any[] }>({ topic: '', students: [] })
  const [showClassGradeModal, setShowClassGradeModal] = useState(false)

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string) => {
    setAlertData({ isOpen: true, title: title || 'Értesítés', message, type })
  }

  // Osztályok betöltése API-ból
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await fetch('/api/classes?cache=false&t=' + Date.now())
        if (response.ok) {
          const classes = await response.json()
          setAvailableClasses(classes)
        }
      } catch (error) {
        console.log('Osztályok betöltése sikertelen')
        // Fallback localStorage-ból
        const savedClasses = localStorage.getItem('availableClasses')
        if (savedClasses) {
          try {
            const parsedClasses = JSON.parse(savedClasses)
            if (Array.isArray(parsedClasses) && parsedClasses.length > 0) {
              setAvailableClasses(parsedClasses)
            }
          } catch (error) {
            console.log('Hiba az osztályok betöltésénél')
          }
        }
      }
    }
    loadClasses()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000)
    return () => clearInterval(timer)
  }, [])

  // Ha órarend tabra váltanak, mindig a mai napra állítjuk
  useEffect(() => {
    if (activeTab === 'schedule' || activeTab === 'admin-schedule' || activeTab === 'parent-schedule') {
      const today = new Date()
      setSelectedDate(today)
      setCurrentWeek(0) // És az aktuális hétre is
    }
  }, [activeTab])

  useEffect(() => {
    if (!user && !loading) {
      router.push('/')
      return
    }

    const consent = localStorage.getItem('cookieConsent')
    if (consent === 'true') {
      setCookieConsent(true)
      const savedDarkMode = localStorage.getItem('darkMode')
      if (savedDarkMode !== null) {
        const isDark = savedDarkMode === 'true'
        setDarkMode(isDark)
        document.documentElement.classList.toggle('dark', isDark)
      } else {
        // Alapértelmezett sötét mód
        setDarkMode(true)
        document.documentElement.classList.add('dark')
        localStorage.setItem('darkMode', 'true')
      }
    } else {
      // Ha nincs cookie consent, akkor is alapértelmezett sötét mód
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }

    let isMounted = true
    const initData = async () => {
      if (!isMounted) return
      await loadUserData()
      if (isMounted) {
        // Párhuzamos betöltés optimalizálása
        const promises = [
          loadMusicRequests(),
          loadChatMessages(),
          generateUserQR(),
          setupUserRoles()
        ]
        await Promise.allSettled(promises) // allSettled használata, hogy egy hiba ne akadályozza meg a többit
      }
    }
    initData()

    const chatInterval = setInterval(() => {
      if (isMounted) loadChatMessages()
    }, 60000)

    return () => {
      isMounted = false
      clearInterval(chatInterval)
    }
  }, [user, router])

  useEffect(() => {
    if (currentUser) {
      const loadData = async () => {
        await Promise.all([
          loadGrades(currentUser),
          loadLessons(currentUser),
          loadHomework(),
          loadAttendance()
        ])
        if (currentUser.role === 'homeroom_teacher' || currentUser.role === 'student' || currentUser.role === 'dj') {
          await Promise.all([loadExcuses(), loadJustifications()])
        }
        if (currentUser.role === 'student' || currentUser.role === 'dj') {
          await loadParents()
        }
      }
      loadData()
    }
  }, [selectedDate, currentUser, user])

  const loadUserData = async () => {
    if (!user) return
    try {
      const email = user.email || ''
      const response = await fetch(`/api/users?email=${encodeURIComponent(email)}&cache=false&t=${Date.now()}`, {
        cache: 'no-store'
      })
      if (response.ok) {
        const users = await response.json()
        const userData = users[0]
        if (userData) {
          setCurrentUser(userData)
          setUserRole(userData.role === 'homeroom_teacher' ? 'teacher' : userData.role)
          if (userData.role === 'admin' || userData.role === 'teacher' || userData.role === 'homeroom_teacher' || userData.role === 'principal') {
            await loadAllUsers(userData.role === 'homeroom_teacher' ? 'teacher' : userData.role, userData)
          }
        }
      }
    } catch (error) {
      console.log('Adatbetöltés hiba')
    } finally {
      setLoading(false)
    }
  }

  const loadMusicRequests = async () => {
    try {
      const response = await fetch('/api/music?limit=10&cache=true')
      if (response.ok) {
        const data = await response.json()
        setMusicRequests(data)
      }
    } catch (error) {
      console.log('Zene kérések betöltése sikertelen')
    }
  }

  const loadChatMessages = async () => {
    try {
      const response = await fetch('/api/communication/chat')
      if (response.ok) {
        const data = await response.json()
        setChatMessages(data)
      } else {
        console.log('Chat API error:', response.status)
        setChatMessages([])
      }
    } catch (error) {
      console.log('Üzenetek betöltése sikertelen:', error)
      setChatMessages([])
    }
  }

  const generateUserQR = async (action?: 'entry' | 'exit') => {
    if (!user) return
    try {
      const qrAction = action || qrType
      const qrData = `${window.location.origin}/qr-scan?student=${user.uid}&action=${qrAction}`
      const QRCode = (await import('qrcode')).default
      const qrCodeUrl = await QRCode.toDataURL(qrData)
      setQrCode(qrCodeUrl)
      setQrType(qrAction)
    } catch (error) {
      console.log('QR kód generálás sikertelen', error)
    }
  }

  const setupUserRoles = async () => {
    try {
      await fetch('/api/admin/set-roles', { method: 'POST' })
    } catch (error) {
      console.log('Szerepkör beállítás sikertelen')
    }
  }

  const loadGrades = async (userData: any) => {
    try {
      let url = '/api/academic/grades'
      const headers = {
        'x-user-role': userData?.role || 'student',
        'x-user-id': userData?.id || user?.uid || '',
        'x-user-email': userData?.email || user?.email || ''
      }
      
      if (userData?.role === 'student' || userData?.role === 'dj') {
        const studentName = userData.fullName || userData.name
        if (!studentName) return
        url += `?student=${encodeURIComponent(studentName)}`
      } else if (userData?.role === 'teacher' || userData?.role === 'homeroom_teacher') {
        const teacherName = userData.fullName || userData.name
        if (!teacherName) return
        url += `?teacherName=${encodeURIComponent(teacherName)}`
      } else if (userData?.role === 'admin') {
        // Admin látja az összes jegyet
        // url marad /api/academic/grades paraméterek nélkül
      } else {
        return
      }
      
      const response = await fetch(url, { headers })
      if (response.ok) {
        const gradesData = await response.json()
        gradesData.sort((a: any, b: any) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())
        setGrades(gradesData)
      }
    } catch (error) {
      console.log('Jegyek betöltése sikertelen')
    }
  }

  const loadLessons = async (userData: any) => {
    try {
      let url = '/api/academic/lessons'
      const userId = userData?.id || user?.email
      if (!userId) return
      url += `?userId=${encodeURIComponent(userId)}`

      const headers = {
        'x-user-role': userData?.role || 'student',
        'x-user-id': userData?.id || user?.uid || '',
        'x-user-email': userData?.email || user?.email || ''
      }

      const response = await fetch(url, { headers })
      if (response.ok) {
        const lessonsData = await response.json()
        const formattedLessons = lessonsData.map((lesson: any) => ({
          Day: lesson.day,
          StartTime: lesson.startTime,
          Subject: lesson.subject,
          Teacher: lesson.teacherName,
          Class: lesson.className,
          Room: lesson.room,
          status: 'normal',
          userId: lesson.userId
        }))
        setLessons(formattedLessons)
      }
    } catch (error) {
      console.log('Órák betöltése sikertelen')
    }
  }

  const loadAllUsers = async (currentRole?: string, userData?: any) => {
    try {
      const roleToCheck = currentRole || userRole
      if (roleToCheck === 'student' || roleToCheck === 'dj') return

      const response = await fetch('/api/users?cache=false&t=' + Date.now(), {
        headers: {
          'x-user-role': roleToCheck === 'homeroom_teacher' ? 'teacher' : roleToCheck,
          'x-user-id': userData?.id || currentUser?.id || user?.uid || '',
          'x-user-email': userData?.email || currentUser?.email || user?.email || ''
        }
      })
      if (response.ok) {
        const users = await response.json()
        setAllUsers(users)
        
        if (roleToCheck === 'teacher' || roleToCheck === 'homeroom_teacher') {
          const userId = userData?.id || currentUser?.id || user?.email
          if (!userId) return
          const lessonsResponse = await fetch(`/api/academic/lessons?userId=${encodeURIComponent(userId)}`, {
            headers: {
              'x-user-role': roleToCheck,
              'x-user-id': userData?.id || currentUser?.id || user?.uid || '',
              'x-user-email': userData?.email || currentUser?.email || user?.email || ''
            }
          })
          if (lessonsResponse.ok) {
            const lessons = await lessonsResponse.json()
            const teacherClasses = [...new Set(lessons.map((l: any) => l.className))]
            setAvailableClasses(teacherClasses.sort().map(name => ({ name })))
          }
        } else {
          // Admin esetében ne írjuk felül az API-ból betöltött osztályokat
          // Csak akkor frissítsük, ha még nincsenek osztályok betöltve
          if (availableClasses.length === 0) {
            const classes = Array.from(new Set(users.filter((u: any) => u.class).map((u: any) => u.class)))
            if (classes.length > 0) {
              setAvailableClasses(classes.sort().map(name => ({ name })))
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load all users:', error)
      setAllUsers([])
    }
  }

  const loadAttendance = async () => {
    if (!currentUser) return
    try {
      let url = '/api/academic/attendance'
      const headers = {
        'x-user-role': currentUser.role,
        'x-user-id': currentUser.id || user?.uid || '',
        'x-user-email': currentUser.email || user?.email || ''
      }
      
      if (currentUser.role === 'teacher' || currentUser.role === 'homeroom_teacher') {
        const teacherId = currentUser.id || user?.uid
        if (!teacherId) return
        url += `?teacherId=${encodeURIComponent(teacherId)}`
      } else if (currentUser.role === 'student' || currentUser.role === 'dj') {
        const studentId = currentUser.id || user?.uid
        if (!studentId) return
        url += `?studentId=${encodeURIComponent(studentId)}`
      }
      const response = await fetch(url, { headers })
      if (response.ok) {
        const data = await response.json()
        setAttendance(data)
      }
    } catch (error) {
      console.log('Mulasztások betöltése sikertelen')
    }
  }

  const loadExcuses = async () => {
    if (!currentUser) return
    try {
      let url = '/api/communication/excuses'
      if (currentUser.role === 'homeroom_teacher') {
        if (!currentUser.class) return
        url += `?classTeacher=${encodeURIComponent(currentUser.class)}`
      } else if (currentUser.role === 'student' || currentUser.role === 'dj') {
        const studentId = currentUser.id || user?.uid
        if (!studentId) return
        url += `?studentId=${encodeURIComponent(studentId)}`
      }
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setExcuses(data)
      }
    } catch (error) {
      console.log('Igazolások betöltése sikertelen')
    }
  }

  const loadHomework = async () => {
    if (!currentUser) return
    try {
      let url = '/api/academic/homework'
      const headers = {
        'x-user-role': currentUser.role,
        'x-user-id': currentUser.id || user?.uid || '',
        'x-user-email': currentUser.email || user?.email || ''
      }
      
      if (currentUser.role === 'student' || currentUser.role === 'dj') {
        if (!currentUser.class) return
        url += `?class=${encodeURIComponent(currentUser.class)}&studentId=${encodeURIComponent(currentUser.id || user?.uid)}`
        const response = await fetch(url, { headers })
        if (response.ok) {
          const data = await response.json()
          setHomework(data.homework || [])
          setHomeworkSubmissions(data.submissions || {})
        }
      } else if (currentUser.role === 'teacher' || currentUser.role === 'homeroom_teacher') {
        const teacherId = currentUser.id || user?.uid || user?.email
        if (!teacherId) return
        url += `?teacherId=${encodeURIComponent(teacherId)}`
        const response = await fetch(url, { headers })
        if (response.ok) {
          const data = await response.json()
          setHomework(Array.isArray(data) ? data : [])
        }
      }
    } catch (error) {
      console.log('Házi feladatok betöltése sikertelen')
    }
  }

  const loadJustifications = async () => {
    if (!currentUser) return
    try {
      let url = '/api/communication/justifications'
      if (currentUser.role === 'student') {
        const studentId = currentUser.id || user?.uid
        if (!studentId) return
        url += `?studentId=${studentId}`
      } else if (currentUser.role === 'homeroom_teacher') {
        const classVal = currentUser.class || currentUser.classes?.[0]
        if (!classVal) return
        url += `?class=${classVal}`
      }
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setJustifications(data)
      }
    } catch (error) {
      console.error('Failed to load justifications')
    }
  }

  const loadParents = async () => {
    if (!currentUser?.id && !user?.uid) return
    try {
      const studentId = currentUser?.id || user?.uid
      if (!studentId) return
      const response = await fetch(`/api/parent-child?studentId=${encodeURIComponent(studentId)}`)
      if (response.ok) {
        const parentsData = await response.json()
        setParents(parentsData)
      }
    } catch (error) {
      console.log('Szülők betöltése sikertelen')
    }
  }

  const loadClasses = async () => {
    try {
      const response = await fetch('/api/classes?cache=false&t=' + Date.now())
      if (response.ok) {
        const classes = await response.json()
        setAvailableClasses(classes)
      }
    } catch (error) {
      console.log('Osztályok betöltése sikertelen')
    }
  }

  const handleLogout = async () => {
    try {
      // Kikapcsoljuk az automatikus redirect-et
      setLoading(true)
      await logout()
      // Kényszerített átirányítás
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/'
    }
  }

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const { uploadToCloudinary } = await import('@/lib/cloudinary')
      const imageUrl = await uploadToCloudinary(file)
      
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'student',
          'x-user-id': currentUser?.id || user?.uid || '',
          'x-user-email': currentUser?.email || user?.email || ''
        },
        body: JSON.stringify({
          id: currentUser?.id,
          profileImage: imageUrl
        }),
      })

      if (response.ok) {
        setCurrentUser(prev => prev ? { ...prev, profileImage: imageUrl } : null)
        showAlert('Profilkép sikeresen frissítve!', 'success')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Adatbázis frissítés sikertelen')
      }
    } catch (error) {
      console.error('Profile upload error:', error)
      showAlert('Hiba a profilkép feltöltése során', 'error')
    }
  }

  if (!user) return null

  const tabTriggers = {
    admin: [
      { value: 'dashboard', label: 'Főoldal', icon: Home },
      { value: 'admin-schedule', label: 'Órarend', icon: CalendarDays },
      { value: 'admin-grades', label: 'Jegyek', icon: BarChart3 },
      { value: 'admin-users', label: 'Felhasználók', icon: Users },
      { value: 'admin-statistics', label: 'Statisztikák', icon: BarChart3 },
      { value: 'radio', label: 'Rádió', icon: Radio },
      { value: 'chat', label: 'Üzenőfal', icon: MessageSquare },
      { value: 'profile', label: 'Profil', icon: Users }
    ],
    student: [
      { value: 'dashboard', label: 'Főoldal', icon: Home },
      { value: 'schedule', label: 'Órarend', icon: CalendarDays },
      { value: 'grades', label: 'Jegyek', icon: BarChart3 },
      { value: 'absences', label: 'Mulasztások', icon: ClipboardList },
      { value: 'homework', label: 'Házifeladat', icon: FileText },
      { value: 'radio', label: 'Rádió', icon: Radio },
      { value: 'chat', label: 'Üzenőfal', icon: MessageSquare },
      { value: 'qr', label: 'QR', icon: Smartphone },
      { value: 'profile', label: 'Profil', icon: Users }
    ],
    teacher: [
      { value: 'dashboard', label: 'Főoldal', icon: Home },
      { value: 'schedule', label: 'Órarend', icon: CalendarDays },
      { value: 'teacher-grades', label: 'Jegyek', icon: BarChart3 },
      { value: 'teacher-absences', label: 'Mulasztások', icon: ClipboardList },
      { value: 'teacher-homework', label: 'Házifeladat', icon: FileText },
      { value: 'teacher-behavior', label: 'Viselkedés', icon: AlertCircle },
      { value: 'radio', label: 'Rádió', icon: Radio },
      { value: 'chat', label: 'Üzenőfal', icon: MessageSquare },
      { value: 'profile', label: 'Profil', icon: Users }
    ],
    homeroom_teacher: [
      { value: 'dashboard', label: 'Főoldal', icon: Home },
      { value: 'schedule', label: 'Órarend', icon: CalendarDays },
      { value: 'teacher-grades', label: 'Jegyek', icon: BarChart3 },
      { value: 'teacher-absences', label: 'Mulasztások', icon: ClipboardList },
      { value: 'teacher-homework', label: 'Házifeladat', icon: FileText },
      { value: 'teacher-behavior', label: 'Viselkedés', icon: AlertCircle },
      { value: 'class-excuses', label: 'Igazolások', icon: CheckCircle },
      { value: 'radio', label: 'Rádió', icon: Radio },
      { value: 'chat', label: 'Üzenőfal', icon: MessageSquare },
      { value: 'profile', label: 'Profil', icon: Users }
    ],
    parent: [
      { value: 'dashboard', label: 'Főoldal', icon: Home },
      { value: 'parent-schedule', label: 'Órarend', icon: CalendarDays },
      { value: 'parent-grades', label: 'Jegyek', icon: BarChart3 },
      { value: 'parent-attendance', label: 'Mulasztások', icon: ClipboardList },
      { value: 'homework', label: 'Házifeladat', icon: FileText },
      { value: 'parent-behavior', label: 'Viselkedés', icon: AlertCircle },
      { value: 'chat', label: 'Üzenőfal', icon: MessageSquare },
      { value: 'profile', label: 'Profil', icon: Users }
    ],
    principal: [
      { value: 'dashboard', label: 'Főoldal', icon: Home },
      { value: 'principal-behavior', label: 'Viselkedés', icon: AlertCircle },
      { value: 'principal-statistics', label: 'Statisztikák', icon: BarChart3 },
      { value: 'chat', label: 'Üzenőfal', icon: MessageSquare },
      { value: 'profile', label: 'Profil', icon: Users }
    ]
  }

  const getTabs = () => {
    const role = currentUser?.role
    if (role === 'admin') return tabTriggers.admin
    if (role === 'parent') return tabTriggers.parent
    if (role === 'principal') return tabTriggers.principal
    if (role === 'homeroom_teacher') return tabTriggers.homeroom_teacher
    if (role === 'teacher') return tabTriggers.teacher
    if (role === 'student' || role === 'dj') return tabTriggers.student
    return tabTriggers.student
  }

  return (
    <div className="min-h-screen transition-colors pb-20">
      <DashboardHeader
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        cookieConsent={cookieConsent}
        currentUser={currentUser}
        userRole={userRole}
        user={user}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-8">
        <Tabs defaultValue="dashboard" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="hidden md:flex overflow-x-auto w-full glass p-2 rounded-xl gap-1">
            {getTabs().map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-sm whitespace-nowrap px-4">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="md:hidden mb-4">
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Menü
              </span>
              <svg className={`w-4 h-4 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mb-4 glass-card overflow-hidden">
              <TabsList className="flex flex-col w-full h-auto bg-transparent gap-0 p-0">
                {getTabs().map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          )}

          <TabsContent value="dashboard" className="space-y-6">
            {currentUser?.role === 'admin' ? (
              <AdminDashboard
                allUsers={allUsers}
                teacherSearch={teacherSearch}
                setTeacherSearch={setTeacherSearch}
                studentSearch={studentSearch}
                setStudentSearch={setStudentSearch}
              />
            ) : currentUser?.role === 'parent' ? (
              <ParentDashboard user={user} showAlert={showAlert} />
            ) : currentUser?.role === 'principal' ? (
              <PrincipalDashboard showAlert={showAlert} allUsers={allUsers} />
            ) : currentUser?.role === 'homeroom_teacher' ? (
              <HomeRoomTeacherDashboard
                lessons={lessons}
                grades={grades}
                currentUser={currentUser}
                allUsers={allUsers}
              />
            ) : (
              <StudentDashboard
                lessons={lessons}
                grades={grades}
                currentTime={currentTime}
                selectedDate={selectedDate}
                userRole={userRole}
                user={user}
                homework={homework}
              />
            )}
          </TabsContent>

          {currentUser?.role === 'parent' && (
            <>
              <TabsContent value="parent-schedule" className="space-y-3 sm:space-y-6">
                <ParentDashboard user={user} showAlert={showAlert} defaultTab="schedule" />
              </TabsContent>
              
              <TabsContent value="parent-grades" className="space-y-3 sm:space-y-6">
                <ParentDashboard user={user} showAlert={showAlert} defaultTab="grades" />
              </TabsContent>
              
              <TabsContent value="parent-attendance" className="space-y-3 sm:space-y-6">
                <ParentDashboard user={user} showAlert={showAlert} defaultTab="attendance" />
              </TabsContent>
              
              <TabsContent value="homework" className="space-y-3 sm:space-y-6">
                <ParentDashboard user={user} showAlert={showAlert} defaultTab="homework" />
              </TabsContent>
              
              <TabsContent value="parent-behavior" className="space-y-3 sm:space-y-6">
                <ParentDashboard user={user} showAlert={showAlert} defaultTab="behavior" />
              </TabsContent>
            </>
          )}

          {currentUser?.role === 'principal' && (
            <TabsContent value="principal-statistics" className="space-y-3 sm:space-y-6">
              <AdminStatisticsTab
                allUsers={allUsers}
                grades={grades}
                attendance={attendance}
                lessons={lessons}
              />
            </TabsContent>
          )}

          {currentUser?.role !== 'admin' && currentUser?.role !== 'parent' && currentUser?.role !== 'principal' && (
            <TabsContent value="schedule" className="space-y-3 sm:space-y-6">
              <ScheduleTab
                lessons={lessons}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                currentWeek={currentWeek}
                setCurrentWeek={setCurrentWeek}
                currentTime={currentTime}
                attendance={attendance}
                homework={homework}
                userRole={currentUser?.role === 'homeroom_teacher' ? 'teacher' : currentUser?.role}
                currentUser={currentUser}
                openAttendanceModal={(lesson) => {
                  // Ellenőrizzük, hogy már van-e rögzített jelenlét ehhez az órához
                  const lessonId = `${lesson.Day}_${lesson.StartTime}_${lesson.Class}`
                  const existingAttendance = attendance.find(record =>
                    record.lessonId === lessonId &&
                    record.date === selectedDate.toISOString().split('T')[0]
                  )
                  
                  if (existingAttendance) {
                    showAlert('Ehhez az órához már rögzítve van a jelenlét!', 'warning', 'Figyelem')
                    return
                  }
                  
                  setSelectedLesson(lesson)
                  setAttendanceForm({
                    topic: '',
                    students: allUsers.filter(u => 
                      (u.role === 'student' || u.role === 'dj') && 
                      u.class === lesson?.Class
                    ).map(student => ({
                      studentId: student.id,
                      studentName: student.fullName || student.name,
                      present: true,
                      excused: false
                    }))
                  })
                  setShowAttendanceModal(true)
                }}
                setSelectedHomework={() => {}}
                setShowHomeworkModal={() => {}}
                fillEmptyPeriods={(lessons) => {
                  const timeSlots = ['7:45', '8:45', '9:45', '10:45', '11:45', '12:45', '13:45', '14:45']
                  const sortedLessons = lessons.sort((a, b) => {
                    const timeA = timeSlots.indexOf(a.StartTime)
                    const timeB = timeSlots.indexOf(b.StartTime)
                    return timeA - timeB
                  })
                  return sortedLessons
                }}
              />
            </TabsContent>
          )}

          {(currentUser?.role === 'student' || currentUser?.role === 'dj') && (
            <TabsContent value="grades" className="space-y-3 sm:space-y-6">
              <GradesTab
                grades={grades}
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
                setShowChartModal={setShowChartModal}
                currentUser={currentUser}
                showAlert={showAlert}
              />
            </TabsContent>
          )}

          {(currentUser?.role === 'teacher' || currentUser?.role === 'homeroom_teacher') && (
            <TabsContent value="teacher-grades" className="space-y-3 sm:space-y-6">
              <TeacherGradesTab
                grades={grades}
                allUsers={allUsers}
                currentUser={currentUser}
                selectedClass={selectedClass}
                setSelectedClass={setSelectedClass}
                gradeForm={gradeForm}
                setGradeForm={setGradeForm}
                loadGrades={loadGrades}
                showAlert={showAlert}
                setShowClassGradeModal={setShowClassGradeModal}
                lessons={lessons}
              />
            </TabsContent>
          )}

          {currentUser?.role !== 'parent' && currentUser?.role !== 'principal' && (
            <TabsContent value="radio" className="space-y-3 sm:space-y-6">
              <RadioTab
                musicRequests={musicRequests}
                musicUrl={musicUrl}
                setMusicUrl={setMusicUrl}
                submitMusicRequest={async () => {
                  if (!musicUrl) return
                  try {
                    await fetch('/api/music', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ url: musicUrl, requestedBy: currentUser?.fullName || currentUser?.name })
                    })
                    setMusicUrl('')
                    await loadMusicRequests()
                    showAlert('Zene kérés elküldve!', 'success')
                  } catch (error) {
                    showAlert('Hiba történt', 'error')
                  }
                }}
                loadMusicRequests={loadMusicRequests}
                userRole={currentUser?.role === 'homeroom_teacher' ? 'teacher' : currentUser?.role}
                showAlert={showAlert}
              />
            </TabsContent>
          )}

          <TabsContent value="chat" className="space-y-3 sm:space-y-6">
            <ChatTab
              chatMessages={chatMessages}
              chatMessage={chatMessage}
              setChatMessage={setChatMessage}
              sendChatMessage={async () => {
                if (!chatMessage) return
                try {
                  await fetch('/api/communication/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: chatMessage, sender: currentUser?.fullName || currentUser?.name })
                  })
                  setChatMessage('')
                  await loadChatMessages()
                } catch (error) {
                  showAlert('Hiba történt', 'error')
                }
              }}
              userRole={currentUser?.role === 'homeroom_teacher' ? 'teacher' : currentUser?.role}
              loadChatMessages={loadChatMessages}
              showAlert={showAlert}
            />
          </TabsContent>

          {(currentUser?.role === 'student' || currentUser?.role === 'dj') && (
            <TabsContent value="qr" className="space-y-3 sm:space-y-6">
              <QRTab 
                qrCode={qrCode} 
                qrType={qrType} 
                generateUserQR={generateUserQR}
              />
            </TabsContent>
          )}

          {(currentUser?.role === 'student' || currentUser?.role === 'dj') && (
            <TabsContent value="absences" className="space-y-3 sm:space-y-6">
              <ExcusesTab attendance={attendance} expandedDates={expandedDates} setExpandedDates={setExpandedDates} />
            </TabsContent>
          )}

          {(currentUser?.role === 'student' || currentUser?.role === 'dj') && (
            <TabsContent value="homework" className="space-y-3 sm:space-y-6">
              <HomeworkTab
                homework={homework}
                homeworkSubmissions={homeworkSubmissions}
                setSelectedHomework={setSelectedHomework}
                setShowHomeworkModal={setShowHomeworkModal}
                setShowSubmissionModal={setShowSubmissionModal}
              />
            </TabsContent>
          )}

          {(currentUser?.role === 'teacher' || currentUser?.role === 'homeroom_teacher') && (
            <TabsContent value="teacher-absences" className="space-y-3 sm:space-y-6">
              <AttendanceTab 
                attendance={attendance} 
                expandedDates={expandedDates} 
                setExpandedDates={setExpandedDates}
                setSelectedLesson={setSelectedLesson}
                setAttendanceForm={setAttendanceForm}
                setShowAttendanceModal={setShowAttendanceModal}
              />
            </TabsContent>
          )}

          {(currentUser?.role === 'teacher' || currentUser?.role === 'homeroom_teacher') && (
            <TabsContent value="teacher-homework" className="space-y-3 sm:space-y-6">
              <TeacherHomeworkTab
                homework={homework}
                currentUser={currentUser}
                lessons={lessons}
                showAlert={showAlert}
                loadHomework={loadHomework}
                homeworkForm={homeworkForm}
                setHomeworkForm={setHomeworkForm}
                selectedClass={selectedClass}
                setSelectedClass={setSelectedClass}
                user={user}
                setSelectedHomework={setSelectedHomework}
                setShowHomeworkModal={setShowHomeworkModal}
              />
            </TabsContent>
          )}

          {(currentUser?.role === 'teacher' || currentUser?.role === 'homeroom_teacher') && (
            <TabsContent value="teacher-behavior" className="space-y-3 sm:space-y-6">
              <div className="space-y-6">
                {currentUser?.role === 'homeroom_teacher' && (
                  <BehaviorGradingTab
                    currentUser={currentUser}
                    allUsers={allUsers}
                    showAlert={showAlert}
                  />
                )}
                <TeacherBehaviorTab
                  user={user}
                  allUsers={allUsers}
                  selectedClass={selectedClass}
                  showAlert={showAlert}
                  currentUser={currentUser}
                />
              </div>
            </TabsContent>
          )}

          {currentUser?.role === 'principal' && (
            <TabsContent value="principal-behavior" className="space-y-3 sm:space-y-6">
              <PrincipalBehaviorTab
                allUsers={allUsers}
                showAlert={showAlert}
              />
            </TabsContent>
          )}
          {currentUser?.role === 'homeroom_teacher' && (
            <TabsContent value="class-excuses" className="space-y-3 sm:space-y-6">
              <HomeRoomTeacherExcusesTab
                excuses={excuses}
                currentUser={currentUser}
                showAlert={showAlert}
                loadExcuses={loadExcuses}
              />
            </TabsContent>
          )}



          {currentUser?.role === 'admin' && (
            <TabsContent value="admin-schedule" className="space-y-3 sm:space-y-6">
              <AdminScheduleTab allUsers={allUsers} availableClasses={availableClasses} currentUser={currentUser} />
            </TabsContent>
          )}

          {currentUser?.role === 'admin' && (
            <TabsContent value="admin-grades" className="space-y-3 sm:space-y-6">
              <AdminGradesTab 
                grades={grades} 
                allUsers={allUsers} 
                availableClasses={availableClasses} 
                showAlert={showAlert} 
                loadGrades={loadGrades}
                gradeForm={gradeForm}
                setGradeForm={setGradeForm}
                selectedClass={selectedClass}
                setSelectedClass={setSelectedClass}
              />
            </TabsContent>
          )}

          {currentUser?.role === 'admin' && (
            <TabsContent value="admin-users" className="space-y-3 sm:space-y-6">
              <AdminUsersTab
                allUsers={allUsers}
                availableClasses={availableClasses}
                setAvailableClasses={setAvailableClasses}
                userSearch={userSearch}
                setUserSearch={setUserSearch}
                selectedClass={selectedClass}
                setSelectedClass={setSelectedClass}
                gradeForm={gradeForm}
                setGradeForm={setGradeForm}
                showAlert={showAlert}
                loadAllUsers={loadAllUsers}
                loadClasses={loadClasses}
              />
            </TabsContent>
          )}

          {currentUser?.role === 'admin' && (
            <TabsContent value="admin-statistics" className="space-y-3 sm:space-y-6">
              <AdminStatisticsTab
                allUsers={allUsers}
                grades={grades}
                attendance={attendance}
                lessons={lessons}
              />
            </TabsContent>
          )}

          <TabsContent value="profile" className="space-y-3 sm:space-y-6">
            <ProfileTab
              currentUser={currentUser}
              user={user}
              userRole={currentUser?.role || userRole}
              grades={grades}
              loading={loading}
              handleProfileImageUpload={handleProfileImageUpload}
              loadLessons={loadLessons}
              loadAttendance={loadAttendance}
            />
          </TabsContent>
        </Tabs>
      </main>

      <CustomAlert
        open={alertData.isOpen}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
        onClose={() => setAlertData({ ...alertData, isOpen: false })}
      />

      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        lesson={selectedLesson}
        students={allUsers}
        onSave={async (data) => {
          try {
            const token = await user?.getIdToken()
            const response = await fetch('/api/attendance', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                ...data,
                teacherId: currentUser?.id || user?.uid
              })
            })
            if (response.ok) {
              await loadAttendance()
              showAlert('Jelenlét sikeresen rögzítve!', 'success')
            } else {
              showAlert('Hiba a jelenlét rögzítése során', 'error')
            }
          } catch (error) {
            showAlert('Hiba történt', 'error')
          }
        }}
        showAlert={showAlert}
      />

      <HomeworkModal
        isOpen={showHomeworkModal}
        onClose={() => setShowHomeworkModal(false)}
        homework={selectedHomework}
        userRole={currentUser?.role || 'student'}
        onUpdateSubmissionStatus={async (submissionId, status) => {
          try {
            await fetch('/api/homework-submissions', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ submissionId, status })
            })
            await loadHomework()
            showAlert('Státusz frissítve!', 'success')
          } catch (error) {
            showAlert('Hiba történt', 'error')
          }
        }}
      />

      <SubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        homework={selectedHomework}
        onSubmit={async (content, attachments) => {
          try {
            await fetch('/api/homework-submissions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                homeworkId: selectedHomework?.id,
                studentId: currentUser?.id || user?.uid,
                studentName: currentUser?.fullName || currentUser?.name,
                content,
                attachments: attachments || []
              })
            })
            await loadHomework()
            showAlert('Házi feladat sikeresen beküldve!', 'success')
          } catch (error) {
            showAlert('Hiba történt', 'error')
          }
        }}
      />

      <ClassGradeModal
        isOpen={showClassGradeModal}
        onClose={() => setShowClassGradeModal(false)}
        selectedClass={selectedClass}
        students={[]}
        currentUser={currentUser}
        lessons={lessons}
        showAlert={showAlert}
        loadGrades={loadGrades}
        allUsers={allUsers}
        teacherClasses={lessons.length > 0 ? [...new Set(lessons.filter(lesson => {
          const teacherName = currentUser?.fullName || currentUser?.name
          return lesson.teacherName === teacherName || lesson.Teacher === teacherName
        }).map(lesson => lesson.className || lesson.Class))].filter(Boolean).sort() : []}
      />

      <ChartModal
        isOpen={showChartModal}
        onClose={() => setShowChartModal(false)}
        grades={grades}
      />
    </div>
  )
}
