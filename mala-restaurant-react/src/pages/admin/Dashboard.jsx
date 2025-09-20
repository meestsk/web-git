import React from "react";
import { 
  FaChartLine, 
  FaShoppingCart, 
  FaMoneyBillWave, 
  FaUsers,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaSearch,
  FaSync,
  FaEye,
  FaBell,
  FaFire
} from 'react-icons/fa';
import API from "../../services/api";
import styles from "./Dashboard.module.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import minMax from "dayjs/plugin/minMax";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/th';

dayjs.extend(minMax);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(relativeTime);
dayjs.locale('th');

/* ===== helpers ===== */
function daysBetweenISO(startISO, endISO) {
  const out = [];
  let d = dayjs(startISO, "YYYY-MM-DD").startOf("day");
  const e = dayjs(endISO, "YYYY-MM-DD").endOf("day");
  while (d.isSameOrBefore(e, "day")) {
    out.push(d.format("YYYY-MM-DD")); // เก็บ ISO
    d = d.add(1, "day");
  }
  return out;
}

export default function AdminDashboard() {
  // ดึงข้อมูลจาก API
  const [orders, setOrders] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [payments, setPayments] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const [startDate, setStartDate] = React.useState(
    dayjs().subtract(7, "day").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = React.useState(dayjs().format("YYYY-MM-DD"));

  // โหลดข้อมูลจาก API
  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ดึงข้อมูลแบบ parallel
      const [ordersRes, productsRes, usersRes, paymentsRes] = await Promise.allSettled([
        API.orders.list({ startDate, endDate }),
        API.products.list(),
        API.users.list(),
        API.payments ? API.payments.list({ startDate, endDate }) : Promise.resolve([])
      ]);

      // Process results
      if (ordersRes.status === 'fulfilled') {
        setOrders(ordersRes.value || []);
      } else {
        console.warn('Failed to load orders:', ordersRes.reason);
      }

      if (productsRes.status === 'fulfilled') {
        setProducts(productsRes.value || []);
      } else {
        console.warn('Failed to load products:', productsRes.reason);
      }

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value || []);
      } else {
        console.warn('Failed to load users:', usersRes.reason);
      }

      if (paymentsRes.status === 'fulfilled') {
        setPayments(paymentsRes.value || []);
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // โหลดข้อมูลเมื่อ component mount และเมื่อช่วงวันที่เปลี่ยน
  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // คัดกรองออเดอร์ตามช่วงวันที่ (ถ้า API ไม่รองรับ filter ให้ใช้ตรงนี้)
  const filteredOrders = React.useMemo(() => {
    const start = dayjs(startDate, "YYYY-MM-DD").startOf("day");
    const end = dayjs(endDate, "YYYY-MM-DD").endOf("day");
    return (orders || []).filter((o) => {
      const dt = dayjs(o.createdAt);
      return dt.isSameOrAfter(start) && dt.isSameOrBefore(end);
    });
  }, [orders, startDate, endDate]);

  // รายชื่อเดือนภาษาไทย (ตัวย่อ)
  const TH_MONTHS = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];

  // ====== ทำ dailyStats ด้วย key = ISO แล้วค่อยฟอร์แมตตอนแสดง ======
  const dailyStats = React.useMemo(() => {
    const days = daysBetweenISO(startDate, endDate);
    const base = Object.fromEntries(
      days.map((iso) => [iso, { dateISO: iso, orders: 0, revenue: 0 }])
    );
    for (const o of filteredOrders) {
      const iso = dayjs(o.createdAt).format("YYYY-MM-DD");
      if (!base[iso]) continue;
      base[iso].orders += 1;
      base[iso].revenue += Number(o.total || 0);
    }
    return Object.values(base);
  }, [filteredOrders, startDate, endDate]);

  // สรุปยอดรวม
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce(
    (sum, o) => sum + Number(o.total || 0),
    0
  );

  // เปอร์เซ็นต์เปลี่ยนแปลง: วันล่าสุด vs ก่อนหน้า
  const lastDay = dailyStats[dailyStats.length - 1];
  const prevDay = dailyStats[dailyStats.length - 2];
  const orderChange =
    lastDay && prevDay
      ? (
          ((lastDay.orders - prevDay.orders) / (prevDay.orders || 1)) *
          100
        ).toFixed(1) + "%"
      : "0%";
  const revenueChange =
    lastDay && prevDay
      ? (
          ((lastDay.revenue - prevDay.revenue) / (prevDay.revenue || 1)) *
          100
        ).toFixed(1) + "%"
      : "0%";

  const stats = [
    {
      title: "จำนวนออเดอร์ทั้งหมด",
      value: totalOrders,
      change: orderChange,
      isUp: lastDay && prevDay ? lastDay.orders >= prevDay.orders : null,
    },
    {
      title: "รายรับ",
      value: `฿${totalRevenue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      change: revenueChange,
      isUp: lastDay && prevDay ? lastDay.revenue >= prevDay.revenue : null,
    },
  ];

  /* ===== Responsive tick: ถ้ากว้าง ≤ 480px ให้สั้นเป็น “D ม.ค.” ไม่งั้น “DD/MM” ===== */
  const chartWrapRef = React.useRef(null);
  const [chartW, setChartW] = React.useState(0);
  React.useEffect(() => {
    const el = chartWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setChartW(el.clientWidth));
    ro.observe(el);
    setChartW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const compact = chartW <= 480;
  const fmtTick = React.useCallback(
    (iso) => {
      const d = dayjs(iso);
      return compact
        ? `${d.date()} ${TH_MONTHS[d.month()]}`
        : d.format("DD/MM");
    },
    [compact]
  );
  const fmtTooltipLabel = (iso) => dayjs(iso).format("DD/MM/YYYY");

  // Quick actions data with real stats
  const quickActions = [
    { 
      icon: FaUsers, 
      label: 'จัดการผู้ใช้', 
      path: '/admin/users',
      color: '#3b82f6',
      count: users.length
    },
    { 
      icon: FaShoppingCart, 
      label: 'จัดการสินค้า', 
      path: '/admin/products',
      color: '#10b981',
      count: products.length
    },
    { 
      icon: FaMoneyBillWave, 
      label: 'การชำระเงิน', 
      path: '/admin/payments',
      color: '#f59e0b',
      count: payments.length
    },
    { 
      icon: FaEye, 
      label: 'ออเดอร์ทั้งหมด', 
      path: '/admin/orders',
      color: '#ef4444',
      count: totalOrders
    }
  ];

  // คำนวณสินค้าขายดีจากข้อมูลจริง
  const topProducts = React.useMemo(() => {
    const productSales = {};
    
    // นับยอดขายแต่ละสินค้าจาก orders
    filteredOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const productId = item.productId || item.id;
        const productName = item.name || item.productName || `สินค้า #${productId}`;
        const quantity = Number(item.quantity || 1);
        const price = Number(item.price || item.unitPrice || 0);
        const revenue = quantity * price;

        if (!productSales[productId]) {
          productSales[productId] = {
            id: productId,
            name: productName,
            sales: 0,
            revenue: 0,
            color: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][Object.keys(productSales).length % 5]
          };
        }
        
        productSales[productId].sales += quantity;
        productSales[productId].revenue += revenue;
      });
    });

    // เรียงตามยอดขายและเอาแค่ 5 อันดับแรก
    return Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [filteredOrders]);

  // Performance metrics จากข้อมูลจริง
  const performanceMetrics = React.useMemo(() => {
    const avgOrderValue = totalRevenue / (totalOrders || 1);
    const todayOrders = filteredOrders.filter(o => 
      dayjs(o.createdAt).isSame(dayjs(), 'day')
    ).length;
    
    const thisWeekOrders = filteredOrders.filter(o => 
      dayjs(o.createdAt).isSame(dayjs(), 'week')
    ).length;
    
    const lastWeekOrders = orders.filter(o => 
      dayjs(o.createdAt).isSame(dayjs().subtract(1, 'week'), 'week')
    ).length;
    
    const weeklyGrowth = lastWeekOrders > 0 
      ? (((thisWeekOrders - lastWeekOrders) / lastWeekOrders) * 100).toFixed(1)
      : 0;

    // คำนวณอัตราการแปลง (สมมติจากจำนวน users ที่มี orders)
    const usersWithOrders = new Set(filteredOrders.map(o => o.userId || o.customerId)).size;
    const conversionRate = users.length > 0 ? ((usersWithOrders / users.length) * 100).toFixed(1) : 0;
    
    // ผู้ใช้ออนไลน์ (สมมติจากผู้ใช้ที่มี activity ใน 24 ชั่วโมงล่าสุด)
    const onlineUsers = users.filter(u => 
      u.lastActive && dayjs(u.lastActive).isAfter(dayjs().subtract(24, 'hours'))
    ).length;
    
    return [
      {
        title: 'ค่าเฉลี่ยต่อออเดอร์',
        value: `฿${avgOrderValue.toFixed(0)}`,
        icon: FaMoneyBillWave,
        color: '#10b981',
        change: avgOrderValue > 0 ? `฿${avgOrderValue.toFixed(0)}` : 'ไม่มีข้อมูล'
      },
      {
        title: 'ออเดอร์วันนี้',
        value: todayOrders,
        icon: FaShoppingCart,
        color: '#3b82f6',
        change: `${weeklyGrowth > 0 ? '+' : ''}${weeklyGrowth}% จากสัปดาห์ที่แล้ว`
      },
      {
        title: 'อัตราการแปลง',
        value: `${conversionRate}%`,
        icon: FaArrowUp,
        color: '#f59e0b',
        change: `${usersWithOrders}/${users.length} ผู้ใช้`
      },
      {
        title: 'ผู้ใช้ออนไลน์',
        value: onlineUsers,
        icon: FaUsers,
        color: '#ef4444',
        change: 'ใน 24 ชั่วโมงล่าสุด'
      }
    ];
  }, [totalRevenue, totalOrders, filteredOrders, orders, users]);

  // Activity feed จากข้อมูลจริง
  const activityFeed = React.useMemo(() => {
    const activities = [];
    
    // เพิ่ม recent orders
    const recentOrders = filteredOrders
      .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
      .slice(0, 3);
    
    recentOrders.forEach(order => {
      activities.push({
        id: `order-${order.id}`,
        type: 'order',
        icon: FaShoppingCart,
        message: `ออเดอร์ใหม่ #${order.id} ${order.customerName ? `จาก ${order.customerName}` : 'จากลูกค้าทั่วไป'}`,
        time: dayjs(order.createdAt),
        color: '#10b981'
      });
    });

    // เพิ่ม completed orders
    const completedOrders = filteredOrders
      .filter(o => o.status === 'completed')
      .sort((a, b) => dayjs(b.updatedAt || b.createdAt).valueOf() - dayjs(a.updatedAt || a.createdAt).valueOf())
      .slice(0, 2);
    
    completedOrders.forEach(order => {
      activities.push({
        id: `completed-${order.id}`,
        type: 'payment',
        icon: FaMoneyBillWave,
        message: `ออเดอร์ #${order.id} เสร็จสิ้น ยอดรวม ฿${Number(order.total || 0).toLocaleString()}`,
        time: dayjs(order.updatedAt || order.createdAt),
        color: '#f59e0b'
      });
    });

    // เพิ่ม new users
    const recentUsers = users
      .filter(u => u.createdAt)
      .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
      .slice(0, 2);
    
    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user',
        icon: FaUsers,
        message: `ผู้ใช้ใหม่ลงทะเบียน: ${user.name || user.username}`,
        time: dayjs(user.createdAt),
        color: '#3b82f6'
      });
    });

    // เพิ่ม stock alerts (สินค้าที่มีสต็อกน้อย)
    const lowStockProducts = products
      .filter(p => p.stock !== undefined && p.stock < 10)
      .slice(0, 2);
    
    lowStockProducts.forEach(product => {
      activities.push({
        id: `stock-${product.id}`,
        type: 'alert',
        icon: FaBell,
        message: `สินค้า "${product.name}" เหลือน้อย (${product.stock} ชิ้น)`,
        time: dayjs().subtract(Math.random() * 60, 'minutes'),
        color: '#ef4444'
      });
    });

    // เรียงตามเวลาล่าสุด
    return activities
      .sort((a, b) => b.time.valueOf() - a.time.valueOf())
      .slice(0, 5);
  }, [filteredOrders, users, products]);

  return (
    <div className={styles.dashboardContainer}>
      {/* Quick Actions */}
      <div className={styles.quickActionsSection}>
        <h2 className={styles.sectionTitle}>การดำเนินการด่วน</h2>
        <div className={styles.quickActionsGrid}>
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <a
                key={idx}
                href={action.path}
                className={styles.quickActionCard}
                style={{ '--action-color': action.color }}
              >
                <div className={styles.actionIcon}>
                  <Icon />
                </div>
                <span className={styles.actionLabel}>{action.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Filters Section - ปรับให้เรียบง่าย */}
      <div className={styles.filtersSection}>
        <h2 className={styles.sectionTitle}>
          <FaCalendarAlt className={styles.sectionIcon} />
          เลือกช่วงวันที่
        </h2>
        <div className={styles.filtersCard}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <span>ตั้งแต่</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={styles.dateInput}
              />
            </label>

            <label className={styles.filterLabel}>
              <span>ถึง</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={styles.dateInput}
              />
            </label>

            <button 
              className={styles.searchButton}
              onClick={() => {}}
              disabled={loading}
            >
              <FaSearch />
              ค้นหา
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      {loading ? (
        <div className={styles.loadingSection}>
          <div className={styles.loadingSpinner}>
            <FaSync className={styles.spinningIcon} />
          </div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <>
          <div className={styles.statsSection}>
            <h2 className={styles.sectionTitle}>
              <FaChartLine className={styles.sectionIcon} />
              สถิติสำคัญ
            </h2>
            <div className={styles.statsGrid}>
              {stats.map((stat, idx) => (
                <div key={idx} className={styles.statsCard}>
                  <div className={styles.statsHeader}>
                    <div className={styles.statsTitle}>{stat.title}</div>
                    {stat.change && (
                      <div
                        className={`${styles.statsChange} ${
                          stat.isUp ? styles.statsUp : styles.statsDown
                        }`}
                      >
                        {stat.isUp === null ? "" : stat.isUp ? 
                          <FaArrowUp /> : <FaArrowDown />
                        }
                        {stat.change}
                      </div>
                    )}
                  </div>
                  <div className={styles.statsValue}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Section */}
          <div className={styles.chartSection}>
            <h2 className={styles.sectionTitle}>
              <FaChartLine className={styles.sectionIcon} />
              แผนภูมิรายรับ
            </h2>
            <div className={styles.chartCard} ref={chartWrapRef}>
              {dailyStats.length === 0 ? (
                <div className={styles.noDataMessage}>
                  <p>ไม่มีข้อมูลในช่วงวันที่ที่เลือก</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={360}>
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="dateISO"
                      tickFormatter={fmtTick}
                      interval="preserveStartEnd"
                      minTickGap={compact ? 12 : 6}
                    />
                    <YAxis yAxisId="left" allowDecimals={false} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(v) => `฿${v.toLocaleString()}`}
                    />
                    <Tooltip
                      labelFormatter={fmtTooltipLabel}
                      formatter={(value, name) => {
                        if (name === "รายรับ (บาท)") {
                          return [`฿${Number(value).toLocaleString()}`, name];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="orders"
                      stroke="#dc2626"
                      strokeWidth={3}
                      name="จำนวนออเดอร์"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#16a34a"
                      strokeWidth={3}
                      name="รายรับ (บาท)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className={styles.performanceSection}>
            <h2 className={styles.sectionTitle}>
              <FaFire className={styles.sectionIcon} />
              เมตริกส์ประสิทธิภาพ
            </h2>
            <div className={styles.metricsGrid}>
              {performanceMetrics.map((metric, idx) => {
                const Icon = metric.icon;
                return (
                  <div key={idx} className={styles.metricCard}>
                    <div className={styles.metricIcon} style={{ backgroundColor: metric.color }}>
                      <Icon />
                    </div>
                    <div className={styles.metricContent}>
                      <div className={styles.metricTitle}>{metric.title}</div>
                      <div className={styles.metricValue}>{metric.value}</div>
                      <div className={styles.metricChange}>{metric.change}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Products Chart */}
          <div className={styles.topProductsSection}>
            <h2 className={styles.sectionTitle}>
              <FaFire className={styles.sectionIcon} />
              สินค้าขายดี
            </h2>
            <div className={styles.chartsContainer}>
              <div className={styles.pieChartContainer}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topProducts}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="sales"
                    >
                      {topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} ออเดอร์`, 'ยอดขาย']}
                      labelFormatter={(label) => topProducts[label]?.name}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.productsList}>
                {topProducts.map((product, idx) => (
                  <div key={idx} className={styles.productItem}>
                    <div 
                      className={styles.productColor}
                      style={{ backgroundColor: product.color }}
                    ></div>
                    <div className={styles.productInfo}>
                      <div className={styles.productName}>{product.name}</div>
                      <div className={styles.productStats}>
                        {product.sales} ออเดอร์ • ฿{product.revenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className={styles.recentOrdersSection}>
            <h2 className={styles.sectionTitle}>
              <FaShoppingCart className={styles.sectionIcon} />
              ออเดอร์ล่าสุด
            </h2>
            <div className={styles.tableCard}>
              {filteredOrders.length === 0 ? (
                <div className={styles.noDataMessage}>
                  <p>ไม่มีออเดอร์ในช่วงวันที่ที่เลือก</p>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.ordersTable}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>วันที่</th>
                        <th>ลูกค้า</th>
                        <th>รายการ</th>
                        <th>ยอดรวม</th>
                        <th>สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.slice(0, 10).map((order) => (
                        <tr key={order.id}>
                          <td className={styles.orderId}>#{order.id}</td>
                          <td className={styles.orderDate}>
                            {dayjs(order.createdAt).format("DD/MM/YY HH:mm")}
                          </td>
                          <td className={styles.customerName}>
                            {order.customerName || 'ลูกค้าทั่วไป'}
                          </td>
                          <td className={styles.orderItems}>
                            {(order.items || []).length} รายการ
                          </td>
                          <td className={styles.orderTotal}>
                            ฿{Number(order.total || 0).toLocaleString()}
                          </td>
                          <td className={styles.orderStatus}>
                            <span className={`${styles.statusBadge} ${styles[`status${order.status || 'pending'}`]}`}>
                              {order.status === 'completed' ? 'เสร็จสิ้น' : 
                               order.status === 'pending' ? 'รอดำเนินการ' : 
                               order.status === 'processing' ? 'กำลังดำเนินการ' : 'รอดำเนินการ'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className={styles.activitySection}>
            <h2 className={styles.sectionTitle}>
              <FaBell className={styles.sectionIcon} />
              กิจกรรมล่าสุด
            </h2>
            <div className={styles.activityCard}>
              <div className={styles.activityList}>
                {activityFeed.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className={styles.activityItem}>
                      <div 
                        className={styles.activityIcon}
                        style={{ backgroundColor: activity.color }}
                      >
                        <Icon />
                      </div>
                      <div className={styles.activityContent}>
                        <div className={styles.activityMessage}>
                          {activity.message}
                        </div>
                        <div className={styles.activityTime}>
                          {activity.time.fromNow()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className={styles.activityFooter}>
                <button className={styles.viewAllButton}>
                  ดูทั้งหมด
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
