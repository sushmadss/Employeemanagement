import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { Trash2, Edit2, Plus, Calendar, Clock, AlertCircle, CheckCircle2, Circle, Search } from 'lucide-react';

const Tasks = () => {
  const { currentUser } = useAuth();
  const { tasks, employees, assignTask, updateTaskDetails, deleteTask, updateTaskStatus } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskComments, setTaskComments] = useState({});
  const [newTask, setNewTask] = useState({
    taskTitle: '',
    description: '',
    assignedEmployeeId: '',
    dueDate: '',
    dueTime: '18:00',
    priority: 'Medium'
  });

  const isAdmin = currentUser?.role === 'Admin';
  const [filterCategory, setFilterCategory] = useState('All');

  // Get employee map
  const employeeMap = useMemo(() => {
    const map = {};
    employees.forEach(emp => {
      map[emp.employeeId] = emp;
    });
    return map;
  }, [employees]);

  // Helper function to check if task is due today
  const isDueToday = (dueDate) => {
    const today = new Date();
    const taskDate = new Date(dueDate);
    return taskDate.toDateString() === today.toDateString();
  };

  // Filter tasks based on role
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (!isAdmin) {
      // Employees only see tasks assigned to them
      filtered = filtered.filter(t => t.assignedEmployeeId === currentUser.employeeId);
    }

    // Apply category filter
    if (filterCategory && filterCategory !== 'All') {
      if (filterCategory === 'Pending') {
        filtered = filtered.filter(t => t.status === 'Not Started');
      } else if (filterCategory === 'In Progress') {
        filtered = filtered.filter(t => t.status === 'In Progress');
      } else if (filterCategory === 'Completed') {
        filtered = filtered.filter(t => t.status === 'Completed');
      } else if (filterCategory === 'Due Today') {
        filtered = filtered.filter(t => isDueToday(t.dueDate));
      } else if (filterCategory === 'Overdue') {
        filtered = filtered.filter(t => isOverdue(t.dueDate, t.status));
      }
    }

    // Search by task title, description, employee name, status, or priority
    if (searchTerm) {
      filtered = filtered.filter(t => {
        const employee = employeeMap[t.assignedEmployeeId];
        const employeeName = employee?.name || '';
        return (
          t.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.priority.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    return filtered.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
  }, [tasks, isAdmin, currentUser, filterCategory, searchTerm, employeeMap])

  const handleAddTask = () => {
    if (!newTask.taskTitle || !newTask.assignedEmployeeId || !newTask.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    assignTask(newTask);
    setNewTask({
      taskTitle: '',
      description: '',
      assignedEmployeeId: '',
      dueDate: '',
      dueTime: '18:00',
      priority: 'Medium'
    });
    setShowNewTaskForm(false);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateTaskStatus(taskId, newStatus);
  };

  const handleSaveComment = (taskId) => {
    const comment = taskComments[taskId]?.trim();
    if (!comment) {
      alert('Please enter a comment');
      return;
    }

    updateTaskStatus(taskId, tasks.find(t => t.id === taskId)?.status, comment, currentUser?.name);
    setTaskComments({ ...taskComments, [taskId]: '' });
  };

  const getPriorityBadge = (priority) => {
    let bgColor = 'hsl(var(--primary))';
    let textColor = 'white';

    if (priority === 'High') {
      bgColor = '#ef4444';
    } else if (priority === 'Medium') {
      bgColor = '#f59e0b';
    } else if (priority === 'Low') {
      bgColor = '#10b981';
    }

    return (
      <span style={{
        padding: '6px 12px',
        borderRadius: '4px',
        backgroundColor: bgColor,
        color: textColor,
        fontSize: '0.85rem',
        fontWeight: 600
      }}>
        {priority}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    if (status === 'Completed') return <CheckCircle2 size={20} style={{ color: '#10b981' }} />;
    if (status === 'In Progress') return <Circle size={20} style={{ color: '#f59e0b', fill: '#f59e0b' }} />;
    return <Circle size={20} style={{ color: '#d1d5db' }} />;
  };

  const isOverdue = (dueDate, status) => {
    return status !== 'Completed' && new Date(dueDate) < new Date();
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="heading-font" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
            {isAdmin ? 'Task Management' : 'My Tasks'}
          </h1>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.95rem' }}>
            {isAdmin
              ? 'Assign and manage employee tasks'
              : 'Track your assigned tasks and deadlines'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowNewTaskForm(!showNewTaskForm)}
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
            New Task
          </button>
        )}
      </div>

      {/* New Task Form */}
      {isAdmin && showNewTaskForm && (
        <div style={{
          backgroundColor: 'hsl(var(--surface))',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid hsl(var(--border))',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Create New Task</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Task Title *</label>
              <input
                type="text"
                placeholder="Enter task title"
                value={newTask.taskTitle}
                onChange={(e) => setNewTask({ ...newTask, taskTitle: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid hsl(var(--border))',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Assign To *</label>
              <select
                value={newTask.assignedEmployeeId}
                onChange={(e) => setNewTask({ ...newTask, assignedEmployeeId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid hsl(var(--border))',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- Select Employee --</option>
                {employees.map(emp => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Description</label>
            <textarea
              placeholder="Enter task description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Due Date *</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid hsl(var(--border))',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Due Time</label>
              <input
                type="time"
                value={newTask.dueTime}
                onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid hsl(var(--border))',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid hsl(var(--border))',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleAddTask}
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
              Create Task
            </button>
            <button
              onClick={() => setShowNewTaskForm(false)}
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

      {/* Search and Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted))' }} />
          <input
            type="text"
            placeholder="Search by Task Name, Employee, Status or Priority..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid hsl(var(--border))',
              fontSize: '0.95rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Filter Dropdown */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid hsl(var(--border))',
            fontSize: '0.95rem',
            cursor: 'pointer',
            minWidth: '140px'
          }}
        >
          <option value="All">All Tasks</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Due Today">Due Today</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Tasks List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              style={{
                backgroundColor: 'hsl(var(--surface))',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid hsl(var(--border))',
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '20px',
                alignItems: 'start'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  {getStatusIcon(task.status)}
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{task.taskTitle}</h3>
                  {isOverdue(task.dueDate, task.status) && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.85rem' }}>
                      <AlertCircle size={16} />
                      Overdue
                    </span>
                  )}
                </div>

                <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '12px' }}>
                  {task.description}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto auto', gap: '20px', fontSize: '0.9rem' }}>
                  {isAdmin && (
                    <div>
                      <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>Assigned To:</span>
                      <div style={{ fontWeight: 600 }}>{employeeMap[task.assignedEmployeeId]?.name}</div>
                    </div>
                  )}
                  <div>
                    <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>Due Date:</span>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} />
                      {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>Due Time:</span>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} />
                      {task.dueTime}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>Priority:</span>
                    <div>{getPriorityBadge(task.priority)}</div>
                  </div>
                </div>

                {isAdmin && (
                  <div style={{ marginTop: '16px' }}>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid hsl(var(--border))',
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                )}

                {!isAdmin && (
                  <div style={{ marginTop: '16px' }}>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid hsl(var(--border))',
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>

                    {/* Comments Section for Employee */}
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Add Comment:</label>
                      <textarea
                        placeholder="Enter your comments..."
                        value={taskComments[task.id] || ''}
                        onChange={(e) => setTaskComments({ ...taskComments, [task.id]: e.target.value })}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid hsl(var(--border))',
                          fontSize: '0.9rem',
                          minHeight: '80px',
                          resize: 'vertical',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        onClick={() => handleSaveComment(task.id)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'hsl(var(--primary))',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600,
                          alignSelf: 'flex-start'
                        }}
                      >
                        Save Comment
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Comments Section - Visible to Admin */}
              {isAdmin && task.comments && task.comments.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid hsl(var(--border))' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: 'hsl(var(--muted-foreground))' }}>
                    Employee Comments:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {task.comments.map((comment) => (
                      <div
                        key={comment.id}
                        style={{
                          backgroundColor: 'hsl(var(--muted))',
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          borderLeft: '3px solid hsl(var(--primary))'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{comment.author}</span>
                          <span style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                            {comment.date}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'hsl(var(--foreground))' }}>
                          {comment.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isAdmin && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#fee2e2',
                      color: '#7f1d1d',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{
            backgroundColor: 'hsl(var(--surface))',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid hsl(var(--border))',
            padding: '40px',
            textAlign: 'center',
            color: 'hsl(var(--muted-foreground))'
          }}>
            No tasks found
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
