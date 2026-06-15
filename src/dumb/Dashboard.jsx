import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { 
  Users, 
  CalendarCheck, 
  CalendarX, 
  CheckCircle2, 
  Clock, 
  ClipboardList,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  UserCheck,
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { employees, attendance, tasks } = useAppData();
  
  const isAdmin = currentUser?.role === 'Admin';
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper metrics calculation
  const totalEmployees = employees.length;
  
  const attendanceToday = attendance.filter(a => a.date === todayStr);
  const presentTodayCount = attendanceToday.filter(a => a.status === 'Present').length;
  const absentTodayCount = attendanceToday.filter(a => a.status === 'Absent').length;
  const unmarkedTodayCount = Math.max(0, totalEmployees - (presentTodayCount + absentTodayCount));
  
  const tasksAssignedToday = tasks.filter(t => t.assignedDate === todayStr).length;
  const tasksCompletedToday = tasks.filter(t => t.completionDate === todayStr).length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;

  // Employee Specific calculations
  const myEmployeeId = currentUser?.employeeId;
  const myTasks = tasks.filter(t => t.assignedEmployeeId === myEmployeeId);
  const myCompletedTasks = myTasks.filter(t => t.status === 'Completed').length;
  const myPendingTasks = myTasks.filter(t => t.status !== 'Completed').length;
  
  const myAttendanceRecords = attendance.filter(a => a.employeeId === myEmployeeId);
  const myPresentCount = myAttendanceRecords.filter(a => a.status === 'Present').length;
  const myTotalAttendanceCount = myAttendanceRecords.length;
  const myAttendanceRate = myTotalAttendanceCount > 0 
    ? Math.round((myPresentCount / myTotalAttendanceCount) * 100) 
    : 100;

  // General statistics
  const taskInProgress = tasks.filter(t => t.status === 'In Progress').length;
  const taskNotStarted = tasks.filter(t => t.status === 'Not Started').length;
  const taskCompleted = tasks.filter(t => t.status === 'Completed').length;

  const priorityHigh = tasks.filter(t => t.priority === 'High').length;
  const priorityMedium = tasks.filter(t => t.priority === 'Medium').length;
  const priorityLow = tasks.filter(t => t.priority === 'Low').length;

  const recentTasks = [...tasks]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 4);

  const myRecentTasks = [...myTasks]
    .filter(t => t.status !== 'Completed')
    .slice(0, 3);

  // Admin Dashboard Render
  const renderAdminDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Overview Cards Grid */}
      <div className="grid-4">
        
        {/* Total Employees */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'hsl(var(--primary-light))',
            color: 'hsl(var(--primary))'
          }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))', fontWeight: 550 }}>Total Employees</p>
            <h3 className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>{totalEmployees}</h3>
          </div>
        </div>

        {/* Present Today */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'hsl(var(--success-light))',
            color: 'hsl(var(--success))'
          }}>
            <CalendarCheck size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))', fontWeight: 550 }}>Present Today</p>
            <h3 className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>{presentTodayCount}</h3>
          </div>
        </div>

        {/* Absent Today */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'hsl(var(--danger-light))',
            color: 'hsl(var(--danger))'
          }}>
            <CalendarX size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))', fontWeight: 550 }}>Absent Today</p>
            <h3 className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>{absentTodayCount}</h3>
          </div>
        </div>

        {/* Completed Tasks Today */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'hsl(var(--info-light))',
            color: 'hsl(var(--info))'
          }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))', fontWeight: 550 }}>Completed Today</p>
            <h3 className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>{tasksCompletedToday}</h3>
          </div>
        </div>

      </div>

      {/* Task & Attendance Second Level Metrics */}
      <div className="grid-2" style={{ gridTemplateColumns: '2fr 3fr' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h4 className="card-title" style={{ marginBottom: '8px' }}>Attendance Distribution</h4>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', height: '180px' }}>
            {/* Minimalist Visual SVG Donut Chart */}
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg width="100%" height="100%" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="hsl(var(--border))" strokeWidth="4"></circle>
                {/* Present circle */}
                {totalEmployees > 0 && (
                  <circle cx="21" cy="21" r="15.915" fill="transparent" 
                    stroke="hsl(var(--success))" strokeWidth="4.5"
                    strokeDasharray={`${(presentTodayCount/totalEmployees)*100} ${100 - (presentTodayCount/totalEmployees)*100}`} 
                    strokeDashoffset="25">
                  </circle>
                )}
                {/* Absent circle starting after present */}
                {totalEmployees > 0 && (
                  <circle cx="21" cy="21" r="15.915" fill="transparent" 
                    stroke="hsl(var(--danger))" strokeWidth="4.5"
                    strokeDasharray={`${(absentTodayCount/totalEmployees)*100} ${100 - (absentTodayCount/totalEmployees)*100}`} 
                    strokeDashoffset={25 - ((presentTodayCount/totalEmployees)*100)}>
                  </circle>
                )}
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <span className="heading-font" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  {totalEmployees > 0 ? Math.round(((presentTodayCount)/totalEmployees)*100) : 0}%
                </span>
                <p style={{ fontSize: '0.65rem', color: 'hsl(var(--muted))', textTransform: 'uppercase', fontWeight: 600 }}>Present</p>
              </div>
            </div>

            {/* Legends */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'hsl(var(--success))' }} />
                <span style={{ fontWeight: 550, flex: 1 }}>Present:</span>
                <span style={{ fontWeight: 600 }}>{presentTodayCount}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'hsl(var(--danger))' }} />
                <span style={{ fontWeight: 550, flex: 1 }}>Absent:</span>
                <span style={{ fontWeight: 600 }}>{absentTodayCount}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'hsl(var(--border))' }} />
                <span style={{ fontWeight: 550, flex: 1 }}>Unmarked:</span>
                <span style={{ fontWeight: 600 }}>{unmarkedTodayCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Task Metrics Bar Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 className="card-title" style={{ marginBottom: '8px' }}>Task Progression Summary</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center', flex: 1 }}>
            
            {/* Not Started */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', fontWeight: 550 }}>
                <span>Not Started</span>
                <span>{taskNotStarted} tasks</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'hsl(var(--muted-light))', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${tasks.length > 0 ? (taskNotStarted / tasks.length) * 100 : 0}%`, backgroundColor: 'hsl(var(--muted))', transition: 'width 0.4s ease' }} />
              </div>
            </div>

            {/* In Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', fontWeight: 550 }}>
                <span>In Progress</span>
                <span>{taskInProgress} tasks</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'hsl(var(--muted-light))', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${tasks.length > 0 ? (taskInProgress / tasks.length) * 100 : 0}%`, backgroundColor: 'hsl(var(--primary))', transition: 'width 0.4s ease' }} />
              </div>
            </div>

            {/* Completed */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', fontWeight: 550 }}>
                <span>Completed</span>
                <span>{taskCompleted} tasks</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'hsl(var(--muted-light))', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${tasks.length > 0 ? (taskCompleted / tasks.length) * 100 : 0}%`, backgroundColor: 'hsl(var(--success))', transition: 'width 0.4s ease' }} />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Quick Links & Activities */}
      <div className="grid-2">
        {/* Quick actions panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h4 className="card-title" style={{ marginBottom: '0' }}>Quick Administrator Actions</h4>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))' }}>Fast shortcuts to manage directory records, mark logs, or allocate tasks.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1, alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/employees')} style={{ padding: '14px' }}>
              <Users size={16} />
              <span>Manage Directory</span>
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/tasks')} style={{ padding: '14px' }}>
              <ClipboardList size={16} />
              <span>Assign New Task</span>
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/attendance')} style={{ padding: '14px' }}>
              <UserCheck size={16} />
              <span>Mark Attendance</span>
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/reports')} style={{ padding: '14px' }}>
              <BarChart3 size={16} />
              <span>Generate Reports</span>
            </button>
          </div>
        </div>

        {/* Recent tasks log */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 className="card-title" style={{ marginBottom: 0 }}>Recent Tasks Activity</h4>
            <button className="btn btn-icon" onClick={() => navigate('/tasks')} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'hsl(var(--primary))' }}>
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentTasks.map(task => {
              const emp = employees.find(e => e.employeeId === task.assignedEmployeeId);
              return (
                <div key={task.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--muted-light))'
                }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'hsl(var(--foreground))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.taskTitle}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'hsl(var(--muted))' }}>
                      Assignee: {emp ? emp.name : 'Unassigned'}
                    </p>
                  </div>
                  <span className={`badge ${
                    task.status === 'Completed' ? 'badge-success' : task.status === 'In Progress' ? 'badge-primary' : 'badge-muted'
                  }`} style={{
                    backgroundColor: task.status === 'In Progress' ? 'hsl(var(--primary-light))' : '',
                    color: task.status === 'In Progress' ? 'hsl(var(--primary))' : ''
                  }}>
                    {task.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );

  // Employee Dashboard Render
  const renderEmployeeDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Welcome Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsla(var(--primary), 0.8) 100%)',
        color: 'white',
        border: 'none',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <div style={{ zIndex: 1, position: 'relative' }}>
          <h3 className="heading-font" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>
            Hello, {currentUser?.name}!
          </h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.9, maxWidth: '500px' }}>
            You have {myPendingTasks} pending tasks today. Update your progress periodically so managers can track status updates.
          </p>
        </div>
        <div style={{
          position: 'absolute',
          right: '20px',
          bottom: '-20px',
          opacity: 0.15,
          color: 'white'
        }}>
          <ClipboardList size={160} />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4">
        
        {/* Total Tasks Assigned */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'hsl(var(--primary-light))',
            color: 'hsl(var(--primary))'
          }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))', fontWeight: 550 }}>My Tasks</p>
            <h3 className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>{myTasks.length}</h3>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'hsl(var(--warning-light))',
            color: 'hsl(var(--warning))'
          }}>
            <Clock size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))', fontWeight: 550 }}>Pending Tasks</p>
            <h3 className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>{myPendingTasks}</h3>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'hsl(var(--success-light))',
            color: 'hsl(var(--success))'
          }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))', fontWeight: 550 }}>Completed Tasks</p>
            <h3 className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>{myCompletedTasks}</h3>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'hsl(var(--info-light))',
            color: 'hsl(var(--info))'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))', fontWeight: 550 }}>Attendance Rate</p>
            <h3 className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>{myAttendanceRate}%</h3>
          </div>
        </div>

      </div>

      {/* Main Panel Content */}
      <div className="grid-2" style={{ gridTemplateColumns: '3fr 2fr' }}>
        
        {/* Urgent Tasks */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 className="card-title" style={{ marginBottom: 0 }}>My Active Tasks</h4>
            <button className="btn btn-icon" onClick={() => navigate('/tasks')} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'hsl(var(--primary))' }}>
              <span>Open Tasks page</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {myRecentTasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myRecentTasks.map(task => (
                <div key={task.id} style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--muted-light))',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--foreground))' }}>{task.taskTitle}</p>
                    <p style={{ fontSize: '0.78rem', color: 'hsl(var(--muted))', marginTop: '4px' }}>
                      Due: {task.dueDate} at {task.dueTime}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`badge ${
                      task.priority === 'High' ? 'badge-danger' : task.priority === 'Medium' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="badge badge-muted">{task.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: 'hsl(var(--muted))' }}>
              <CheckCircle2 size={36} style={{ color: 'hsl(var(--success))', marginBottom: '8px' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>All caught up! No active tasks assigned.</p>
            </div>
          )}
        </div>

        {/* Quick Attendance Widget */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 className="card-title" style={{ marginBottom: 0 }}>Attendance Status Today</h4>
          
          <div style={{
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'hsl(var(--muted-light))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flex: 1
          }}>
            {attendance.some(a => a.date === todayStr && a.employeeId === myEmployeeId) ? (
              <>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: attendance.find(a => a.date === todayStr && a.employeeId === myEmployeeId).status === 'Present' ? 'hsl(var(--success-light))' : 'hsl(var(--danger-light))',
                  color: attendance.find(a => a.date === todayStr && a.employeeId === myEmployeeId).status === 'Present' ? 'hsl(var(--success))' : 'hsl(var(--danger))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {attendance.find(a => a.date === todayStr && a.employeeId === myEmployeeId).status === 'Present' 
                    ? <CheckCircle2 size={24} /> 
                    : <AlertTriangle size={24} />}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    Attendance Marked: {attendance.find(a => a.date === todayStr && a.employeeId === myEmployeeId).status}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted))', marginTop: '2px' }}>
                    Have a productive day at the office!
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle size={32} style={{ color: 'hsl(var(--warning))' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Attendance Not Marked</p>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted))', marginTop: '2px', marginBottom: '12px' }}>
                    Please note your attendance status for today has not been registered yet.
                  </p>
                  <button className="btn btn-primary" onClick={() => navigate('/attendance')} style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                    Go Mark Attendance
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );

  return (
    <div className="animate-fade-in">
      {isAdmin ? renderAdminDashboard() : renderEmployeeDashboard()}
    </div>
  );
};

export default Dashboard;
