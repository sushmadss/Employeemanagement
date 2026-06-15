import React, { createContext, useState, useEffect, useContext } from 'react';

const AppDataContext = createContext(null);

const defaultDepartments = ['HR', 'IT', 'Finance', 'Sales', 'Operations', 'Marketing'];

const defaultAdmins = [
  {
    id: '1',
    adminId: 'ADM001',
    name: 'System Administrator',
    email: 'admin@company.com',
    sgid: 'ADMIN001',
    password: 'admin123',
    department: 'Management',
    designation: 'System Admin',
    status: 'Active',
    role: 'Admin'
  },
  {
    id: '2',
    adminId: 'ADM002',
    name: 'HR Manager Admin',
    email: 'hr.admin@company.com',
    sgid: 'ADMIN002',
    password: 'admin123',
    department: 'HR',
    designation: 'HR Admin',
    status: 'Active',
    role: 'Admin'
  }
];

const defaultEmployees = [
  {
    id: '1',
    employeeId: 'EMP101',
    name: 'John Doe',
    email: 'john.doe@company.com',
    sgid: 'EMP101',
    password: 'emp123',
    phone: '9876543210',
    department: 'HR',
    designation: 'HR Manager',
    dateOfJoining: '2024-01-15',
    status: 'Active',
    role: 'Employee'
  },
  {
    id: '2',
    employeeId: 'EMP102',
    name: 'Alice Smith',
    email: 'alice.smith@company.com',
    sgid: 'EMP102',
    password: 'emp123',
    phone: '9876543211',
    department: 'IT',
    designation: 'Senior Lead Engineer',
    dateOfJoining: '2023-05-10',
    status: 'Active',
    role: 'Employee'
  },
  {
    id: '3',
    employeeId: 'EMP103',
    name: 'Bob Johnson',
    email: 'bob.johnson@company.com',
    sgid: 'EMP103',
    password: 'emp123',
    phone: '9876543212',
    department: 'Finance',
    designation: 'Financial Analyst',
    dateOfJoining: '2024-03-01',
    status: 'Active',
    role: 'Employee'
  },
  {
    id: '4',
    employeeId: 'EMP104',
    name: 'Charlie Brown',
    email: 'charlie.brown@company.com',
    sgid: 'EMP104',
    password: 'emp123',
    phone: '9876543213',
    department: 'Sales',
    designation: 'Sales Executive',
    dateOfJoining: '2024-02-18',
    status: 'Active',
    role: 'Employee'
  },
  {
    id: '5',
    employeeId: 'EMP105',
    name: 'Diana Prince',
    email: 'diana.prince@company.com',
    sgid: 'EMP105',
    password: 'emp123',
    phone: '9876543214',
    department: 'Operations',
    designation: 'Operations Director',
    dateOfJoining: '2022-09-24',
    status: 'Active',
    role: 'Employee'
  },
  {
    id: '6',
    employeeId: 'EMP106',
    name: 'Sarah Connor',
    email: 'employee@company.com',
    sgid: 'EMP106',
    password: 'emp123',
    phone: '1234567890',
    department: 'IT',
    designation: 'Support Engineer',
    dateOfJoining: '2025-01-05',
    status: 'Active',
    role: 'Employee'
  }
];

// Helper to get formatted dates
const getPastDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const defaultAttendance = [
  // Mark present for yesterday
  { id: 'att-1', date: getPastDate(1), employeeId: 'EMP101', status: 'Present', inTime: '09:00', outTime: '18:00' },
  { id: 'att-2', date: getPastDate(1), employeeId: 'EMP102', status: 'Present', inTime: '09:15', outTime: '17:45' },
  { id: 'att-3', date: getPastDate(1), employeeId: 'EMP103', status: 'Present', inTime: '09:30', outTime: '18:15' },
  { id: 'att-4', date: getPastDate(1), employeeId: 'EMP104', status: 'Absent', inTime: '', outTime: '' },
  { id: 'att-5', date: getPastDate(1), employeeId: 'EMP105', status: 'Present', inTime: '08:45', outTime: '17:30' },
  { id: 'att-6', date: getPastDate(1), employeeId: 'EMP106', status: 'Present', inTime: '09:00', outTime: '18:00' },
  
  // Mark present for 2 days ago
  { id: 'att-7', date: getPastDate(2), employeeId: 'EMP101', status: 'Present', inTime: '09:00', outTime: '18:00' },
  { id: 'att-8', date: getPastDate(2), employeeId: 'EMP102', status: 'Present', inTime: '09:00', outTime: '18:00' },
  { id: 'att-9', date: getPastDate(2), employeeId: 'EMP103', status: 'Present', inTime: '09:30', outTime: '18:15' },
  { id: 'att-10', date: getPastDate(2), employeeId: 'EMP104', status: 'Present', inTime: '09:45', outTime: '18:30' },
  { id: 'att-11', date: getPastDate(2), employeeId: 'EMP105', status: 'Present', inTime: '08:45', outTime: '17:30' },
  { id: 'att-12', date: getPastDate(2), employeeId: 'EMP106', status: 'Present', inTime: '09:15', outTime: '18:00' },

  // Mark present for today
  { id: 'att-13', date: getPastDate(0), employeeId: 'EMP101', status: 'Present', inTime: '09:00', outTime: '18:00' },
  { id: 'att-14', date: getPastDate(0), employeeId: 'EMP102', status: 'Present', inTime: '09:15', outTime: '' },
  { id: 'att-15', date: getPastDate(0), employeeId: 'EMP105', status: 'Present', inTime: '08:45', outTime: '' },
  { id: 'att-16', date: getPastDate(0), employeeId: 'EMP106', status: 'Absent', inTime: '', outTime: '' }
];

