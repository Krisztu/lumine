'use client'

import { Button } from '@/shared/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Home, CalendarDays, BarChart3, ClipboardList, FileText, CheckCircle, Radio, MessageSquare, Smartphone, Users, AlertCircle, UserIcon } from 'lucide-react'

interface DashboardTabsProps {
  userRole: string
  currentUser: any
  mobileMenuOpen: boolean
  setMobileMenuOpen: (value: boolean) => void
}

export function DashboardTabs({ userRole, currentUser, mobileMenuOpen, setMobileMenuOpen }: DashboardTabsProps) {
  return (
    <>
      <TabsList className="hidden md:flex overflow-x-auto w-full glass p-2 rounded-xl gap-1">
        <TabsTrigger value="dashboard" className="text-sm whitespace-nowrap px-4">Főoldal</TabsTrigger>
        {userRole !== 'admin' && <TabsTrigger value="schedule" className="text-sm whitespace-nowrap px-4">Órarend</TabsTrigger>}
        {(userRole === 'student' || userRole === 'dj') && <TabsTrigger value="grades" className="text-sm whitespace-nowrap px-4">Jegyek</TabsTrigger>}
        {userRole === 'teacher' && <TabsTrigger value="teacher-grades" className="text-sm whitespace-nowrap px-4">Jegyek</TabsTrigger>}
        {(userRole === 'student' || userRole === 'dj') && <TabsTrigger value="absences" className="text-sm whitespace-nowrap px-4">Mulasztások</TabsTrigger>}
        {(userRole === 'student' || userRole === 'dj') && <TabsTrigger value="homework" className="text-sm whitespace-nowrap px-4">Házifeladat</TabsTrigger>}
        {userRole === 'parent' && <TabsTrigger value="homework" className="text-sm whitespace-nowrap px-4">Házifeladat</TabsTrigger>}
        {userRole === 'teacher' && <TabsTrigger value="teacher-absences" className="text-sm whitespace-nowrap px-4">Mulasztások</TabsTrigger>}
        {userRole === 'teacher' && <TabsTrigger value="teacher-homework" className="text-sm whitespace-nowrap px-4">Házifeladat</TabsTrigger>}
        {userRole === 'teacher' && <TabsTrigger value="teacher-behavior" className="text-sm whitespace-nowrap px-4">Viselkedés</TabsTrigger>}
        {(currentUser?.role === 'homeroom_teacher') && <TabsTrigger value="class-excuses" className="text-sm whitespace-nowrap px-4">Igazolások</TabsTrigger>}
        {(userRole === 'student' || userRole === 'dj') && <TabsTrigger value="student-excuses" className="text-sm whitespace-nowrap px-4">Igazolás</TabsTrigger>}
        {userRole !== 'admin' && <TabsTrigger value="radio" className="text-sm whitespace-nowrap px-4">Rádió</TabsTrigger>}
        <TabsTrigger value="chat" className="text-sm whitespace-nowrap px-4">Üzenőfal</TabsTrigger>
        {userRole !== 'teacher' && userRole !== 'admin' && <TabsTrigger value="qr" className="text-sm whitespace-nowrap px-4">QR</TabsTrigger>}
        {userRole === 'admin' && <TabsTrigger value="admin-schedule" className="text-sm whitespace-nowrap px-4">Órarend</TabsTrigger>}
        {userRole === 'admin' && <TabsTrigger value="admin-grades" className="text-sm whitespace-nowrap px-4">Jegyek</TabsTrigger>}
        {userRole === 'admin' && <TabsTrigger value="admin-users" className="text-sm whitespace-nowrap px-4">Felhasználók</TabsTrigger>}
        {userRole === 'admin' && <TabsTrigger value="admin-statistics" className="text-sm whitespace-nowrap px-4">Statisztikák</TabsTrigger>}
        <TabsTrigger value="profile" className="text-sm whitespace-nowrap px-4">Profil</TabsTrigger>
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
            <TabsTrigger value="dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><Home className="h-4 w-4" /> Főoldal</TabsTrigger>
            {userRole !== 'admin' && <TabsTrigger value="schedule" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Órarend</TabsTrigger>}
            {(userRole === 'student' || userRole === 'dj') && <TabsTrigger value="grades" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Jegyek</TabsTrigger>}
            {userRole === 'teacher' && <TabsTrigger value="teacher-grades" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Jegyek</TabsTrigger>}
            {(userRole === 'student' || userRole === 'dj') && <TabsTrigger value="absences" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Mulasztások</TabsTrigger>}
            {(userRole === 'student' || userRole === 'dj') && <TabsTrigger value="homework" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><FileText className="h-4 w-4" /> Házifeladat</TabsTrigger>}
            {userRole === 'parent' && <TabsTrigger value="homework" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><FileText className="h-4 w-4" /> Házifeladat</TabsTrigger>}
            {userRole === 'teacher' && <TabsTrigger value="teacher-absences" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Mulasztások</TabsTrigger>}
            {userRole === 'teacher' && <TabsTrigger value="teacher-homework" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><FileText className="h-4 w-4" /> Házifeladat</TabsTrigger>}
            {userRole === 'teacher' && <TabsTrigger value="teacher-behavior" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Viselkedés</TabsTrigger>}
            {(currentUser?.role === 'homeroom_teacher') && <TabsTrigger value="class-excuses" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Igazolások</TabsTrigger>}
            {(userRole === 'student' || userRole === 'dj') && <TabsTrigger value="student-excuses" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Igazolás</TabsTrigger>}
            {userRole !== 'admin' && <TabsTrigger value="radio" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><Radio className="h-4 w-4" /> Rádió</TabsTrigger>}
            <TabsTrigger value="chat" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Üzenőfal</TabsTrigger>
            {userRole !== 'teacher' && userRole !== 'admin' && <TabsTrigger value="qr" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><Smartphone className="h-4 w-4" /> QR</TabsTrigger>}
            {userRole === 'admin' && <TabsTrigger value="admin-schedule" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Órarend</TabsTrigger>}
            {userRole === 'admin' && <TabsTrigger value="admin-grades" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Jegyek</TabsTrigger>}
            {userRole === 'admin' && <TabsTrigger value="admin-users" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><Users className="h-4 w-4" /> Felhasználók</TabsTrigger>}
            {userRole === 'admin' && <TabsTrigger value="admin-statistics" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none border-b border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Statisztikák</TabsTrigger>}
            <TabsTrigger value="profile" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start text-left px-4 py-3 rounded-none hover:bg-white/5 transition-colors flex items-center gap-2"><UserIcon className="h-4 w-4" /> Profil</TabsTrigger>
          </TabsList>
        </div>
      )}
    </>
  )
}
