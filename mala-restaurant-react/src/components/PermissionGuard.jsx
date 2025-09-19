// src/components/PermissionGuard.jsx
import React from 'react'
import { useAuthStore } from '../store/auth.js'
import { FaLock, FaExclamationTriangle } from 'react-icons/fa'

const PermissionGuard = ({ permission, children, fallback = null }) => {
  const { user } = useAuthStore()

  // ตรวจสอบสิทธิ์
  const hasPermission = () => {
    if (!user) return false
    
    // Admin เข้าได้ทุกหน้า
    if (user.role === 'ADMIN') return true
    
    // ตรวจสอบสิทธิ์เฉพาะ
    if (!permission) return true // ถ้าไม่ระบุ permission ให้ผ่าน
    
    const userPermissions = user.permissions || user.perms || []
    return userPermissions.includes(permission)
  }

  if (!hasPermission()) {
    if (fallback) return fallback
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <FaLock style={{ fontSize: '4rem', marginBottom: '1rem', color: '#dc2626' }} />
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>ไม่มีสิทธิ์เข้าถึง</h2>
        <p style={{ margin: 0, fontSize: '1rem' }}>
          คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ
        </p>
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FaExclamationTriangle style={{ color: '#dc2626' }} />
          <span style={{ fontSize: '0.875rem', color: '#dc2626' }}>
            ต้องการสิทธิ์: {permission}
          </span>
        </div>
      </div>
    )
  }

  return children
}

export default PermissionGuard