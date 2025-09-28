// src/components/PermissionGuard.jsx
import React from 'react'
import { useAuthStore } from '../store/auth.js'
import { FaLock, FaExclamationTriangle } from 'react-icons/fa'

<<<<<<< HEAD
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
=======
/** แปลงค่า permissions ให้กลายเป็นอาเรย์ของสตริงเสมอ */
function normalizePerms(raw) {
  if (Array.isArray(raw)) return raw.map(String)
  if (raw instanceof Set) return Array.from(raw).map(String)
  if (raw && typeof raw === 'object' && Array.isArray(raw.permissions)) {
    return raw.permissions.map(String)
  }
  if (typeof raw === 'string') {
    // รองรับ "A,B,C" หรือ "A | B | C"
    return raw
      .split(/[,|]/)
      .map(s => s.trim())
      .filter(Boolean)
  }
  return []
}

/** แปลง required permission ให้เป็นอาเรย์ */
function toArray(val) {
  return Array.isArray(val) ? val : (val == null ? [] : [val])
}

/**
 * Props:
 * - permission: string | string[]  (สิทธิ์ที่ต้องใช้)
 * - mode: 'any' | 'all' (มีอย่างน้อยหนึ่ง หรือ ต้องครบทุกอัน) default: 'any'
 * - fallback: ReactNode
 */
const PermissionGuard = ({ permission, mode = 'any', children, fallback = null }) => {
  const { user } = useAuthStore()

  const hasPermission = () => {
    // ยังไม่ล็อกอิน
    if (!user) return false

    // ADMIN ผ่านทุกหน้า
    if (user.role === 'ADMIN') return true

    // ถ้าไม่ระบุ permission ให้ผ่าน
    const required = toArray(permission)
    if (required.length === 0) return true

    // ดึงสิทธิ์จาก user หลายรูปแบบ -> ทำให้เป็นอาเรย์เสมอ
    const userPermissions = normalizePerms(user.permissions ?? user.perms)

    // ใช้ Set เพื่อเช็คเร็ว/ชัดเจน
    const owned = new Set(userPermissions)

    if (mode === 'all') {
      return required.every(p => owned.has(p))
    }
    // any (ค่าเริ่มต้น)
    return required.some(p => owned.has(p))
>>>>>>> 90dd9c1 (update)
  }

  if (!hasPermission()) {
    if (fallback) return fallback
<<<<<<< HEAD
    
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
=======

    const need = toArray(permission).join(', ')
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', padding: '2rem',
        textAlign: 'center', color: '#6b7280'
>>>>>>> 90dd9c1 (update)
      }}>
        <FaLock style={{ fontSize: '4rem', marginBottom: '1rem', color: '#dc2626' }} />
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>ไม่มีสิทธิ์เข้าถึง</h2>
        <p style={{ margin: 0, fontSize: '1rem' }}>
          คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ
        </p>
        <div style={{
<<<<<<< HEAD
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
=======
          marginTop: '1rem', padding: '0.75rem 1rem', backgroundColor: '#fef2f2',
          border: '1px solid #fecaca', borderRadius: '8px', display: 'flex',
          alignItems: 'center', gap: '0.5rem'
        }}>
          <FaExclamationTriangle style={{ color: '#dc2626' }} />
          <span style={{ fontSize: '0.875rem', color: '#dc2626' }}>
            ต้องการสิทธิ์: {need || '(ไม่ระบุ)'} {Array.isArray(permission) && mode === 'all' ? '(ต้องครบทุกอัน)' : ''}
>>>>>>> 90dd9c1 (update)
          </span>
        </div>
      </div>
    )
  }

  return children
}

<<<<<<< HEAD
export default PermissionGuard
=======
export default PermissionGuard
>>>>>>> 90dd9c1 (update)
