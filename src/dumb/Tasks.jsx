import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import { 
  Plus, Search, Edit2, Trash2, CheckCircle2, MessageSquare, 
  Clock, AlertCircle, Calendar, CornerDownRight, Play, Eye, RefreshCw
} from 'lucide-react';

const Tasks = () => {
  const { currentUser } = useAuth();
  const { employees, tasks, assignTask, updateTaskDetails, deleteTask, updateTaskStatus, refreshAllData } = useAppData();

  const isAdmin = currentUser?.role === 'Admin';
  const todayStr = new Date().toISOString().split('T')[0];

  // Filters & Tabs state
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'in-progress' | 'completed' | 'due-today' | 'overdue'
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Form states
  const [formValues, setFormValues] = useState({
    taskTitle: '',
    description: '',
    assignedEmployeeId: '',
    dueDate: todayStr,
    dueTime: '17:00',
    priority: 'Medium'
  });
  const [formError, setFormError] = useState('');

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [statusUpdateVal, setStatusUpdateVal] = useState('');

  // 1. Filter Logic
  const filteredTasks = tasks.filter((task) => {
    // Admin can see all, Employee only sees their own
    const isOwner = isAdmin || task.assignedEmployeeId === currentUser.employeeId;
    if (!isOwner) return false;

    // Search query
    const matchesSearch = 
      task.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.id.toLowerCase().includes(searchQuery.toLowerCase());

    // Priority filter
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;

    // Employee filter (Admin only)
    const matchesEmployee = !isAdmin || employeeFilter === 'All' || task.assignedEmployeeId === employeeFilter;

    // Tab filter
    let matchesTab = true;
    const isOverdue = task.status !== 'Completed' && task.dueDate < todayStr;
    const isDueToday = task.dueDate === todayStr;

    if (activeTab === 'pending') {
      matchesTab = task.status === 'Not Started';
    } else if (activeTab === 'in-progress') {
      matchesTab = task.status === 'In Progress';
    } else if (activeTab === 'completed') {
      matchesTab = task.status === 'Completed';
    } else if (activeTab === 'due-today') {
      matchesTab = isDueToday && task.status !== 'Completed';
    } else if (activeTab === 'overdue') {
      matchesTab = isOverdue;
    }

    return matchesSearch && matchesPriority && matchesEmployee && matchesTab;
  });

  // 2. Open Modals
  const handleOpenAdd = () => {
    const activeEmployees = employees.filter((e) => e.status === 'Active');
    setFormValues({
      taskTitle: '',
      description: '',
      assignedEmployeeId: activeEmployees[0]?.employeeId || '',
      dueDate: todayStr,
      dueTime: '18:00',
      priority: 'Medium'
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setSelectedTask(task);
    setFormValues({
      taskTitle: task.taskTitle,
      description: task.description,
      assignedEmployeeId: task.assignedEmployeeId,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      priority: task.priority
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenDetails = (task) => {
    setSelectedTask(task);
    setStatusUpdateVal(task.status);
    setCommentText('');
    setIsDetailsModalOpen(true);
  };

  // 3. Form submissions
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const { taskTitle, description, assignedEmployeeId, dueDate, dueTime, priority } = formValues;

    if (!taskTitle || !description || !assignedEmployeeId || !dueDate || !dueTime || !priority) {
      setFormError('Please fill in all fields.');
      return;
    }

    const res = assignTask(formValues);
    if (res.success) {
      setIsAddModalOpen(false);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const { taskTitle, description, assignedEmployeeId, dueDate, dueTime, priority } = formValues;

    if (!taskTitle || !description || !assignedEmployeeId || !dueDate || !dueTime || !priority) {
      setFormError('Please fill in all fields.');
      return;
    }

    const res = updateTaskDetails(selectedTask.id, formValues);
    if (res.success) {
      setIsEditModalOpen(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this task?')) {
      deleteTask(id);
    }
  };

  const handleUpdateStatusAndComment = (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    updateTaskStatus(selectedTask.id, statusUpdateVal, commentText, currentUser.name);
    
    // Close modal or refresh selection state
    setIsDetailsModalOpen(false);
  };

  const handleRefreshTasks = () => {
    setIsRefreshing(true);
    refreshAllData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Title & Assign button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))' }}>Assign daily routines, prioritize workflows, and view comments logs.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleRefreshTasks}
            disabled={isRefreshing}
            title="Refresh tasks to see latest updates"
            style={{ opacity: isRefreshing ? 0.6 : 1 }}
          >
            <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>
          {isAdmin && (
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <Plus size={16} />
              <span>Assign New Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Filter Row */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '2px', overflowX: 'auto' }}>
        {[
          { id: 'all', label: 'All Tasks' },
          { id: 'pending', label: 'Not Started' },
          { id: 'in-progress', label: 'In Progress' },
          { id: 'completed', label: 'Completed' },
          { id: 'due-today', label: 'Due Today' },
          { id: 'overdue', label: 'Overdue' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
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
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search and Advanced Filters */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted))' }} />
          <input
            type="text"
            placeholder="Search tasks by title, code, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '38px', height: '40px' }}
          />
        </div>

        {/* Priority Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input-field"
            style={{ width: '140px', height: '40px' }}
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* Employee dropdown (Admin only) */}
          {isAdmin && (
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="input-field"
              style={{ width: '180px', height: '40px' }}
            >
              <option value="All">All Assignees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.employeeId}>{emp.name}</option>
              ))}
            </select>
          )}

        </div>

      </div>

      {/* Task Cards Display Grid */}
      {filteredTasks.length > 0 ? (
        <div className="grid-3">
          {filteredTasks.map((task) => {
            const emp = employees.find((e) => e.employeeId === task.assignedEmployeeId);
            const isOverdue = task.status !== 'Completed' && task.dueDate < todayStr;

            return (
              <div 
                className="card" 
                key={task.id} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  borderTop: isOverdue ? '4px solid hsl(var(--danger))' : '1px solid hsl(var(--border))'
                }}
              >
                {/* Header status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted))', fontWeight: 600 }}>
                    {task.id}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className={`badge ${
                      task.priority === 'High' ? 'badge-danger' : task.priority === 'Medium' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`badge ${
                      task.status === 'Completed' ? 'badge-success' : task.status === 'In Progress' ? 'badge-info' : 'badge-muted'
                    }`} style={{
                      backgroundColor: task.status === 'In Progress' ? 'hsl(var(--primary-light))' : '',
                      color: task.status === 'In Progress' ? 'hsl(var(--primary))' : ''
                    }}>
                      {task.status}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 
                    className="heading-font" 
                    style={{ 
                      fontSize: '1.05rem', 
                      fontWeight: 700, 
                      marginBottom: '6px',
                      color: 'hsl(var(--foreground))'
                    }}
                  >
                    {task.taskTitle}
                  </h4>
                  <p 
                    style={{ 
                      fontSize: '0.82rem', 
                      color: 'hsl(var(--muted))',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.4
                    }}
                  >
                    {task.description}
                  </p>
                </div>

                {/* Due Date Indicator */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: '0.8rem', 
                  color: isOverdue ? 'hsl(var(--danger))' : 'hsl(var(--muted))',
                  fontWeight: isOverdue ? 600 : 500
                }}>
                  {isOverdue ? <AlertCircle size={14} /> : <Calendar size={14} />}
                  <span>Due: {task.dueDate} at {task.dueTime}</span>
                  {isOverdue && <span style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>[Overdue]</span>}
                </div>

                {/* Assignee & Footer actions */}
                <div style={{ 
                  borderTop: '1px solid hsl(var(--border))', 
                  paddingTop: '12px', 
                  marginTop: 'auto',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'hsl(var(--muted))', display: 'block' }}>Assignee</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{emp ? emp.name : 'Unassigned'}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn-icon" onClick={() => handleOpenDetails(task)} title="Progress & Comments">
                      <MessageSquare size={15} />
                    </button>
                    {isAdmin && (
                      <>
                        <button className="btn-icon" onClick={() => handleOpenEdit(task)} title="Edit Task details">
                          <Edit2 size={15} />
                        </button>
                        <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(task.id)} title="Delete Task">
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'hsl(var(--muted))' }}>
          <CheckCircle2 size={40} style={{ marginBottom: '16px', color: 'hsl(var(--success))' }} />
          <p style={{ fontSize: '0.95rem', fontWeight: 550 }}>No tasks found matching your filters.</p>
        </div>
      )}

      {/* Add Task Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Assign New Task">
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formError && <p style={{ fontSize: '0.8rem', color: 'hsl(var(--danger))', fontWeight: 500 }}>{formError}</p>}

          <div>
            <label className="label-text">Task Title</label>
            <input
              type="text"
              placeholder="Enter brief task title"
              className="input-field"
              value={formValues.taskTitle}
              onChange={(e) => setFormValues({ ...formValues, taskTitle: e.target.value })}
            />
          </div>

          <div>
            <label className="label-text">Task Description</label>
            <textarea
              placeholder="Describe what needs to be done..."
              className="input-field"
              style={{ minHeight: '80px', resize: 'vertical' }}
              value={formValues.description}
              onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
            />
          </div>

          <div>
            <label className="label-text">Assign to Employee</label>
            <select
              className="input-field"
              value={formValues.assignedEmployeeId}
              onChange={(e) => setFormValues({ ...formValues, assignedEmployeeId: e.target.value })}
            >
              {employees.filter(e => e.status === 'Active').map((emp) => (
                <option key={emp.id} value={emp.employeeId}>
                  {emp.name} ({emp.department} - {emp.designation})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="label-text">Due Date</label>
              <input
                type="date"
                className="input-field"
                value={formValues.dueDate}
                onChange={(e) => setFormValues({ ...formValues, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text">Due Time</label>
              <input
                type="time"
                className="input-field"
                value={formValues.dueTime}
                onChange={(e) => setFormValues({ ...formValues, dueTime: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label-text">Priority Level</label>
            <select
              className="input-field"
              value={formValues.priority}
              onChange={(e) => setFormValues({ ...formValues, priority: e.target.value })}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save and Assign</button>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modify Task Details">
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formError && <p style={{ fontSize: '0.8rem', color: 'hsl(var(--danger))', fontWeight: 500 }}>{formError}</p>}

          <div>
            <label className="label-text">Task Title</label>
            <input
              type="text"
              className="input-field"
              value={formValues.taskTitle}
              onChange={(e) => setFormValues({ ...formValues, taskTitle: e.target.value })}
            />
          </div>

          <div>
            <label className="label-text">Task Description</label>
            <textarea
              className="input-field"
              style={{ minHeight: '80px', resize: 'vertical' }}
              value={formValues.description}
              onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
            />
          </div>

          <div>
            <label className="label-text">Reassign Employee</label>
            <select
              className="input-field"
              value={formValues.assignedEmployeeId}
              onChange={(e) => setFormValues({ ...formValues, assignedEmployeeId: e.target.value })}
            >
              {employees.filter(e => e.status === 'Active').map((emp) => (
                <option key={emp.id} value={emp.employeeId}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="label-text">Due Date</label>
              <input
                type="date"
                className="input-field"
                value={formValues.dueDate}
                onChange={(e) => setFormValues({ ...formValues, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text">Due Time</label>
              <input
                type="time"
                className="input-field"
                value={formValues.dueTime}
                onChange={(e) => setFormValues({ ...formValues, dueTime: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label-text">Priority Level</label>
            <select
              className="input-field"
              value={formValues.priority}
              onChange={(e) => setFormValues({ ...formValues, priority: e.target.value })}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Update Task</button>
          </div>
        </form>
      </Modal>

      {/* Progress Logs & Comments Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Task Progress & Comments Logs" maxWidth="600px">
        {selectedTask && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Task Info */}
            <div style={{ borderBottom: '1px solid hsl(var(--border))', paddingBottom: '12px' }}>
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>{selectedTask.taskTitle}</h4>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))' }}>{selectedTask.description}</p>
            </div>

            {/* Existing Comments Log */}
            <div>
              <h5 style={{ fontSize: '0.8rem', color: 'hsl(var(--muted))', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', fontWeight: 600 }}>
                Activity & Updates Timeline ({selectedTask.comments.length})
              </h5>

              {selectedTask.comments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                  {selectedTask.comments.map((c) => (
                    <div key={c.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <CornerDownRight size={14} style={{ color: 'hsl(var(--primary))', flexShrink: 0, marginTop: '3px' }} />
                      <div style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'hsl(var(--muted-light))',
                        fontSize: '0.82rem',
                        flex: 1
                      }}>
                        <p style={{ fontWeight: 600, marginBottom: '2px' }}>
                          {c.author} <span style={{ fontWeight: 400, color: 'hsl(var(--muted))', fontSize: '0.72rem', marginLeft: '6px' }}>{c.date}</span>
                        </p>
                        <p style={{ color: 'hsl(var(--foreground))' }}>{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.82rem', color: 'hsl(var(--muted))', fontStyle: 'italic', padding: '12px' }}>
                  No updates or progress notes logged yet.
                </p>
              )}
            </div>

            {/* Update Form (Can update status + write comments) */}
            <form onSubmit={handleUpdateStatusAndComment} style={{ 
              borderTop: '1px solid hsl(var(--border))', 
              paddingTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="label-text">Update Status</label>
                  <select
                    className="input-field"
                    value={statusUpdateVal}
                    onChange={(e) => setStatusUpdateVal(e.target.value)}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Current State</label>
                  <div style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                    <span className={`badge ${selectedTask.status === 'Completed' ? 'badge-success' : selectedTask.status === 'In Progress' ? 'badge-info' : 'badge-muted'}`}>
                      {selectedTask.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="label-text">Add Progress Comment</label>
                <textarea
                  placeholder="Explain current status progress or blocker..."
                  className="input-field"
                  style={{ minHeight: '60px', resize: 'vertical' }}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>Close</button>
                <button type="submit" className="btn btn-primary">Save Progress Update</button>
              </div>
            </form>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default Tasks;