const defaultTasks = [
  {
    id: 'TSK-1001',
    taskTitle: 'Prepare Monthly Payroll Reports',
    description: 'Compile working hours, overtime, and deductions to send to Accounting.',
    assignedEmployeeId: 'EMP103', // Bob
    assignedDate: getPastDate(2),
    dueDate: getPastDate(-1), // Due tomorrow
    dueTime: '17:00',
    priority: 'High',
    status: 'In Progress',
    completionDate: '',
    comments: [
      { id: 'c1', text: 'Started matching attendance logs with HR records.', date: getPastDate(1), author: 'Bob Johnson' }
    ]
  },
  {
    id: 'TSK-1002',
    taskTitle: 'Resolve Server Latency Issues',
    description: 'Diagnose and fix latency peaks in the main ERP application database connection.',
    assignedEmployeeId: 'EMP102', // Alice
    assignedDate: getPastDate(2),
    dueDate: getPastDate(0), // Due today
    dueTime: '12:00',
    priority: 'High',
    status: 'Completed',
    completionDate: getPastDate(0),
    comments: [
      { id: 'c2', text: 'Identified a missing index on the logs table.', date: getPastDate(1), author: 'Alice Smith' },
      { id: 'c3', text: 'Index created and database response time is down to 40ms. Closing task.', date: getPastDate(0), author: 'Alice Smith' }
    ]
  },
  {
    id: 'TSK-1003',
    taskTitle: 'Update Employee Handbook',
    description: 'Integrate the new remote working policies and mental health days details.',
    assignedEmployeeId: 'EMP101', // John
    assignedDate: getPastDate(1),
    dueDate: getPastDate(-5), // Due next week
    dueTime: '18:00',
    priority: 'Medium',
    status: 'Not Started',
    completionDate: '',
    comments: []
  },
  {
    id: 'TSK-1004',
    taskTitle: 'Onboard New Frontend Developers',
    description: 'Introduce developers to the project architecture, set up credentials, and assign initial tasks.',
    assignedEmployeeId: 'EMP106', // Sarah
    assignedDate: getPastDate(3),
    dueDate: getPastDate(1), // Due yesterday
    dueTime: '16:00',
    priority: 'High',
    status: 'Completed',
    completionDate: getPastDate(1),
    comments: [
      { id: 'c4', text: 'Onboarding completed successfully. Repo cloned and built.', date: getPastDate(1), author: 'Sarah Connor' }
    ]
  },
  {
    id: 'TSK-1005',
    taskTitle: 'Client Pitch Deck Preparation',
    description: 'Finalize financial metrics and mockups for the Q3 pipeline review with the client.',
    assignedEmployeeId: 'EMP104', // Charlie
    assignedDate: getPastDate(0),
    dueDate: getPastDate(0), // Due today
    dueTime: '18:00',
    priority: 'High',
    status: 'In Progress',
    completionDate: '',
    comments: [
      { id: 'c5', text: 'Awaiting updated sales graphs from Bob.', date: getPastDate(0), author: 'Charlie Brown' }
    ]
  },
  {
    id: 'TSK-1006',
    taskTitle: 'Optimize Delivery Pipeline',
    description: 'Perform a bottleneck analysis on operations logistics reports.',
    assignedEmployeeId: 'EMP105', // Diana
    assignedDate: getPastDate(4),
    dueDate: getPastDate(2),
    dueTime: '17:00',
    priority: 'Low',
    status: 'Completed',
    completionDate: getPastDate(2),
    comments: []
  }
];

