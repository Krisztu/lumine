import { lazy, Suspense } from 'react'
import { Skeleton } from '@/shared/components/ui/skeleton'

// Lazy loaded komponensek
export const LazyAdminDashboard = lazy(() => 
  import('./AdminDashboard').then(module => ({ default: module.AdminDashboard }))
)

export const LazyStudentDashboard = lazy(() => 
  import('./StudentDashboard').then(module => ({ default: module.StudentDashboard }))
)

export const LazyParentDashboard = lazy(() => 
  import('./ParentDashboard').then(module => ({ default: module.ParentDashboard }))
)

export const LazyPrincipalDashboard = lazy(() => 
  import('./PrincipalDashboard').then(module => ({ default: module.PrincipalDashboard }))
)

export const LazyTeacherDashboard = lazy(() => 
  import('./TeacherDashboard').then(module => ({ default: module.TeacherDashboard }))
)

// Tab komponensek lazy loading
export const LazyScheduleTab = lazy(() => 
  import('./ScheduleTab').then(module => ({ default: module.ScheduleTab }))
)

export const LazyGradesTab = lazy(() => 
  import('./GradesTab').then(module => ({ default: module.GradesTab }))
)

export const LazyRadioTab = lazy(() => 
  import('./RadioTab').then(module => ({ default: module.RadioTab }))
)

export const LazyChatTab = lazy(() => 
  import('./ChatTab').then(module => ({ default: module.ChatTab }))
)

export const LazyHomeworkTab = lazy(() => 
  import('./HomeworkTab').then(module => ({ default: module.HomeworkTab }))
)

// Loading komponens
export const DashboardSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  </div>
)

// Wrapper komponens Suspense-szel
export const LazyWrapper = ({ 
  children, 
  fallback = <DashboardSkeleton /> 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
)