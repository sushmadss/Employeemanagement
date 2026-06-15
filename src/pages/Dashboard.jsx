import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { Users, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { employees, admins, attendance, tasks } = useAppData();

  const isAdmin = currentUser?.role === 'Admin';

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === today);
    const presentCount = todayAttendance.filter(a => a.status === 'Present').length;
    const absentCount = todayAttendance.filter(a => a.status === 'Absent').length;

    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'Not Started').length;

    return {
      presentCount,
      absentCount,
      totalEmployees: employees.length,
      totalAdmins: admins.length,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      totalTasks: tasks.length
    };
  }, [employees, admins, attendance, tasks]);

  if (!isAdmin) {
    return (
      <div style={{ padding: '24px' }}>
        <h1 className="heading-font" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>
          Employee Portal
        </h1>
        <p style={{ color: 'hsl(var(--muted-foreground))' }}>
          Welcome, {currentUser?.name}! Navigate using the sidebar to view your attendance and tasks.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="heading-font" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
          Dashboard
        </h1>
        <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.95rem' }}>
          Overview of your organization's attendance and task management
        </p>
      </div>

      {/* Admin Info Card */}
      <div style={{
        backgroundColor: 'hsl(var(--surface))',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid hsl(var(--border))',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: 'hsl(var(--muted-foreground))' }}>
          Current Admin
        </h2>
        <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>
          {currentUser?.name} ({currentUser?.adminId})
        </div>
        <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', marginTop: '6px' }}>
          {currentUser?.designation} • {currentUser?.department}
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* Today's Attendance */}
        <div style={{
          backgroundColor: 'hsl(var(--surface))',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid hsl(var(--border))',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>
              Present Today
            </h3>
            <CheckCircle2 size={20} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.presentCount}</div>
          <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
            out of {stats.totalEmployees} employees
          </div>
        </div>

        {/* Absent Today */}
        <div style={{
          backgroundColor: 'hsl(var(--surface))',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid hsl(var(--border))',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>
              Absent Today
            </h3>
            <AlertCircle size={20} style={{ color: '#ef4444' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.absentCount}</div>
          <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
            employees
          </div>
        </div>

        {/* Total Employees */}
        <div style={{
          backgroundColor: 'hsl(var(--surface))',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid hsl(var(--border))',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>
              Total Employees
            </h3>
            <Users size={20} style={{ color: 'hsl(var(--primary))' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalEmployees}</div>
          <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
            active users
          </div>
        </div>

        {/* Total Admins */}
        <div style={{
          backgroundColor: 'hsl(var(--surface))',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid hsl(var(--border))',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>
              Total Admins
            </h3>
            <Users size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalAdmins}</div>
          <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
            admin accounts
          </div>
        </div>

        {/* Completed Tasks */}
        <div style={{
          backgroundColor: 'hsl(var(--surface))',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid hsl(var(--border))',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>
              Completed Tasks
            </h3>
            <CheckCircle2 size={20} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.completedTasks}</div>
          <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
            of {stats.totalTasks} total tasks
          </div>
        </div>
      </div>

      {/* Employees List */}
      <div style={{
        backgroundColor: 'hsl(var(--surface))',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid hsl(var(--border))',
        padding: '20px',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
          All Employees
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Employee ID</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Department</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Designation</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                  <td style={{ padding: '12px', fontSize: '0.9rem', fontWeight: 600 }}>{emp.employeeId}</td>
                  <td style={{ padding: '12px', fontSize: '0.9rem' }}>{emp.name}</td>
                  <td style={{ padding: '12px', fontSize: '0.9rem' }}>{emp.department}</td>
                  <td style={{ padding: '12px', fontSize: '0.9rem' }}>{emp.designation}</td>
                  <td style={{ padding: '12px', fontSize: '0.9rem' }}>{emp.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      backgroundColor: emp.status === 'Active' ? '#d1fae5' : '#fee2e2',
                      color: emp.status === 'Active' ? '#065f46' : '#7f1d1d',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin List */}
      <div style={{
        backgroundColor: 'hsl(var(--surface))',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid hsl(var(--border))',
        padding: '20px'
      }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
          All Admins
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Admin ID</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>SGID</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Department</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((adm) => (
                <tr key={adm.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                  <td style={{ padding: '12px', fontSize: '0.9rem', fontWeight: 600 }}>{adm.adminId}</td>
                  <td style={{ padding: '12px', fontSize: '0.9rem' }}>{adm.name}</td>
                  <td style={{ padding: '12px', fontSize: '0.9rem' }}>{adm.email}</td>
                  <td style={{ padding: '12px', fontSize: '0.9rem' }}>{adm.sgid}</td>
                  <td style={{ padding: '12px', fontSize: '0.9rem' }}>{adm.department}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      backgroundColor: adm.status === 'Active' ? '#d1fae5' : '#fee2e2',
                      color: adm.status === 'Active' ? '#065f46' : '#7f1d1d',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      {adm.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
