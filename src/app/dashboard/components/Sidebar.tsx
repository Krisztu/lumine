'use client'

import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, LogOut, ChevronLeft, ChevronRight, X, MoreHorizontal, ChevronUp, UserCircle } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface TabItem {
  value: string
  label: string
  icon: LucideIcon
}

interface SidebarProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (value: string) => void
  darkMode: boolean
  setDarkMode: (value: boolean) => void
  cookieConsent: boolean
  currentUser: any
  user: any
  onLogout: () => void
}

const ROLE_LABELS: Record<string, string> = {
  dj: 'DJ',
  teacher: 'Tanár',
  homeroom_teacher: 'Osztályfőnök',
  admin: 'Admin',
  student: 'Diák',
  principal: 'Igazgató',
  parent: 'Szülő',
}

const MOBILE_VISIBLE_COUNT = 4

export function Sidebar({
  tabs,
  activeTab,
  onTabChange,
  darkMode,
  setDarkMode,
  cookieConsent,
  currentUser,
  user,
  onLogout,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleTabChange = (value: string) => {
    onTabChange(value)
    setDrawerOpen(false)
  }

  const toggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
    if (cookieConsent) {
      localStorage.setItem('darkMode', next.toString())
    }
  }

  const displayName = currentUser?.name || currentUser?.fullName || user?.email
  const roleLabel = ROLE_LABELS[currentUser?.role] ?? ''
  const initials = (displayName?.[0] ?? '?').toUpperCase()
  const profileImage = currentUser?.profileImage || currentUser?.photoURL || user?.photoURL

  const navTabs = tabs.filter(t => t.value !== 'profile')
  const mobilePrimary = navTabs.slice(0, MOBILE_VISIBLE_COUNT)
  const mobileExtra = navTabs.slice(MOBILE_VISIBLE_COUNT)

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className={`
          hidden md:flex flex-col fixed top-0 left-0 h-screen z-40
          bg-card border-r border-border
           ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-64'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-border ${collapsed ? 'justify-center' : ''}`}>
          <img
            src="/LuminéLogo.png"
            alt="Luminé Logo"
            className="w-12 h-12 shrink-0 object-contain drop-shadow-sm  "
          />
          {!collapsed && (
            <span className="text-xl font-extrabold text-foreground tracking-tight">Luminé</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-hide">
          {navTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                title={collapsed ? tab.label : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                   group relative
                  ${isActive
                    ? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-emerald-600 rounded-r-full" />
                )}
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{tab.label}</span>}
                {/* Tooltip when collapsed */}
                {collapsed && (
                  <span className="
                    absolute left-full ml-2 px-2 py-1 text-xs rounded-md
                    bg-popover text-popover-foreground border border-border shadow-md
                    opacity-0 pointer-events-none group-hover:opacity-100
                    whitespace-nowrap z-50 
                  ">
                    {tab.label}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom: User area */}
        <div className="border-t border-border p-3" ref={userMenuRef}>
          {/* Dropdown menu */}
          {userMenuOpen && (
            <div className={`
              mb-2 rounded-lg overflow-hidden border border-border bg-card shadow-lg
              ${collapsed ? 'absolute bottom-16 left-[76px] w-52 z-50' : ''}
            `}>
              {collapsed && (
                <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                  <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{roleLabel}</p>
                </div>
              )}
              <button
                onClick={() => { setUserMenuOpen(false); onTabChange('profile') }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors"
              >
                <UserCircle className="h-4 w-4 shrink-0" />
                Profil
              </button>
              <div className="h-px bg-border" />
              <button
                onClick={() => { setUserMenuOpen(false); toggleDarkMode() }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors"
              >
                {darkMode ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
                {darkMode ? 'Világos mód' : 'Sötét mód'}
              </button>
              <div className="h-px bg-border" />
              <button
                onClick={() => { setUserMenuOpen(false); onLogout() }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Kilépés
              </button>
            </div>
          )}

          {/* User trigger button */}
          {!collapsed ? (
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors text-left"
            >
              {profileImage ? (
                <img src={profileImage} alt={displayName} className="w-8 h-8 shrink-0 rounded-full object-cover bg-emerald-600" />
              ) : (
                <div className="w-8 h-8 shrink-0 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
              <ChevronUp
                className={`h-3.5 w-3.5 shrink-0 text-muted-foreground  ${userMenuOpen ? '' : 'rotate-180'}`}
              />
            </button>
          ) : (
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              className="w-full flex justify-center p-2 rounded-lg hover:bg-muted/60 transition-colors"
              title={displayName}
            >
              {profileImage ? (
                <img src={profileImage} alt={displayName} className="w-8 h-8 rounded-full object-cover bg-emerald-600" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
              )}
            </button>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
            absolute -right-3 top-1/2 -translate-y-1/2
            w-6 h-6 rounded-full
            bg-card border border-border shadow-sm
            flex items-center justify-center
            hover:bg-muted transition-colors z-50
          "
          aria-label={collapsed ? 'Kibontás' : 'Összecsukás'}
        >
          {collapsed
            ? <ChevronRight className="h-3 w-3 text-foreground" />
            : <ChevronLeft className="h-3 w-3 text-foreground" />
          }
        </button>
      </aside>

      {/* ── Mobile Bottom Navigation ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-stretch">
          {mobilePrimary.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`
                  flex-1 flex flex-col items-center justify-center py-2 gap-0.5
                  text-[10px] font-medium 
                  ${isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="leading-tight truncate w-full text-center px-0.5">{tab.label}</span>
              </button>
            )
          })}

          {mobileExtra.length > 0 && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="leading-tight">Több</span>
            </button>
          )}
        </div>
      </nav>

      {/* ── Mobile Drawer (slide-up menu) ── */}
      {drawerOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold text-foreground">Menü</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors"
              >
                <X className="h-4 w-4 text-foreground" />
              </button>
            </div>

            {/* All tabs list */}
            <div className="px-3 py-2 space-y-0.5 max-h-[55vh] overflow-y-auto">
              {navTabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.value
                return (
                  <button
                    key={tab.value}
                    onClick={() => handleTabChange(tab.value)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                      
                      ${isActive
                        ? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* User row at bottom of drawer */}
            <div className="flex items-center gap-3 px-4 py-3 border-t border-border">
              {profileImage ? (
                <img src={profileImage} alt={displayName} className="w-8 h-8 rounded-full object-cover bg-emerald-600 shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
              <button
                onClick={() => handleTabChange('profile')}
                className="p-2 rounded-lg hover:bg-muted/60 transition-colors"
                title="Profil"
              >
                <UserCircle className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-muted/60 transition-colors"
                title={darkMode ? 'Világos mód' : 'Sötét mód'}
              >
                {darkMode
                  ? <Sun className="h-4 w-4 text-muted-foreground" />
                  : <Moon className="h-4 w-4 text-muted-foreground" />
                }
              </button>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Kilépés"
              >
                <LogOut className="h-4 w-4 text-red-500" />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
