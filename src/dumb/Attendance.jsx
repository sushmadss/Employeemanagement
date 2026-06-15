import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, Check, X, Search, Filter, ShieldAlert, Clock, AlertCircle, RefreshCw } from 'lucide-react';

const Attendance = () => {
  const { currentUser } = useAuth();
  const { 
    employees, 
    attendance, 
    markAttendance, 
    bulkMarkAttendance,
    attendanceTimingRequests,
    requestTimingCorrection,
    approveTimingRequest,
    rejectTimingRequest,
    getTimingRequestsForEmployee,
    getPendingTimingRequests,
    refreshAllData
  } = useAppData();
  const isAdmin = currentUser?.role === 'Admin';
  const todayStr = new Date().toISOString().split('T')[0];

  // State
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [bulkRecords, setBulkRecords] = useState({}); // { employeeId: 'Present' | 'Absent' }
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState('');
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Timing Request State (Employee)
  const [isTimingRequestModalOpen, setIsTimingRequestModalOpen] = useState(false);
  const [timingRequestDate, setTimingRequestDate] = useState(todayStr);
  const [requestedInTime, setRequestedInTime] = useState('09:00');
  const [requestedOutTime, setRequestedOutTime] = useState('18:00');
  const [timingRequestReason, setTimingRequestReason] = useState('');
  const [timingRequestError, setTimingRequestError] = useState('');
  const [timingRequestSuccess, setTimingRequestSuccess] = useState('');

  // Timing Request State (Admin)
  const [timingRequestsTab, setTimingRequestsTab] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [adminRejectReason, setAdminRejectReason] = useState('');

  // Load existing records for selectedDate into bulkRecords state on mode toggle
  const startBulkEdit = () => {
    const recordsMap = {};
    employees.forEach((emp) => {
      if (emp.status === 'Active') {
        const existing = attendance.find((a) => a.date === selectedDate && a.employeeId === emp.employeeId);
        recordsMap[emp.employeeId] = existing ? existing.status : 'Present'; // default to present
      }
    });
    setBulkRecords(recordsMap);
    setIsBulkEditMode(true);
  };

  const handleBulkStatusChange = (employeeId, status) => {
    setBulkRecords({ ...bulkRecords, [employeeId]: status });
  };

  const saveBulkAttendance = () => {
    const formattedRecords = Object.keys(bulkRecords).map((empId) => ({
      employeeId: empId,
      status: bulkRecords[empId]
    }));
    bulkMarkAttendance(selectedDate, formattedRecords);
    setIsBulkEditMode(false);
  };

  // Filtered attendance list for Admin view logs
  const adminFilteredAttendance = attendance.filter((att) => {
    const emp = employees.find((e) => e.employeeId === att.employeeId);
    if (!emp) return false;

    const matchesDate = att.date === selectedDate;
    const matchesEmployee =
      emp.name.toLowerCase().includes(searchEmployeeQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchEmployeeQuery.toLowerCase());

    return matchesDate && matchesEmployee;
  });

  // Employee Specific Logic
  const myEmpId = currentUser?.employeeId;
  const myRecords = attendance.filter((a) => a.employeeId === myEmpId).sort((a, b) => b.date.localeCompare(a.date));
  const myTotalCount = myRecords.length;
  const myPresentCount = myRecords.filter((r) => r.status === 'Present').length;
  const myAbsentCount = myRecords.filter((r) => r.status === 'Absent').length;
  const myAttendancePercentage = myTotalCount > 0 ? Math.round((myPresentCount / myTotalCount) * 100) : 100;

  const hasMarkedToday = attendance.some((a) => a.date === todayStr && a.employeeId === myEmpId);
  const todayRecord = attendance.find((a) => a.date === todayStr && a.employeeId === myEmpId);

  const handleSelfMark = (status) => {
    markAttendance(todayStr, myEmpId, status);
  };

  // Timing Request Handlers (Employee)
  const handleSubmitTimingRequest = () => {
    setTimingRequestError('');
    setTimingRequestSuccess('');

    if (!timingRequestDate || !requestedInTime || !requestedOutTime) {
      setTimingRequestError('Please fill in all required fields');
      return;
    }

    const result = requestTimingCorrection(
      timingRequestDate,
      myEmpId,
      requestedInTime,
      requestedOutTime,
      timingRequestReason
    );

    if (result.success) {
      setTimingRequestSuccess('Timing correction request submitted successfully! Awaiting admin approval.');
      setTimeout(() => {
        setIsTimingRequestModalOpen(false);
        setTimingRequestDate(todayStr);
        setRequestedInTime('09:00');
        setRequestedOutTime('18:00');
        setTimingRequestReason('');
        setTimingRequestSuccess('');
      }, 2000);
    } else {
      setTimingRequestError(result.error || 'Failed to submit request');
    }
  };

  // Timing Request Handlers (Admin)
  const handleApproveRequest = (requestId) => {
    approveTimingRequest(requestId, currentUser?.name);
  };

  const handleRejectRequest = (requestId, reason) => {
    rejectTimingRequest(requestId, currentUser?.name, reason);
  };

  const handleRefreshAttendance = () => {
    setIsRefreshing(true);
    refreshAllData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Render Admin View
  const renderAdminAttendance = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Date Select Panel */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Calendar size={20} style={{ color: 'hsl(var(--primary))' }} />
          <span style={{ fontWeight: 600 }}>Select Logging Date:</span>
          <input
            type="date"
            className="input-field"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setIsBulkEditMode(false);
            }}
            style={{ width: '160px', height: '40px' }}
          />
        </div>

        {!isBulkEditMode ? (
          <button className="btn btn-primary" onClick={startBulkEdit}>
            <span>Bulk Mark Attendance</span>
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setIsBulkEditMode(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={saveBulkAttendance}>
              Save Attendance Sheet
            </button>
          </div>
        )}
      </div>

      {isBulkEditMode ? (
        /* Bulk Marking Sheet */
        <div className="card">
          <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
            Bulk Attendance Sheet for {selectedDate}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'hsl(var(--muted))', marginBottom: '20px' }}>
            Select attendance status for all active employees and press Save.
          </p>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th style={{ width: '240px', textAlign: 'center' }}>Mark Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.filter(e => e.status === 'Active').map((emp) => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 600 }}>{emp.employeeId}</td>
                    <td>{emp.name}</td>
                    <td>{emp.department}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => handleBulkStatusChange(emp.employeeId, 'Present')}
                          style={{
                            padding: '6px 16px',
                            fontSize: '0.8rem',
                            backgroundColor: bulkRecords[emp.employeeId] === 'Present' ? 'hsl(var(--success))' : 'hsl(var(--muted-light))',
                            color: bulkRecords[emp.employeeId] === 'Present' ? 'white' : 'hsl(var(--foreground))',
                            border: '1px solid ' + (bulkRecords[emp.employeeId] === 'Present' ? 'hsl(var(--success))' : 'hsl(var(--border))')
                          }}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => handleBulkStatusChange(emp.employeeId, 'Absent')}
                          style={{
                            padding: '6px 16px',
                            fontSize: '0.8rem',
                            backgroundColor: bulkRecords[emp.employeeId] === 'Absent' ? 'hsl(var(--danger))' : 'hsl(var(--muted-light))',
                            color: bulkRecords[emp.employeeId] === 'Absent' ? 'white' : 'hsl(var(--foreground))',
                            border: '1px solid ' + (bulkRecords[emp.employeeId] === 'Absent' ? 'hsl(var(--danger))' : 'hsl(var(--border))')
                          }}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View Log Mode */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted))' }} />
              <input
                type="text"
                placeholder="Search logs by employee ID or name..."
                value={searchEmployeeQuery}
                onChange={(e) => setSearchEmployeeQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '38px', height: '40px' }}
              />
            </div>
            
            <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))', fontWeight: 550 }}>
              Date: <span style={{ color: 'hsl(var(--primary))' }}>{selectedDate}</span> • Logs: <span style={{ color: 'hsl(var(--foreground))' }}>{adminFilteredAttendance.length} records</span>
            </div>
          </div>

          {adminFilteredAttendance.length > 0 ? (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminFilteredAttendance.map((record) => {
                    const emp = employees.find((e) => e.employeeId === record.employeeId);
                    return (
                      <tr key={record.id}>
                        <td style={{ fontWeight: 600 }}>{record.employeeId}</td>
                        <td>{emp ? emp.name : 'Unknown Employee'}</td>
                        <td>{emp ? emp.department : 'N/A'}</td>
                        <td>{record.date}</td>
                        <td>
                          <span className={`badge ${record.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'hsl(var(--muted))' }}>
              <ShieldAlert size={40} style={{ marginBottom: '16px', color: 'hsl(var(--warning))' }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 550 }}>No attendance records found for this date.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                Use the <strong style={{ cursor: 'pointer', color: 'hsl(var(--primary))' }} onClick={startBulkEdit}>Bulk Mark Attendance</strong> button to add records.
              </p>
            </div>
          )}

        </div>
      )}

      {!isBulkEditMode && renderTimingRequests()}

    </div>
  );

  // Admin View: Attendance Timing Requests Section
  const renderTimingRequests = () => {
    const allTimingRequests = attendanceTimingRequests;
    
    let filtered = allTimingRequests;
    if (timingRequestsTab === 'pending') {
      filtered = allTimingRequests.filter(r => r.status === 'Pending');
    } else if (timingRequestsTab === 'approved') {
      filtered = allTimingRequests.filter(r => r.status === 'Approved');
    } else if (timingRequestsTab === 'rejected') {
      filtered = allTimingRequests.filter(r => r.status === 'Rejected');
    }

    const pendingCount = allTimingRequests.filter(r => r.status === 'Pending').length;

    return (
      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Clock size={22} style={{ color: 'hsl(var(--warning))' }} />
          <h4 className="card-title" style={{ marginBottom: 0 }}>Attendance Timing Correction Requests</h4>
          {pendingCount > 0 && (
            <span className="badge badge-warning" style={{ marginLeft: 'auto' }}>
              {pendingCount} Pending
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'approved', 'rejected'].map(tab => (
            <button
              key={tab}
              className={`btn ${timingRequestsTab === tab ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTimingRequestsTab(tab)}
              style={{ fontSize: '0.85rem', padding: '6px 12px', textTransform: 'capitalize' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Date</th>
                  <th>Requested In/Out</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(request => {
                  const emp = employees.find(e => e.employeeId === request.employeeId);
                  return (
                    <tr key={request.id}>
                      <td style={{ fontWeight: 600 }}>{request.employeeId}</td>
                      <td>{emp?.name || 'Unknown'}</td>
                      <td>{request.date}</td>
                      <td>{request.requestedInTime} - {request.requestedOutTime}</td>
                      <td style={{ maxWidth: '200px', fontSize: '0.85rem' }}>
                        {request.reason || '-'}
                      </td>
                      <td>
                        <span className={`badge ${
                          request.status === 'Pending' ? 'badge-warning' :
                          request.status === 'Approved' ? 'badge-success' : 'badge-danger'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {request.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              className="btn"
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                backgroundColor: 'hsl(var(--success))',
                                color: 'white',
                                border: 'none'
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id, '')}
                              className="btn"
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                backgroundColor: 'hsl(var(--danger))',
                                color: 'white',
                                border: 'none'
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--muted))' }}>
            <AlertCircle size={32} style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 550 }}>No timing correction requests found.</p>
          </div>
        )}
      </div>
    );
  };

  // Render Employee View
  const renderEmployeeAttendance = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Attendance Summary Widgets */}
      <div className="grid-4">
        <div className="card">
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted))', fontWeight: 600 }}>ATTENDANCE RATE</p>
          <h3 className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--primary))', marginTop: '6px' }}>
            {myAttendancePercentage}%
          </h3>
        </div>
        <div className="card">
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted))', fontWeight: 600 }}>DAYS LOGGED</p>
          <h3 className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '6px' }}>
            {myTotalCount} days
          </h3>
        </div>
        <div className="card">
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted))', fontWeight: 600 }}>DAYS PRESENT</p>
          <h3 className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--success))', marginTop: '6px' }}>
            {myPresentCount} days
          </h3>
        </div>
        <div className="card">
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted))', fontWeight: 600 }}>DAYS ABSENT</p>
          <h3 className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--danger))', marginTop: '6px' }}>
            {myAbsentCount} days
          </h3>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '2fr 3fr' }}>
        
        {/* Self Marking Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h4 className="card-title" style={{ marginBottom: 0 }}>Register Today's Attendance</h4>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))' }}>
            Mark your attendance for today: <strong style={{ color: 'hsl(var(--foreground))' }}>{todayStr}</strong>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
            {hasMarkedToday ? (
              <div style={{
                padding: '24px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: todayRecord.status === 'Present' ? 'hsl(var(--success-light))' : 'hsl(var(--danger-light))',
                border: '1px solid ' + (todayRecord.status === 'Present' ? 'hsla(var(--success), 0.2)' : 'hsla(var(--danger), 0.2)'),
                textAlign: 'center'
              }}>
                <span className={`badge ${todayRecord.status === 'Present' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.9rem', padding: '6px 16px' }}>
                  {todayRecord.status}
                </span>
                <p style={{ fontSize: '0.82rem', color: 'hsl(var(--muted))', marginTop: '12px' }}>
                  Attendance successfully saved at local check-in.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  onClick={() => handleSelfMark('Present')}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '14px', backgroundColor: 'hsl(var(--success))', hover: { backgroundColor: 'green' } }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--success))'}
                >
                  <Check size={18} />
                  <span>Mark Present</span>
                </button>
                <button
                  onClick={() => handleSelfMark('Absent')}
                  className="btn btn-danger"
                  style={{ flex: 1, padding: '14px' }}
                >
                  <X size={18} />
                  <span>Mark Absent</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* History Log Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 className="card-title" style={{ marginBottom: 0 }}>My Personal Attendance Logs</h4>
          
          {myRecords.length > 0 ? (
            <div className="table-container" style={{ maxHeight: '240px', overflowY: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myRecords.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.date}</td>
                      <td>
                        <span className={`badge ${r.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--muted))' }}>
              <Calendar size={32} style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 550 }}>No attendance logs registered in this account.</p>
            </div>
          )}
        </div>

      </div>

      {/* Timing Correction Request Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Clock size={20} style={{ color: 'hsl(var(--warning))' }} />
          <h4 className="card-title" style={{ marginBottom: 0 }}>Request Timing Correction</h4>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))', marginBottom: '16px' }}>
          If you forgot to mark your attendance or need to update your in/out timings, submit a request below. 
          Your request will be reviewed and approved by the admin.
        </p>

        {!isTimingRequestModalOpen ? (
          <button
            onClick={() => setIsTimingRequestModalOpen(true)}
            className="btn btn-primary"
            style={{ marginBottom: 0 }}
          >
            <Clock size={18} />
            <span>Submit Timing Request</span>
          </button>
        ) : (
          <div style={{ backgroundColor: 'hsl(var(--background-secondary))', padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  Date <span style={{ color: 'hsl(var(--danger))' }}>*</span>
                </label>
                <input
                  type="date"
                  value={timingRequestDate}
                  onChange={(e) => setTimingRequestDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    In Time <span style={{ color: 'hsl(var(--danger))' }}>*</span>
                  </label>
                  <input
                    type="time"
                    value={requestedInTime}
                    onChange={(e) => setRequestedInTime(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Out Time <span style={{ color: 'hsl(var(--danger))' }}>*</span>
                  </label>
                  <input
                    type="time"
                    value={requestedOutTime}
                    onChange={(e) => setRequestedOutTime(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                Reason (Optional)
              </label>
              <textarea
                value={timingRequestReason}
                onChange={(e) => setTimingRequestReason(e.target.value)}
                placeholder="Explain why you need this timing correction..."
                className="input-field"
                style={{ minHeight: '80px', resize: 'none' }}
              />
            </div>

            {timingRequestError && (
              <div style={{ padding: '12px', backgroundColor: 'hsl(var(--danger-light))', borderRadius: 'var(--radius-md)', color: 'hsl(var(--danger))', fontSize: '0.85rem' }}>
                ⚠ {timingRequestError}
              </div>
            )}

            {timingRequestSuccess && (
              <div style={{ padding: '12px', backgroundColor: 'hsl(var(--success-light))', borderRadius: 'var(--radius-md)', color: 'hsl(var(--success))', fontSize: '0.85rem' }}>
                ✓ {timingRequestSuccess}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleSubmitTimingRequest}
                className="btn btn-primary"
              >
                Submit Request
              </button>
              <button
                onClick={() => {
                  setIsTimingRequestModalOpen(false);
                  setTimingRequestError('');
                  setTimingRequestSuccess('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Pending Requests Status */}
        {getTimingRequestsForEmployee(myEmpId).length > 0 && (
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid hsl(var(--border))' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>My Timing Requests:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {getTimingRequestsForEmployee(myEmpId).map(req => (
                <div
                  key={req.id}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: req.status === 'Pending' ? 'hsl(var(--warning-light))' :
                                    req.status === 'Approved' ? 'hsl(var(--success-light))' : 'hsl(var(--danger-light))',
                    borderLeft: `4px solid ${req.status === 'Pending' ? 'hsl(var(--warning))' :
                                           req.status === 'Approved' ? 'hsl(var(--success))' : 'hsl(var(--danger))'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {req.date}: {req.requestedInTime} - {req.requestedOutTime}
                      </p>
                      <p style={{ fontSize: '0.8rem', marginTop: '4px', opacity: 0.8 }}>
                        {req.reason || 'No reason provided'}
                      </p>
                    </div>
                    <span className={`badge ${
                      req.status === 'Pending' ? 'badge-warning' :
                      req.status === 'Approved' ? 'badge-success' : 'badge-danger'
                    }`} style={{ whiteSpace: 'nowrap' }}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );

  return (
    <div className="animate-fade-in">
      {isAdmin ? renderAdminAttendance() : renderEmployeeAttendance()}
    </div>
  );
};

export default Attendance;
