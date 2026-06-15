import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { User, Mail, Phone, Calendar, Briefcase, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const Profile = () => {
  const { currentUser } = useAuth();
  const { tasks, attendance } = useAppData();

  const myEmpId = currentUser?.employeeId;

  // Filter tasks & attendance for current logged-in employee
  const myTasks = tasks.filter((t) => t.assignedEmployeeId === myEmpId);
  const myCompletedTasks = myTasks.filter((t) => t.status === 'Completed');
  const myPendingTasks = myTasks.filter((t) => t.status !== 'Completed');

  const myAttendance = attendance.filter((a) => a.employeeId === myEmpId);
  const myPresentCount = myAttendance.filter((a) => a.status === 'Present').length;
  const myAbsentCount = myAttendance.filter((a) => a.status === 'Absent').length;
  const totalAttendance = myAttendance.length;

  const attendanceRate = totalAttendance > 0 
    ? Math.round((myPresentCount / totalAttendance) * 100) 
    : 100;

  // Task list filters
  const [taskFilter, setTaskFilter] = useState('All');

  const getFilteredTasks = () => {
    if (taskFilter === 'Completed') return myCompletedTasks;
    if (taskFilter === 'Pending') return myPendingTasks;
    return myTasks;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Profile Header Detail */}
      <div className="card" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '24px', 
        padding: '32px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'hsl(var(--primary))',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 700,
          boxShadow: 'var(--shadow-glow)'
        }}>
          {currentUser?.name ? currentUser.name.split(' ').map(n=>n[0]).join('') : 'U'}
        </div>
        <div>
          <h3 className="heading-font" style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            {currentUser?.name}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'hsl(var(--muted))', marginTop: '2px' }}>
            {currentUser?.designation} • {currentUser?.department} Department
          </p>
          <span className="badge badge-success" style={{ marginTop: '8px' }}>
            Active Account
          </span>
        </div>
      </div>

      {/* Info Columns Grid */}
      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
        
        {/* Left Col: Contact and Organization Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h4 className="card-title" style={{ marginBottom: 0 }}>Contact & Employment Details</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={18} style={{ color: 'hsl(var(--primary))' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted))', display: 'block' }}>Employee ID</span>
                  <span style={{ fontWeight: 600 }}>{currentUser?.employeeId}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Briefcase size={18} style={{ color: 'hsl(var(--primary))' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted))', display: 'block' }}>Department</span>
                  <span style={{ fontWeight: 600 }}>{currentUser?.department}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={18} style={{ color: 'hsl(var(--primary))' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted))', display: 'block' }}>Email Address</span>
                  <span style={{ fontWeight: 600 }}>{currentUser?.email}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={18} style={{ color: 'hsl(var(--primary))' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted))', display: 'block' }}>Mobile Phone</span>
                  <span style={{ fontWeight: 600 }}>{currentUser?.phone}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={18} style={{ color: 'hsl(var(--primary))' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted))', display: 'block' }}>Joining Date</span>
                  <span style={{ fontWeight: 600 }}>{currentUser?.dateOfJoining || 'N/A'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User size={18} style={{ color: 'hsl(var(--primary))' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted))', display: 'block' }}>Security Role</span>
                  <span style={{ fontWeight: 600 }}>{currentUser?.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Tasks History List */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <h4 className="card-title" style={{ marginBottom: 0 }}>My Personal Worklog</h4>
              <div style={{ display: 'flex', gap: '4px', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                {['All', 'Pending', 'Completed'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTaskFilter(filter)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: taskFilter === filter ? 'hsl(var(--primary-light))' : 'transparent',
                      color: taskFilter === filter ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                      fontWeight: 600
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {getFilteredTasks().length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {getFilteredTasks().map((task) => (
                  <div key={task.id} style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsl(var(--border))',
                    backgroundColor: 'hsl(var(--muted-light))',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>{task.taskTitle}</p>
                      <p style={{ fontSize: '0.78rem', color: 'hsl(var(--muted))', marginTop: '3px' }}>Due: {task.dueDate} at {task.dueTime}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className={`badge ${task.priority === 'High' ? 'badge-danger' : 'badge-warning'}`}>{task.priority}</span>
                      <span className={`badge ${task.status === 'Completed' ? 'badge-success' : 'badge-info'}`}>{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'hsl(var(--muted))', fontStyle: 'italic', padding: '12px', textAlign: 'center' }}>
                No tasks matches this filter.
              </p>
            )}
          </div>

        </div>

        {/* Right Col: Performance summaries and metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Attendance metric card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
            <h4 className="card-title" style={{ marginBottom: 0, fontSize: '0.98rem' }}>Attendance summary</h4>
            
            {/* Round Gauge */}
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
              <svg width="100%" height="100%" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="hsl(var(--border))" strokeWidth="3.5"></circle>
                <circle cx="21" cy="21" r="15.915" fill="transparent" 
                  stroke="hsl(var(--primary))" strokeWidth="4"
                  strokeDasharray={`${attendanceRate} ${100 - attendanceRate}`} 
                  strokeDashoffset="25">
                </circle>
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 700, fontSize: '1.1rem' }}>
                {attendanceRate}%
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', fontSize: '0.82rem', borderTop: '1px solid hsl(var(--border))', paddingTop: '12px' }}>
              <div>
                <span style={{ color: 'hsl(var(--muted))', display: 'block' }}>Days Present</span>
                <strong style={{ color: 'hsl(var(--success))', fontSize: '0.95rem' }}>{myPresentCount}</strong>
              </div>
              <div>
                <span style={{ color: 'hsl(var(--muted))', display: 'block' }}>Days Absent</span>
                <strong style={{ color: 'hsl(var(--danger))', fontSize: '0.95rem' }}>{myAbsentCount}</strong>
              </div>
            </div>
          </div>

          {/* Task Summary Metrics */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 className="card-title" style={{ marginBottom: 0, fontSize: '0.98rem' }}>Tasks breakdown</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={14} style={{ color: 'hsl(var(--success))' }} />
                  <span>Completed Tasks</span>
                </div>
                <strong>{myCompletedTasks.length}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={14} style={{ color: 'hsl(var(--primary))' }} />
                  <span>Pending Tasks</span>
                </div>
                <strong>{myPendingTasks.length}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={14} style={{ color: 'hsl(var(--warning))' }} />
                  <span>Total Assigned</span>
                </div>
                <strong>{myTasks.length}</strong>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;
