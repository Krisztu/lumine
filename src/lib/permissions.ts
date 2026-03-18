export type UserRole = 'admin' | 'student' | 'teacher' | 'homeroom_teacher' | 'parent' | 'principal' | 'dj'

export interface Permissions {
  canViewGrades: boolean
  canEditGrades: boolean
  canViewAttendance: boolean
  canViewBehavior: boolean
  canEditBehavior: boolean
  canViewHomework: boolean
  canSubmitHomework: boolean
  canChatWithTeachers: boolean
  canViewStatistics: boolean
  canAddPraise: boolean
  canAddWarning: boolean
  canViewAllUsers: boolean
  canEditUsers: boolean
  canCreateHomework: boolean
  canManageAttendance: boolean
}

const rolePermissions: Record<UserRole, Permissions> = {
  admin: {
    canViewGrades: true,
    canEditGrades: true,
    canViewAttendance: true,
    canViewBehavior: true,
    canEditBehavior: true,
    canViewHomework: true,
    canSubmitHomework: false,
    canChatWithTeachers: false,
    canViewStatistics: true,
    canAddPraise: true,
    canAddWarning: true,
    canViewAllUsers: true,
    canEditUsers: true,
    canCreateHomework: true,
    canManageAttendance: true,
  },
  student: {
    canViewGrades: true,
    canEditGrades: false,
    canViewAttendance: true,
    canViewBehavior: true,
    canEditBehavior: false,
    canViewHomework: true,
    canSubmitHomework: true,
    canChatWithTeachers: true,
    canViewStatistics: false,
    canAddPraise: false,
    canAddWarning: false,
    canViewAllUsers: false,
    canEditUsers: false,
    canCreateHomework: false,
    canManageAttendance: false,
  },
  teacher: {
    canViewGrades: true,
    canEditGrades: true,
    canViewAttendance: true,
    canViewBehavior: true,
    canEditBehavior: true,
    canViewHomework: true,
    canSubmitHomework: false,
    canChatWithTeachers: false,
    canViewStatistics: false,
    canAddPraise: false,
    canAddWarning: false,
    canViewAllUsers: true,
    canEditUsers: false,
    canCreateHomework: true,
    canManageAttendance: true,
  },
  homeroom_teacher: {
    canViewGrades: true,
    canEditGrades: true,
    canViewAttendance: true,
    canViewBehavior: true,
    canEditBehavior: true,
    canViewHomework: true,
    canSubmitHomework: false,
    canChatWithTeachers: false,
    canViewStatistics: false,
    canAddPraise: false,
    canAddWarning: false,
    canViewAllUsers: true,
    canEditUsers: false,
    canCreateHomework: true,
    canManageAttendance: true,
  },
  dj: {
    canViewGrades: true,
    canEditGrades: false,
    canViewAttendance: true,
    canViewBehavior: true,
    canEditBehavior: false,
    canViewHomework: true,
    canSubmitHomework: true,
    canChatWithTeachers: true,
    canViewStatistics: false,
    canAddPraise: false,
    canAddWarning: false,
    canViewAllUsers: false,
    canEditUsers: false,
    canCreateHomework: false,
    canManageAttendance: false,
  },
  parent: {
    canViewGrades: true,
    canEditGrades: false,
    canViewAttendance: true,
    canViewBehavior: true,
    canEditBehavior: false,
    canViewHomework: true,
    canSubmitHomework: false,
    canChatWithTeachers: true,
    canViewStatistics: false,
    canAddPraise: false,
    canAddWarning: false,
    canViewAllUsers: false,
    canEditUsers: false,
    canCreateHomework: false,
    canManageAttendance: false,
  },
  principal: {
    canViewGrades: true,
    canEditGrades: false,
    canViewAttendance: true,
    canViewBehavior: true,
    canEditBehavior: false,
    canViewHomework: false,
    canSubmitHomework: false,
    canChatWithTeachers: false,
    canViewStatistics: true,
    canAddPraise: true,
    canAddWarning: true,
    canViewAllUsers: true,
    canEditUsers: false,
    canCreateHomework: false,
    canManageAttendance: false,
  },
}

export function getPermissions(role: UserRole): Permissions {
  return rolePermissions[role]
}

export function hasPermission(role: UserRole | string | null | undefined, permission: keyof Permissions): boolean {
  if (!role || typeof role !== 'string') {
    return false
  }
  
  const userRole = role as UserRole
  if (!rolePermissions[userRole]) {
    return false
  }
  
  return rolePermissions[userRole][permission]
}
