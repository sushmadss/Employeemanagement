import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Download, Users, Calendar, CheckSquare, ShieldAlert, Award } from 'lucide-react';

const Reports = () => {
  const { currentUser } = useAuth();
  const { employees, attendance, tasks, departments } = useAppData();
  
  const isAdmin = currentUser?.role === 'Admin';
  const [activeReportTab, setActiveReportTab] = useState('employee-list');

  if (!isAdmin) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
        <ShieldAlert size={48} style={{ color: 'hsl(var(--danger))', marginBottom: '16px' }} />
        <h3 className="heading-font" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Access Denied</h3>
        <p style={{ color: 'hsl(var(--muted))', fontSize: '0.9rem' }}>You do not have permissions to view reports.</p>
      </div>
    );
  }

  // --- REPORT 1: EMPLOYEE LIST DATA ---
  const getEmployeeReportData = () => {
    return employees.map(emp => [
      emp.employeeId,
      emp.name,
      emp.email,
      emp.department,
      emp.designation,
      emp.dateOfJoining,
      emp.status
    ]);
  };

  // --- REPORT 2: ATTENDANCE SUMMARY DATA ---
  const getAttendanceReportData = () => {
    return employees.map(emp => {
      const records = attendance.filter(a => a.employeeId === emp.employeeId);
      const total = records.length;
      const present = records.filter(r => r.status === 'Present').length;
      const absent = records.filter(r => r.status === 'Absent').length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 100;
      
      return {
        id: emp.employeeId,
        name: emp.name,
        department: emp.department,
        total,
        present,
        absent,
        rate
      };
    });
  };

  // --- REPORT 3: DAILY TASK SUMMARY DATA ---
  const getTaskReportData = () => {
    return employees.map(emp => {
      const myTasks = tasks.filter(t => t.assignedEmployeeId === emp.employeeId);
      const total = myTasks.length;
      const completed = myTasks.filter(t => t.status === 'Completed').length;
      const inProgress = myTasks.filter(t => t.status === 'In Progress').length;
      const pending = myTasks.filter(t => t.status === 'Not Started').length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        id: emp.employeeId,
        name: emp.name,
        department: emp.department,
        total,
        completed,
        inProgress,
        pending,
        rate
      };
    });
  };

  // --- REPORT 4: DEPARTMENT STATS DATA ---
  const getDeptReportData = () => {
    return departments.map(dept => {
      const deptEmployees = employees.filter(e => e.department === dept);
      const staffCount = deptEmployees.length;

      // Calculate task statistics for department
      const deptEmpIds = deptEmployees.map(e => e.employeeId);
      const deptTasks = tasks.filter(t => deptEmpIds.includes(t.assignedEmployeeId));
      const totalTasks = deptTasks.length;
      const completedTasks = deptTasks.filter(t => t.status === 'Completed').length;
      const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Calculate attendance rate for department
      const deptAttendance = attendance.filter(a => deptEmpIds.includes(a.employeeId));
      const totalAtt = deptAttendance.length;
      const presentAtt = deptAttendance.filter(a => a.status === 'Present').length;
      const attRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

      return {
        department: dept,
        staffCount,
        totalTasks,
        completedTasks,
        taskRate,
        attRate
      };
    });
  };

  // --- EXPORT TO CSV FUNCTION ---
  const exportToCSV = (tab) => {
    let headers = [];
    let rows = [];
    let filename = `workflow-report-${tab}.csv`;

    if (tab === 'employee-list') {
      headers = ['Employee ID', 'Name', 'Email', 'Department', 'Designation', 'Joining Date', 'Status'];
      rows = getEmployeeReportData();
    } else if (tab === 'attendance-summary') {
      headers = ['Employee ID', 'Name', 'Department', 'Total Logs', 'Present', 'Absent', 'Attendance Rate (%)'];
      rows = getAttendanceReportData().map(d => [d.id, d.name, d.department, d.total, d.present, d.absent, d.rate]);
    } else if (tab === 'task-summary') {
      headers = ['Employee ID', 'Name', 'Department', 'Total Tasks', 'Completed', 'In Progress', 'Pending', 'Completion Rate (%)'];
      rows = getTaskReportData().map(d => [d.id, d.name, d.department, d.total, d.completed, d.inProgress, d.pending, d.rate]);
    } else if (tab === 'department-stats') {
      headers = ['Department', 'Staff Count', 'Total Tasks', 'Completed Tasks', 'Task Completion Rate (%)', 'Attendance Rate (%)'];
      rows = getDeptReportData().map(d => [d.department, d.staffCount, d.totalTasks, d.completedTasks, d.taskRate, d.attRate]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Upper Navigation and Download Options */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))' }}>Generate analytics sheets and download CSV reports.</p>
        </div>
        <button className="btn btn-primary" onClick={() => exportToCSV(activeReportTab)}>
          <Download size={16} />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Selector Tabs Row */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '2px', overflowX: 'auto' }}>
        {[
          { id: 'employee-list', label: 'Employee Register', icon: Users },
          { id: 'attendance-summary', label: 'Attendance Rates', icon: Calendar },
          { id: 'task-summary', label: 'Task Productivity', icon: CheckSquare },
          { id: 'department-stats', label: 'Department Stats', icon: BarChart3 }
        ].map((tab) => {
          const isActive = activeReportTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                borderBottom: isActive ? '2px solid hsl(var(--primary))' : '2px solid transparent',
                background: 'none',
                fontSize: '0.88rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                cursor: 'pointer',
                transition: 'var(--transition)',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Tables & Visual Analytics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {activeReportTab === 'employee-list' && (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 600 }}>{emp.employeeId}</td>
                    <td style={{ fontWeight: 550 }}>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td>{emp.dateOfJoining}</td>
                    <td>
                      <span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReportTab === 'attendance-summary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Visual highlight */}
            <div className="grid-3">
              {getAttendanceReportData().slice(0, 3).map((d, index) => (
                <div className="card" key={d.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
                  {index === 0 && <Award size={20} style={{ position: 'absolute', top: '20px', right: '20px', color: 'gold' }} />}
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted))', fontWeight: 600 }}>Rank #{index + 1} Attendance</span>
                  <h4 className="heading-font" style={{ fontWeight: 700 }}>{d.name}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '6px' }}>
                    <span>Rate:</span>
                    <strong style={{ color: 'hsl(var(--success))' }}>{d.rate}%</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Logs Count</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th style={{ width: '240px' }}>Attendance Rate (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {getAttendanceReportData().map(d => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.id}</td>
                      <td style={{ fontWeight: 550 }}>{d.name}</td>
                      <td>{d.department}</td>
                      <td>{d.total}</td>
                      <td style={{ color: 'hsl(var(--success))', fontWeight: 600 }}>{d.present}</td>
                      <td style={{ color: 'hsl(var(--danger))', fontWeight: 600 }}>{d.absent}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ flex: 1, height: '8px', backgroundColor: 'hsl(var(--muted-light))', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${d.rate}%`, backgroundColor: d.rate > 80 ? 'hsl(var(--success))' : d.rate > 50 ? 'hsl(var(--warning))' : 'hsl(var(--danger))' }} />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', width: '36px', textAlign: 'right' }}>{d.rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReportTab === 'task-summary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Visual high performers */}
            <div className="grid-3">
              {getTaskReportData().sort((a,b)=>b.rate - a.rate).slice(0, 3).map((d, index) => (
                <div className="card" key={d.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
                  {index === 0 && <Award size={20} style={{ position: 'absolute', top: '20px', right: '20px', color: 'gold' }} />}
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted))', fontWeight: 600 }}>Performance #{index + 1} Completion</span>
                  <h4 className="heading-font" style={{ fontWeight: 700 }}>{d.name}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '6px' }}>
                    <span>Rate:</span>
                    <strong style={{ color: 'hsl(var(--primary))' }}>{d.rate}%</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Assigned Tasks</th>
                    <th>Completed</th>
                    <th>In Progress</th>
                    <th>Not Started</th>
                    <th style={{ width: '240px' }}>Task Completion Rate (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {getTaskReportData().map(d => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.id}</td>
                      <td style={{ fontWeight: 550 }}>{d.name}</td>
                      <td>{d.department}</td>
                      <td style={{ fontWeight: 600 }}>{d.total}</td>
                      <td style={{ color: 'hsl(var(--success))', fontWeight: 600 }}>{d.completed}</td>
                      <td style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>{d.inProgress}</td>
                      <td style={{ color: 'hsl(var(--muted))' }}>{d.pending}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ flex: 1, height: '8px', backgroundColor: 'hsl(var(--muted-light))', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${d.rate}%`, backgroundColor: 'hsl(var(--primary))' }} />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', width: '36px', textAlign: 'right' }}>{d.rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReportTab === 'department-stats' && (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Staff Count</th>
                  <th>Total Tasks</th>
                  <th>Completed Tasks</th>
                  <th>Task Completion Rate (%)</th>
                  <th>Attendance Rate (%)</th>
                </tr>
              </thead>
              <tbody>
                {getDeptReportData().map(d => (
                  <tr key={d.department}>
                    <td style={{ fontWeight: 700, color: 'hsl(var(--primary))' }}>{d.department}</td>
                    <td style={{ fontWeight: 600 }}>{d.staffCount} employees</td>
                    <td>{d.totalTasks}</td>
                    <td>{d.completedTasks}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', backgroundColor: 'hsl(var(--muted-light))', borderRadius: '3px', overflow: 'hidden', maxWidth: '100px' }}>
                          <div style={{ height: '100%', width: `${d.taskRate}%`, backgroundColor: 'hsl(var(--primary))' }} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{d.taskRate}%</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', backgroundColor: 'hsl(var(--muted-light))', borderRadius: '3px', overflow: 'hidden', maxWidth: '100px' }}>
                          <div style={{ height: '100%', width: `${d.attRate}%`, backgroundColor: 'hsl(var(--success))' }} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{d.attRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

export default Reports;
