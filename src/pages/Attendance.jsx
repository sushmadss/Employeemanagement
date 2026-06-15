import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { Calendar, Clock, Eye, Trash2, Plus, Search, DownloadCloud, CheckCircle2, XCircle, Check, X } from 'lucide-react';

const Attendance = () => {
  const { currentUser } = useAuth();
  const { attendance, employees, markAttendance, attendanceTimingRequests, requestTimingCorrection, approveTimingRequest, rejectTimingRequest } = useAppData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    date: '',
    requestedInTime: '',
    requestedOutTime: '',
    reason: ''
  });
  const [filterRequestStatus, setFilterRequestStatus] = useState('');

  const isAdmin = currentUser?.role === 'Admin';

  // Get employee map for quick lookup
  const employeeMap = useMemo(() => {
    const map = {};
    employees.forEach(emp => {
      map[emp.employeeId] = emp;
    });
    return map;
  }, [employees]);

  // Filter attendance based on user role and search/date filters
  const filteredAttendance = useMemo(() => {
    let filtered = attendance;

    if (!isAdmin) {
      // Employees only see their own attendance
      filtered = filtered.filter(a => a.employeeId === currentUser.employeeId);
    } else {
      // Admins can filter by date range (month filter)
      if (filterMonth) {
        filtered = filtered.filter(a => a.date.startsWith(filterMonth));
      }
    }

    // Search by employee name
    if (searchTerm) {
      filtered = filtered.filter(a => {
        const emp = employeeMap[a.employeeId];
        return emp?.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [attendance, isAdmin, currentUser, filterMonth, searchTerm, employeeMap]);

  // Today's attendance for admin marking
  const todayAttendance = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendance.filter(a => a.date === today);
    const recordMap = {};
    todayRecords.forEach(r => recordMap[r.employeeId] = r);

    return employees.map(emp => {
      const record = recordMap[emp.employeeId];
      return {
        employeeId: emp.employeeId,
        name: emp.name,
        department: emp.department,
        status: record?.status || '',
        inTime: record?.inTime || '',
        outTime: record?.outTime || '',
        id: record?.id
      };
    });
  }, [attendance, employees]);

  const handleMarkAttendance = (employeeId, status, inTime, outTime) => {
    const today = new Date().toISOString().split('T')[0];
    markAttendance(today, employeeId, status, inTime, outTime);
    setEditingId(null);
  };

  const handleEditStart = (record) => {
    setEditingId(record.employeeId);
    setEditData({
      status: record.status,
      inTime: record.inTime,
      outTime: record.outTime
    });
  };

  const handleEditSave = (employeeId) => {
    handleMarkAttendance(employeeId, editData.status, editData.inTime, editData.outTime);
  };

  const handleRequestTimingCorrection = () => {
    if (!requestData.date || !requestData.requestedInTime || !requestData.requestedOutTime) {
      alert('Please fill in all required fields');
      return;
    }

    // Validation: Date cannot be in the future
    const selectedDate = new Date(requestData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      alert('You cannot request timing correction for a future date');
      return;
    }

    // Validation: In time must be before out time
    const inTime = requestData.requestedInTime.split(':').map(Number);
    const outTime = requestData.requestedOutTime.split(':').map(Number);
    const inTotalMins = inTime[0] * 60 + inTime[1];
    const outTotalMins = outTime[0] * 60 + outTime[1];

    if (inTotalMins >= outTotalMins) {
      alert('Out time must be after in time');
      return;
    }

    // Validation: Reasonable working hours (in time should not be before 6 AM or after 12 PM)
    if (inTime[0] < 6 || (inTime[0] >= 12 && inTime[0] < 16)) {
      alert('In time should be within reasonable working hours (6 AM - 12 PM or 4 PM onwards)');
      return;
    }

    // Validation: Out time should not be after 11 PM
    if (outTime[0] >= 23) {
      alert('Out time should be before 11 PM');
      return;
    }

    const result = requestTimingCorrection(
      requestData.date,
      currentUser.employeeId,
      requestData.requestedInTime,
      requestData.requestedOutTime,
      requestData.reason
    );

    if (result.success) {
      alert('Timing request submitted successfully');
      setRequestData({ date: '', requestedInTime: '', requestedOutTime: '', reason: '' });
      setShowRequestForm(false);
    } else {
      alert(result.error || 'Failed to submit request');
    }
  };

  const handleApproveRequest = (requestId) => {
    approveTimingRequest(requestId, currentUser.name, currentUser.adminId || currentUser.employeeId);
    alert('Timing request approved');
  };

  const handleRejectRequest = (requestId) => {
    const reason = prompt('Enter rejection reason (optional):');
    rejectTimingRequest(requestId, currentUser.name, reason || '');
    alert('Timing request rejected');
  };

  const getEmployeeTimingRequests = () => {
    return attendanceTimingRequests.filter(req => req.employeeId === currentUser.employeeId);
  };

  const getPendingTimingRequests = () => {
    let requests = attendanceTimingRequests.filter(req => req.status === 'Pending');
    if (filterRequestStatus) {
      requests = requests.filter(req => req.status === filterRequestStatus);
    }
    return requests;
  };

  const getRequestStatusBadge = (status) => {
    if (status === 'Approved') {
      return <span style={{ padding: '4px 12px', borderRadius: '4px', backgroundColor: '#d1fae5', color: '#065f46', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} /> Approved</span>;
    }
    if (status === 'Rejected') {
      return <span style={{ padding: '4px 12px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#7f1d1d', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={14} /> Rejected</span>;
    }
    if (status === 'Pending') {
      return <span style={{ padding: '4px 12px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#78350f', fontSize: '0.85rem', fontWeight: 600 }}>Pending</span>;
    }
    return <span style={{ padding: '4px 12px', borderRadius: '4px', backgroundColor: '#e5e7eb', color: '#374151', fontSize: '0.85rem', fontWeight: 600 }}>{status}</span>;
  };

  const calculateDuration = (inTime, outTime) => {
    if (!inTime || !outTime) return '-';
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    const inMins = inH * 60 + inM;
    const outMins = outH * 60 + outM;
    const diffMins = outMins - inMins;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusBadge = (status) => {
    if (status === 'Present') {
      return <span style={{ padding: '4px 12px', borderRadius: '4px', backgroundColor: '#d1fae5', color: '#065f46', fontSize: '0.85rem', fontWeight: 600 }}>Present</span>;
    }
    if (status === 'Absent') {
      return <span style={{ padding: '4px 12px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#7f1d1d', fontSize: '0.85rem', fontWeight: 600 }}>Absent</span>;
    }
    return <span style={{ padding: '4px 12px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#78350f', fontSize: '0.85rem', fontWeight: 600 }}>Not Marked</span>;
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="heading-font" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
          {isAdmin ? 'Attendance Management' : 'My Attendance'}
        </h1>
        <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.95rem' }}>
          {isAdmin 
            ? 'Manage employee attendance records, in-time, and out-time'
            : 'View your attendance history and work hours'}
        </p>
      </div>

      {/* Controls */}
      {isAdmin && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'auto 1fr auto',
          gap: '16px',
          marginBottom: '24px',
          alignItems: 'center'
        }}>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid hsl(var(--border))',
              fontSize: '0.95rem'
            }}
          />
          <input
            type="text"
            placeholder="Search by employee name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid hsl(var(--border))',
              fontSize: '0.95rem'
            }}
          />
          <button
            onClick={() => window.print()}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'hsl(var(--primary))',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600
            }}
          >
            <DownloadCloud size={18} />
            Export
          </button>
        </div>
      )}

      {/* Attendance Table */}
      <div style={{ 
        backgroundColor: 'hsl(var(--surface))',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid hsl(var(--border))',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--muted))' }}>
                {isAdmin && <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Employee</th>}
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>In Time</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Out Time</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Duration</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                {isAdmin && <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((record) => (
                  <tr key={record.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                    {isAdmin && (
                      <td style={{ padding: '16px', fontWeight: 600 }}>
                        {employeeMap[record.employeeId]?.name}
                      </td>
                    )}
                    <td style={{ padding: '16px' }}>
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} />
                        {record.inTime || '-'}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {record.outTime || '-'}
                    </td>
                    <td style={{ padding: '16px', fontWeight: 600 }}>
                      {calculateDuration(record.inTime, record.outTime)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {getStatusBadge(record.status)}
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleEditStart(record)}
                          style={{
                            backgroundColor: 'hsl(var(--primary))',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee: Request Timing Correction */}
      {!isAdmin && (
        <div style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="heading-font" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              Request Timing Correction
            </h2>
            <button
              onClick={() => setShowRequestForm(!showRequestForm)}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'hsl(var(--primary))',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600
              }}
            >
              <Plus size={18} />
              New Request
            </button>
          </div>

          {showRequestForm && (
            <div style={{
              backgroundColor: 'hsl(var(--surface))',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid hsl(var(--border))',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Submit Timing Request</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Date *</label>
                  <input
                    type="date"
                    value={requestData.date}
                    onChange={(e) => setRequestData({ ...requestData, date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid hsl(var(--border))',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>
                    Cannot select future dates
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>In Time *</label>
                  <input
                    type="time"
                    value={requestData.requestedInTime}
                    onChange={(e) => setRequestData({ ...requestData, requestedInTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid hsl(var(--border))',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>
                    Between 6:00 AM - 12:00 PM or 4:00 PM onwards
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Out Time *</label>
                  <input
                    type="time"
                    value={requestData.requestedOutTime}
                    onChange={(e) => setRequestData({ ...requestData, requestedOutTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid hsl(var(--border))',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>
                    Must be after In Time, before 11:00 PM
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Reason</label>
                <textarea
                  placeholder="Enter reason for timing correction (optional)"
                  value={requestData.reason}
                  onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsl(var(--border))',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleRequestTimingCorrection}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Submit Request
                </button>
                <button
                  onClick={() => {
                    setShowRequestForm(false);
                    setRequestData({ date: '', requestedInTime: '', requestedOutTime: '', reason: '' });
                  }}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'hsl(var(--muted))',
                    color: 'hsl(var(--muted-foreground))',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Employee's Timing Requests History */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>My Timing Requests</h3>
          <div style={{ 
            backgroundColor: 'hsl(var(--surface))',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid hsl(var(--border))',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--muted))' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Requested In</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Requested Out</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Reason</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {getEmployeeTimingRequests().length > 0 ? (
                    getEmployeeTimingRequests().sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate)).map((req) => (
                      <tr key={req.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                        <td style={{ padding: '16px' }}>
                          {new Date(req.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </td>
                        <td style={{ padding: '16px', fontWeight: 600 }}>{req.requestedInTime}</td>
                        <td style={{ padding: '16px', fontWeight: 600 }}>{req.requestedOutTime}</td>
                        <td style={{ padding: '16px', color: 'hsl(var(--muted-foreground))' }}>{req.reason || '-'}</td>
                        <td style={{ padding: '16px' }}>{getRequestStatusBadge(req.status)}</td>
                        <td style={{ padding: '16px', fontSize: '0.9rem' }}>
                          {new Date(req.submittedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                        No timing requests yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Admin: Mark Today's Attendance */}
      {isAdmin && (
        <div style={{ marginTop: '32px' }}>
          <h2 className="heading-font" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>
            Mark Today's Attendance
          </h2>
          <div style={{ 
            backgroundColor: 'hsl(var(--surface))',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid hsl(var(--border))',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--muted))' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Employee</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Department</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>In Time</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Out Time</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAttendance.map((record) => (
                    <tr key={record.employeeId} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{record.name}</td>
                      <td style={{ padding: '16px' }}>{record.department}</td>
                      <td style={{ padding: '16px' }}>
                        {editingId === record.employeeId ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => setEditData({ ...editData, status: 'Present' })}
                              style={{
                                padding: '8px 14px',
                                borderRadius: '4px',
                                border: '2px solid hsl(var(--border))',
                                backgroundColor: editData.status === 'Present' ? '#d1fae5' : 'hsl(var(--surface))',
                                color: editData.status === 'Present' ? '#065f46' : 'hsl(var(--muted-foreground))',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <Check size={16} />
                              Present
                            </button>
                            <button
                              onClick={() => setEditData({ ...editData, status: 'Absent' })}
                              style={{
                                padding: '8px 14px',
                                borderRadius: '4px',
                                border: '2px solid hsl(var(--border))',
                                backgroundColor: editData.status === 'Absent' ? '#fee2e2' : 'hsl(var(--surface))',
                                color: editData.status === 'Absent' ? '#7f1d1d' : 'hsl(var(--muted-foreground))',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <X size={16} />
                              Absent
                            </button>
                          </div>
                        ) : (
                          getStatusBadge(record.status)
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {editingId === record.employeeId ? (
                          <input
                            type="time"
                            value={editData.inTime}
                            onChange={(e) => setEditData({ ...editData, inTime: e.target.value })}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '4px',
                              border: '1px solid hsl(var(--border))',
                              fontSize: '0.9rem'
                            }}
                          />
                        ) : (
                          record.inTime || '-'
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {editingId === record.employeeId ? (
                          <input
                            type="time"
                            value={editData.outTime}
                            onChange={(e) => setEditData({ ...editData, outTime: e.target.value })}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '4px',
                              border: '1px solid hsl(var(--border))',
                              fontSize: '0.9rem'
                            }}
                          />
                        ) : (
                          record.outTime || '-'
                        )}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {editingId === record.employeeId ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleEditSave(record.employeeId)}
                              style={{
                                backgroundColor: 'hsl(var(--primary))',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              style={{
                                backgroundColor: 'hsl(var(--muted))',
                                color: 'hsl(var(--muted-foreground))',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditStart(record)}
                            style={{
                              backgroundColor: 'hsl(var(--primary))',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 600
                            }}
                          >
                            Mark
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Admin: Review Timing Requests */}
      {isAdmin && (
        <div style={{ marginTop: '32px' }}>
          <h2 className="heading-font" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>
            Timing Correction Requests
          </h2>

          {getPendingTimingRequests().length > 0 ? (
            <div style={{ 
              backgroundColor: 'hsl(var(--surface))',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid hsl(var(--border))',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--muted))' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Employee</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Requested In</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Requested Out</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Reason</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPendingTimingRequests().sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate)).map((req) => (
                      <tr key={req.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                        <td style={{ padding: '16px', fontWeight: 600 }}>
                          {employeeMap[req.employeeId]?.name}
                        </td>
                        <td style={{ padding: '16px' }}>
                          {new Date(req.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </td>
                        <td style={{ padding: '16px', fontWeight: 600 }}>{req.requestedInTime}</td>
                        <td style={{ padding: '16px', fontWeight: 600 }}>{req.requestedOutTime}</td>
                        <td style={{ padding: '16px', color: 'hsl(var(--muted-foreground))' }}>{req.reason || '-'}</td>
                        <td style={{ padding: '16px' }}>{getRequestStatusBadge(req.status)}</td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          {req.status === 'Pending' ? (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleApproveRequest(req.id)}
                                style={{
                                  backgroundColor: '#d1fae5',
                                  color: '#065f46',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '6px 12px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <CheckCircle2 size={14} />
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectRequest(req.id)}
                                style={{
                                  backgroundColor: '#fee2e2',
                                  color: '#7f1d1d',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '6px 12px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                            </div>
                          ) : (
                            getRequestStatusBadge(req.status)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'hsl(var(--surface))',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid hsl(var(--border))',
              padding: '40px',
              textAlign: 'center',
              color: 'hsl(var(--muted-foreground))'
            }}>
              No pending timing requests
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Attendance;
