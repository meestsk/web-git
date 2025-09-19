// src/hooks/usePermissions.js
import { useAuthStore } from '../store/auth.js'

export const usePermissions = () => {
  const { user } = useAuthStore()

  const hasPermission = (permission) => {
    if (!user) return false
    
    // Admin เข้าได้ทุกหน้า
    if (user.role === 'ADMIN') return true
    
    // ตรวจสอบสิทธิ์เฉพาะ
    if (!permission) return true
    
    const userPermissions = user.permissions || user.perms || []
    return userPermissions.includes(permission)
  }

  const hasAnyPermission = (permissions = []) => {
    return permissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissions = []) => {
    return permissions.every(permission => hasPermission(permission))
  }

  const isAdmin = () => {
    return user?.role === 'ADMIN'
  }

  const getAvailablePermissions = () => {
    if (!user) return []
    if (user.role === 'ADMIN') return ['pos', 'products', 'users', 'announcements', 'reports']
    return user.permissions || user.perms || []
  }

  return {
    hasPermission,
    hasAnyPermission, 
    hasAllPermissions,
    isAdmin,
    getAvailablePermissions,
    user
  }
}

export default usePermissions