const defaultAttendanceTimingRequests = [
  // Example: Employee requests correction for their attendance timing
  // { id: 'atr-1', date: '2024-01-15', employeeId: 'EMP101', requestedInTime: '09:05', requestedOutTime: '17:55', reason: 'Forgot to mark', status: 'Pending', submittedDate: '2024-01-15', approvedDate: '', approvedBy: '' }
];

export const AppDataProvider = ({ children }) => {
  const [departments, setDepartments] = useState(() => {
    const saved = localStorage.getItem('wf_departments');
    return saved ? JSON.parse(saved) : defaultDepartments;
  });

  const [admins, setAdmins] = useState(() => {
    const saved = localStorage.getItem('wf_admins');
    return saved ? JSON.parse(saved) : defaultAdmins;
  });

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('wf_employees');
    return saved ? JSON.parse(saved) : defaultEmployees;
  });

  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('wf_attendance');
    return saved ? JSON.parse(saved) : defaultAttendance;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('wf_tasks');
    return saved ? JSON.parse(saved) : defaultTasks;
  });

  const [attendanceTimingRequests, setAttendanceTimingRequests] = useState(() => {
    const saved = localStorage.getItem('wf_attendanceTimingRequests');
    return saved ? JSON.parse(saved) : defaultAttendanceTimingRequests;
  });

  // Merged employees list (admins + employees)
  const allEmployees = [...admins, ...employees];

  // Sync state to localstorage
  useEffect(() => {
    localStorage.setItem('wf_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('wf_admins', JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    localStorage.setItem('wf_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('wf_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('wf_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('wf_attendanceTimingRequests', JSON.stringify(attendanceTimingRequests));
  }, [attendanceTimingRequests]);

  // Real-time sync: Listen for localStorage changes from other tabs/windows (fixes incognito mode issue)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'wf_tasks' && e.newValue) {
        setTasks(JSON.parse(e.newValue));
      }
      if (e.key === 'wf_attendance' && e.newValue) {
        setAttendance(JSON.parse(e.newValue));
      }
      if (e.key === 'wf_attendanceTimingRequests' && e.newValue) {
        setAttendanceTimingRequests(JSON.parse(e.newValue));
      }
      if (e.key === 'wf_employees' && e.newValue) {
        setEmployees(JSON.parse(e.newValue));
      }
      if (e.key === 'wf_admins' && e.newValue) {
        setAdmins(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Polling mechanism to refresh data from localStorage (for cross-browser instances like incognito mode)
  useEffect(() => {
    const interval = setInterval(() => {
      const savedTasks = localStorage.getItem('wf_tasks');
      const savedAttendance = localStorage.getItem('wf_attendance');
      const savedTimingRequests = localStorage.getItem('wf_attendanceTimingRequests');
      
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks);
      }
      if (savedAttendance) {
        const parsedAttendance = JSON.parse(savedAttendance);
        setAttendance(parsedAttendance);
      }
      if (savedTimingRequests) {
        const parsedRequests = JSON.parse(savedTimingRequests);
        setAttendanceTimingRequests(parsedRequests);
      }
    }, 2000); // Poll every 2 seconds for real-time updates

    return () => clearInterval(interval);
  }, []);

  // Admin Actions
  const addAdmin = (adminData) => {
    // Generate new admin ID
    const maxId = admins.reduce((max, adm) => {
      const num = parseInt(adm.adminId.replace('ADM', ''), 10);
      return num > max ? num : max;
    }, 0);
    const newAdmId = `ADM${maxId + 1}`;

    const newAdmin = {
      id: String(Date.now()),
      adminId: newAdmId,
      status: 'Active',
      ...adminData
    };

    setAdmins([...admins, newAdmin]);
    return { success: true, admin: newAdmin };
  };

  const updateAdmin = (id, updatedData) => {
    setAdmins(admins.map((adm) => (adm.id === id ? { ...adm, ...updatedData } : adm)));
    return { success: true };
  };

  const deleteAdmin = (id) => {
    setAdmins(admins.filter((adm) => adm.id !== id));
    return { success: true };
  };

  // Department Actions
  const addDepartment = (name) => {
    if (departments.some((d) => d.toLowerCase() === name.toLowerCase())) {
      return { success: false, error: 'Department already exists.' };
    }
    setDepartments([...departments, name]);
    return { success: true };
  };

  const updateDepartment = (oldName, newName) => {
    if (departments.some((d) => d.toLowerCase() === newName.toLowerCase() && d !== oldName)) {
      return { success: false, error: 'New department name already exists.' };
    }
    setDepartments(departments.map((d) => (d === oldName ? newName : d)));
    // Also update all employee departments
    setEmployees(
      employees.map((emp) => (emp.department === oldName ? { ...emp, department: newName } : emp))
    );
    return { success: true };
  };

  const deleteDepartment = (name) => {
    setDepartments(departments.filter((d) => d !== name));
    return { success: true };
  };

  // Employee Actions
  const addEmployee = (empData) => {
    // Check if adding an admin or regular employee
    if (empData.role === 'Admin') {
      // Generate new admin ID
      const maxId = admins.reduce((max, adm) => {
        const num = parseInt(adm.adminId.replace('ADM', ''), 10);
        return num > max ? num : max;
      }, 0);
      const newAdmId = `ADM${maxId + 1}`;

      const newAdmin = {
        id: String(Date.now()),
        adminId: newAdmId,
        status: 'Active',
        role: 'Admin',
        ...empData
      };

      setAdmins([...admins, newAdmin]);
      return { success: true, employee: newAdmin };
    } else {
      // Generate new employee ID
      const maxId = employees.reduce((max, emp) => {
        const num = parseInt(emp.employeeId.replace('EMP', ''), 10);
        return num > max ? num : max;
      }, 100);
      const newEmpId = `EMP${maxId + 1}`;

      const newEmployee = {
        id: String(Date.now()),
        employeeId: newEmpId,
        status: 'Active',
        role: 'Employee',
        ...empData
      };

      setEmployees([...employees, newEmployee]);
      return { success: true, employee: newEmployee };
    }
  };

  const updateEmployee = (id, updatedData) => {
    // Check if updating an admin or regular employee
    const admin = admins.find((adm) => adm.id === id);
    if (admin) {
      setAdmins(admins.map((adm) => (adm.id === id ? { ...adm, ...updatedData } : adm)));
      return { success: true };
    }
    
    const employee = employees.find((emp) => emp.id === id);
    if (employee) {
      setEmployees(employees.map((emp) => (emp.id === id ? { ...emp, ...updatedData } : emp)));
      return { success: true };
    }

    return { success: false, error: 'Employee not found' };
  };

  const deleteEmployee = (employeeId) => {
    // Check if deleting an admin or regular employee
    const admin = admins.find((adm) => adm.id === employeeId);
    if (admin) {
      setAdmins(admins.filter((adm) => adm.id !== employeeId));
      return { success: true };
    }
    
    const employee = employees.find((emp) => emp.id === employeeId);
    if (employee) {
      setEmployees(employees.filter((emp) => emp.id !== employeeId));
      return { success: true };
    }

    return { success: false, error: 'Employee not found' };
  };

  // Attendance Actions
  const markAttendance = (date, employeeId, status, inTime = '', outTime = '') => {
    const existingIndex = attendance.findIndex(
      (a) => a.date === date && a.employeeId === employeeId
    );

    if (existingIndex > -1) {
      const updated = [...attendance];
      updated[existingIndex] = {
        ...updated[existingIndex],
        status,
        inTime: inTime || updated[existingIndex].inTime,
        outTime: outTime || updated[existingIndex].outTime
      };
      setAttendance(updated);
    } else {
      const newRecord = {
        id: `att-${Date.now()}`,
        date,
        employeeId,
        status,
        inTime,
        outTime
      };
      setAttendance([...attendance, newRecord]);
    }
  };

  const bulkMarkAttendance = (date, records) => {
    // records is an array of { employeeId, status, inTime, outTime }
    const updatedAttendance = [...attendance];
    records.forEach(({ employeeId, status, inTime = '', outTime = '' }) => {
      const idx = updatedAttendance.findIndex((a) => a.date === date && a.employeeId === employeeId);
      if (idx > -1) {
        updatedAttendance[idx] = {
          ...updatedAttendance[idx],
          status,
          inTime: inTime || updatedAttendance[idx].inTime,
          outTime: outTime || updatedAttendance[idx].outTime
        };
      } else {
        updatedAttendance.push({
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          date,
          employeeId,
          status,
          inTime,
          outTime
        });
      }
    });
    setAttendance(updatedAttendance);
  };

  // Task Actions
  const assignTask = (taskData) => {
    const maxId = tasks.reduce((max, t) => {
      const num = parseInt(t.id.replace('TSK-', ''), 10);
      return num > max ? num : max;
    }, 1000);
    const newTaskId = `TSK-${maxId + 1}`;

    const newTask = {
      id: newTaskId,
      assignedDate: new Date().toISOString().split('T')[0],
      status: 'Not Started',
      completionDate: '',
      comments: [],
      ...taskData
    };

    setTasks([...tasks, newTask]);
    return { success: true };
  };

  const updateTaskDetails = (taskId, updatedData) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, ...updatedData } : task)));
    return { success: true };
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    return { success: true };
  };

  const updateTaskStatus = (taskId, status, commentText = '', authorName = '') => {
    setTasks(
      tasks.map((task) => {
        if (task.id !== taskId) return task;

        const updatedComments = [...task.comments];
        if (commentText.trim()) {
          updatedComments.push({
            id: `c-${Date.now()}`,
            text: commentText.trim(),
            date: new Date().toISOString().split('T')[0],
            author: authorName || 'System'
          });
        }

        return {
          ...task,
          status,
          completionDate: status === 'Completed' ? new Date().toISOString().split('T')[0] : '',
          comments: updatedComments
        };
      })
    );
    return { success: true };
  };

  // Attendance Timing Request Actions
  const requestTimingCorrection = (date, employeeId, requestedInTime, requestedOutTime, reason) => {
    // Check if employee already has a pending request for this date
    const existingRequest = attendanceTimingRequests.find(
      (req) => req.date === date && req.employeeId === employeeId && req.status === 'Pending'
    );

    if (existingRequest) {
      return { success: false, error: 'You already have a pending timing request for this date.' };
    }

    const newRequest = {
      id: `atr-${Date.now()}`,
      date,
      employeeId,
      requestedInTime,
      requestedOutTime,
      reason: reason || '',
      status: 'Pending',
      submittedDate: new Date().toISOString().split('T')[0],
      approvedDate: '',
      approvedBy: ''
    };

    setAttendanceTimingRequests([...attendanceTimingRequests, newRequest]);
    return { success: true, request: newRequest };
  };

  const approveTimingRequest = (requestId, adminName, adminId) => {
    const updated = attendanceTimingRequests.map((req) => {
      if (req.id === requestId) {
        // Also update the attendance record with the approved timings
        markAttendance(req.date, req.employeeId, 'Present', req.requestedInTime, req.requestedOutTime);
        return {
          ...req,
          status: 'Approved',
          approvedDate: new Date().toISOString().split('T')[0],
          approvedBy: adminName || 'Admin'
        };
      }
      return req;
    });
    setAttendanceTimingRequests(updated);
    return { success: true };
  };

  const rejectTimingRequest = (requestId, adminName, rejectReason) => {
    const updated = attendanceTimingRequests.map((req) => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'Rejected',
          approvedDate: new Date().toISOString().split('T')[0],
          approvedBy: adminName || 'Admin',
          rejectReason: rejectReason || ''
        };
      }
      return req;
    });
    setAttendanceTimingRequests(updated);
    return { success: true };
  };

  const getTimingRequestsForEmployee = (employeeId) => {
    return attendanceTimingRequests.filter((req) => req.employeeId === employeeId);
  };

  const getPendingTimingRequests = () => {
    return attendanceTimingRequests.filter((req) => req.status === 'Pending');
  };

  // Manual refresh function to reload all data from localStorage
  const refreshAllData = () => {
    const savedTasks = localStorage.getItem('wf_tasks');
    const savedAttendance = localStorage.getItem('wf_attendance');
    const savedTimingRequests = localStorage.getItem('wf_attendanceTimingRequests');
    const savedEmployees = localStorage.getItem('wf_employees');
    const savedAdmins = localStorage.getItem('wf_admins');
    
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
    if (savedTimingRequests) setAttendanceTimingRequests(JSON.parse(savedTimingRequests));
    if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
    if (savedAdmins) setAdmins(JSON.parse(savedAdmins));
  };

  return (
    <AppDataContext.Provider
      value={{
        departments,
        admins,
        employees: allEmployees,
        attendance,
        tasks,
        attendanceTimingRequests,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addAdmin,
        updateAdmin,
        deleteAdmin,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        markAttendance,
        bulkMarkAttendance,
        assignTask,
        updateTaskDetails,
        deleteTask,
        updateTaskStatus,
        requestTimingCorrection,
        approveTimingRequest,
        rejectTimingRequest,
        getTimingRequestsForEmployee,
        getPendingTimingRequests,
        refreshAllData
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within an AppDataProvider');
  return context;
};
