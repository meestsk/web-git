// AdminNavigation.jsx - Modern Navigation Component for Admin Section
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaBoxOpen, 
  FaUsers, 
  FaTags, 
  FaClipboardList,
  FaChevronRight,
  FaBell,
  FaCog
} from 'react-icons/fa';
import styles from './AdminNavigation.module.css';
import usePermissions from '../hooks/usePermissions.js';

const ADMIN_MENU_ITEMS = [
  { 
    to: '/admin', 
    label: 'แดชบอร์ด', 
    icon: FaTachometerAlt,
    description: 'ภาพรวมและสถิติ',
    permission: null // ทุกคนเข้าได้
  },
  { 
    to: '/admin/users', 
    label: 'จัดการผู้ใช้', 
    icon: FaUsers,
    description: 'ผู้ใช้งานและสิทธิ์',
    permission: 'users'
  },
  { 
    to: '/admin/products', 
    label: 'จัดการสินค้า', 
    icon: FaBoxOpen,
    description: 'สินค้าและราคา',
    permission: 'products'
  },
  { 
    to: '/admin/payments', 
    label: 'การชำระเงิน', 
    icon: FaClipboardList,
    description: 'รายการชำระเงิน',
    permission: 'reports'
  },
  { 
    to: '/admin/announcements', 
    label: 'ประกาศ', 
    icon: FaTags,
    description: 'ข่าวสารและโปรโมชั่น',
    permission: 'announcements'
  },
  { 
    to: '/admin/permissions', 
    label: 'สิทธิ์การใช้งาน', 
    icon: FaCog,
    description: 'จัดการสิทธิ์',
    permission: 'users'
  }
];

export default function AdminNavigation({ 
  variant = 'sidebar', // 'sidebar', 'horizontal', 'compact'
  showDescriptions = true,
  isCompact = false,
  isMobile = false,
  className = ''
}) {
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const [showTooltip, setShowTooltip] = React.useState({});

  // Filter menu items based on permissions
  const visibleMenuItems = ADMIN_MENU_ITEMS.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const getBreadcrumb = () => {
    const currentItem = visibleMenuItems.find(item => 
      item.to === '/admin' 
        ? location.pathname === '/admin'
        : location.pathname.startsWith(item.to)
    );
    return currentItem ? currentItem.label : 'Admin';
  };

  const handleTooltipShow = (itemId) => {
    if (isCompact) {
      setShowTooltip(prev => ({ ...prev, [itemId]: true }));
    }
  };

  const handleTooltipHide = (itemId) => {
    if (isCompact) {
      setShowTooltip(prev => ({ ...prev, [itemId]: false }));
    }
  };

  if (variant === 'breadcrumb') {
    return (
      <div className={`${styles.breadcrumb} ${className}`}>
        <span className={styles.breadcrumbHome}>🏠</span>
        <FaChevronRight className={styles.breadcrumbSeparator} />
        <span className={styles.breadcrumbText}>Admin</span>
        <FaChevronRight className={styles.breadcrumbSeparator} />
        <span className={`${styles.breadcrumbText} ${styles.breadcrumbActive}`}>
          {getBreadcrumb()}
        </span>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <nav className={`${styles.horizontalNav} ${className}`}>
        <div className={styles.navScrollContainer}>
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`${styles.horizontalLink} ${active ? styles.active : ''}`}
                title={item.description}
              >
                <Icon className={styles.linkIcon} />
                <span className={styles.linkText}>{item.label}</span>
                {active && <div className={styles.activeIndicator} />}
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  // Default sidebar variant
  return (
    <nav className={`${styles.sidebar} ${
      isCompact ? styles.compact : ''
    } ${isMobile ? styles.mobile : ''} ${className}`}>
      <div className={styles.sidebarHeader}>
        <div className={styles.adminBrand}>
          <div className={styles.brandIcon}>⚙️</div>
          {(!isCompact || isMobile) && (
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>ผู้ดูแลระบบ</span>
              <span className={styles.brandSubtitle}>Mala Admin</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.navSection}>
        {(!isCompact || isMobile) && (
          <div className={styles.sectionTitle}>เมนูหลัก</div>
        )}
        <div className={styles.navItems}>
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            
            return (
              <div 
                key={item.to}
                className={styles.navItemWrapper}
                onMouseEnter={() => handleTooltipShow(item.to)}
                onMouseLeave={() => handleTooltipHide(item.to)}
              >
                <Link
                  to={item.to}
                  className={`${styles.navLink} ${active ? styles.active : ''}`}
                  title={item.description}
                >
                  <div className={styles.linkIconContainer}>
                    <Icon className={styles.linkIcon} />
                  </div>
                  {(!isCompact || isMobile) && (
                    <div className={styles.linkContent}>
                      <span className={styles.linkText}>{item.label}</span>
                      {showDescriptions && (
                        <span className={styles.linkDescription}>{item.description}</span>
                      )}
                    </div>
                  )}
                  {active && <div className={styles.activeIndicator} />}
                </Link>
                
                {/* Tooltip for compact mode */}
                {isCompact && !isMobile && showTooltip[item.to] && (
                  <div className={styles.tooltip}>
                    <div className={styles.tooltipContent}>
                      <strong>{item.label}</strong>
                      <span>{item.description}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// Export menu items for use in other components
export { ADMIN_MENU_ITEMS };