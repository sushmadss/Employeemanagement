import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import { Plus, Search, Edit2, Trash2, Eye, LayoutGrid, List, AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Employees = () => {
  const { currentUser } = useAuth();
  const { employees, departments, attendance, tasks, addEmployee, updateEmployee, deleteEmployee } = useAppData();

  const isAdmin = currentUser?.role === 'Admin';

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form State
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    status: 'Active',
    role: 'Employee'
  });
  const [formError, setFormError] = useState('');

  if (!isAdmin) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
        <AlertTriangle size={48} style={{ color: 'hsl(var(--danger))', marginBottom: '16px' }} />
        <h3 className="heading-font" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Access Denied</h3>
        <p style={{ color: 'hsl(var(--muted))', fontSize: '0.9rem' }}>You do not have permissions to view the Employee Directory.</p>
      </div>
    );
  }

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const nameStr = (emp.name || '').toLowerCase();
    const idStr = (emp.employeeId || '').toLowerCase();
    const deptStr = (emp.department || '').toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      nameStr.includes(searchLower) ||
      idStr.includes(searchLower) ||
      deptStr.includes(searchLower);

    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const handleOpenAdd = () => {
    setFormValues({
      name: '',
      email: '',
      phone: '',
      department: departments[0] || '',
      designation: '',
      dateOfJoining: new Date().toISOString().split('T')[0],
      status: 'Active',
      role: 'Employee'
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmployee(emp);
    setFormValues({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      designation: emp.designation,
      dateOfJoining: emp.dateOfJoining,
      status: emp.status,
      role: emp.role
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenView = (emp) => {
    setSelectedEmployee(emp);
    setIsViewModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const { name, email, phone, department, designation } = formValues;

    if (!name || !email || !phone || !department || !designation) {
      setFormError('Please fill in all fields.');
      return;
    }

    const res = addEmployee(formValues);
    if (res.success) {
      setIsAddModalOpen(false);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const { name, email, phone, department, designation } = formValues;

    if (!name || !email || !phone || !department || !designation) {
      setFormError('Please fill in all fields.');
      return;
    }

    const res = updateEmployee(selectedEmployee.id, formValues);
    if (res.success) {
      setIsEditModalOpen(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this employee from the system?')) {
      deleteEmployee(id);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header and Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))' }}>Manage, search, and register workers in your organization.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Register Employee</span>
        </button>
      </div>

      {/* Search and Filters panel */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted))' }} />
          <input
            type="text"
            placeholder="Search by ID, Name or Department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '38px', height: '40px' }}
          />
        </div>

        {/* Filters and Layout Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="input-field"
            style={{ width: '160px', height: '40px' }}
          >
            <option value="All">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Grid/List Toggle */}
          <div style={{ display: 'flex', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 12px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'list' ? 'hsl(var(--muted-light))' : 'hsl(var(--card))',
                color: viewMode === 'list' ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
              }}
              title="List view"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px 12px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'grid' ? 'hsl(var(--muted-light))' : 'hsl(var(--card))',
                color: viewMode === 'grid' ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
              }}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

        </div>

      </div>

      {/* Directory Display */}
      {filteredEmployees.length > 0 ? (
        viewMode === 'list' ? (
          /* List Layout */
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Role</th>
                  <th>Date Joined</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 600 }}>{emp.employeeId}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 550 }}>{emp.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted))' }}>{emp.email}</span>
                      </div>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td>
                      <span className={`badge ${emp.role === 'Admin' ? 'badge-primary' : 'badge-secondary'}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td>{emp.dateOfJoining}</td>
                    <td>
                      <span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button className="btn-icon" onClick={() => handleOpenView(emp)} title="View Profile">
                          <Eye size={16} />
                        </button>
                        <button className="btn-icon" onClick={() => handleOpenEdit(emp)} title="Edit Record">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(emp.id)} title="Delete Record">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid Card Layout */
          <div className="grid-3">
            {filteredEmployees.map((emp) => (
              <div className="card" key={emp.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                <span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ position: 'absolute', top: '20px', right: '20px' }}>
                  {emp.status}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'hsl(var(--primary-light))',
                    color: 'hsl(var(--primary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 700
                  }}>
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="heading-font" style={{ fontWeight: 600, fontSize: '1.05rem', margin: 0 }}>{emp.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted))' }}>{emp.employeeId} • {emp.designation}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '12px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>
                    <span style={{ color: 'hsl(var(--muted))' }}>Email: </span>
                    <span style={{ fontWeight: 500 }}>{emp.email}</span>
                  </div>
                  <div>
                    <span style={{ color: 'hsl(var(--muted))' }}>Phone: </span>
                    <span style={{ fontWeight: 500 }}>{emp.phone}</span>
                  </div>
                  <div>
                    <span style={{ color: 'hsl(var(--muted))' }}>Department: </span>
                    <span style={{ fontWeight: 550, color: 'hsl(var(--primary))' }}>{emp.department}</span>
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span style={{ color: 'hsl(var(--muted))' }}>Role: </span>
                    <span className={`badge ${emp.role === 'Admin' ? 'badge-primary' : 'badge-secondary'}`} style={{ marginLeft: '6px' }}>
                      {emp.role}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid hsl(var(--border))', paddingTop: '12px', marginTop: 'auto' }}>
                  <button className="btn-icon" onClick={() => handleOpenView(emp)} title="View Profile">
                    <Eye size={15} />
                  </button>
                  <button className="btn-icon" onClick={() => handleOpenEdit(emp)} title="Edit Record">
                    <Edit2 size={15} />
                  </button>
                  <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(emp.id)} title="Delete Record">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'hsl(var(--muted))' }}>
          <Search size={40} style={{ marginBottom: '16px' }} />
          <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>No employee matches found matching your filters.</p>
        </div>
      )}

      {/* Add Employee Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Employee">
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formError && <p style={{ fontSize: '0.8rem', color: 'hsl(var(--danger))', fontWeight: 500 }}>{formError}</p>}
          
          <div>
            <label className="label-text">Full Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Robert Downey"
              value={formValues.name}
              onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="label-text">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="name@company.com"
                value={formValues.email}
                onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text">Phone Number</label>
              <input
                type="text"
                className="input-field"
                placeholder="10-digit number"
                value={formValues.phone}
                onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="label-text">Department</label>
              <select
                className="input-field"
                value={formValues.department}
                onChange={(e) => setFormValues({ ...formValues, department: e.target.value })}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Designation</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Lead Developer"
                value={formValues.designation}
                onChange={(e) => setFormValues({ ...formValues, designation: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="label-text">Date of Joining</label>
              <input
                type="date"
                className="input-field"
                value={formValues.dateOfJoining}
                onChange={(e) => setFormValues({ ...formValues, dateOfJoining: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text">Role</label>
              <select
                className="input-field"
                value={formValues.role}
                onChange={(e) => setFormValues({ ...formValues, role: e.target.value })}
              >
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label-text">Status</label>
            <select
              className="input-field"
              value={formValues.status}
              onChange={(e) => setFormValues({ ...formValues, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Employee</button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Employee Details">
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formError && <p style={{ fontSize: '0.8rem', color: 'hsl(var(--danger))', fontWeight: 500 }}>{formError}</p>}
          
          <div>
            <label className="label-text">Full Name</label>
            <input
              type="text"
              className="input-field"
              value={formValues.name}
              onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="label-text">Email</label>
              <input
                type="email"
                className="input-field"
                value={formValues.email}
                onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text">Phone Number</label>
              <input
                type="text"
                className="input-field"
                value={formValues.phone}
                onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="label-text">Department</label>
              <select
                className="input-field"
                value={formValues.department}
                onChange={(e) => setFormValues({ ...formValues, department: e.target.value })}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Designation</label>
              <input
                type="text"
                className="input-field"
                value={formValues.designation}
                onChange={(e) => setFormValues({ ...formValues, designation: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="label-text">Date of Joining</label>
              <input
                type="date"
                className="input-field"
                value={formValues.dateOfJoining}
                onChange={(e) => setFormValues({ ...formValues, dateOfJoining: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text">Role</label>
              <select
                className="input-field"
                value={formValues.role}
                onChange={(e) => setFormValues({ ...formValues, role: e.target.value })}
              >
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label-text">Status</label>
            <select
              className="input-field"
              value={formValues.status}
              onChange={(e) => setFormValues({ ...formValues, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Update Details</button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Employee Full Profile">
        {selectedEmployee && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Header profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: 'hsl(var(--muted-light))', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'hsl(var(--primary))',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700
              }}>
                {selectedEmployee.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div>
                <h4 className="heading-font" style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{selectedEmployee.name}</h4>
                <p style={{ fontSize: '0.82rem', color: 'hsl(var(--muted))' }}>{selectedEmployee.designation}</p>
                <span className={`badge ${selectedEmployee.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ marginTop: '6px' }}>
                  {selectedEmployee.status}
                </span>
              </div>
            </div>

            {/* Profile fields info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.88rem' }}>
              <div>
                <p style={{ color: 'hsl(var(--muted))', fontWeight: 550, marginBottom: '2px' }}>Employee Database ID</p>
                <p style={{ fontWeight: 600 }}>{selectedEmployee.employeeId}</p>
              </div>
              <div>
                <p style={{ color: 'hsl(var(--muted))', fontWeight: 550, marginBottom: '2px' }}>Department</p>
                <p style={{ fontWeight: 600, color: 'hsl(var(--primary))' }}>{selectedEmployee.department}</p>
              </div>
              <div>
                <p style={{ color: 'hsl(var(--muted))', fontWeight: 550, marginBottom: '2px' }}>Email Address</p>
                <p style={{ fontWeight: 600 }}>{selectedEmployee.email}</p>
              </div>
              <div>
                <p style={{ color: 'hsl(var(--muted))', fontWeight: 550, marginBottom: '2px' }}>Mobile Phone</p>
                <p style={{ fontWeight: 600 }}>{selectedEmployee.phone}</p>
              </div>
              <div>
                <p style={{ color: 'hsl(var(--muted))', fontWeight: 550, marginBottom: '2px' }}>Joining Date</p>
                <p style={{ fontWeight: 600 }}>{selectedEmployee.dateOfJoining}</p>
              </div>
              <div>
                <p style={{ color: 'hsl(var(--muted))', fontWeight: 550, marginBottom: '2px' }}>Role</p>
                <span className={`badge ${selectedEmployee.role === 'Admin' ? 'badge-primary' : 'badge-secondary'}`} style={{ fontWeight: 600 }}>
                  {selectedEmployee.role}
                </span>
              </div>
            </div>

            {/* Attendance Summary Section */}
            <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '16px' }}>
              <h5 className="heading-font" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', margin: 0 }}>Attendance Summary</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {(() => {
                  const empAttendance = attendance.filter(a => a.employeeId === selectedEmployee.employeeId).slice(-7);
                  const presentCount = empAttendance.filter(a => a.status === 'Present').length;
                  const absentCount = empAttendance.filter(a => a.status === 'Absent').length;
                  return (
                    <>
                      <div style={{ backgroundColor: 'hsl(var(--muted-light))', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted))', margin: 0, marginBottom: '4px' }}>Present (7 days)</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--success))', margin: 0 }}>{presentCount}</p>
                      </div>
                      <div style={{ backgroundColor: 'hsl(var(--muted-light))', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted))', margin: 0, marginBottom: '4px' }}>Absent (7 days)</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--danger))', margin: 0 }}>{absentCount}</p>
                      </div>
                      <div style={{ backgroundColor: 'hsl(var(--muted-light))', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted))', margin: 0, marginBottom: '4px' }}>Attendance Rate</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--primary))', margin: 0 }}>{empAttendance.length > 0 ? Math.round((presentCount / empAttendance.length) * 100) : 0}%</p>
                      </div>
                    </>
                  );
                })()}
              </div>
              
              {/* Recent Attendance Records */}
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'hsl(var(--muted))', marginBottom: '8px' }}>Recent Attendance (Last 7 Days)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                  {(() => {
                    const empAttendance = attendance.filter(a => a.employeeId === selectedEmployee.employeeId).slice(-7).reverse();
                    if (empAttendance.length === 0) {
                      return <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted))', margin: 0 }}>No attendance records found</p>;
                    }
                    return empAttendance.map((att) => (
                      <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '6px 8px', backgroundColor: att.status === 'Present' ? 'hsla(var(--success), 0.1)' : 'hsla(var(--danger), 0.1)', borderRadius: 'var(--radius-sm)' }}>
                        <span>{att.date} • {att.status}</span>
                        <span style={{ color: 'hsl(var(--muted))' }}>{att.inTime || '-'} - {att.outTime || '-'}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* Tasks Summary Section */}
            <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '16px' }}>
              <h5 className="heading-font" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', margin: 0 }}>Task Summary</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                {(() => {
                  const empTasks = tasks.filter(t => t.assignedEmployeeId === selectedEmployee.employeeId);
                  const assignedCount = empTasks.length;
                  const completedCount = empTasks.filter(t => t.status === 'Completed').length;
                  const pendingCount = empTasks.filter(t => t.status === 'Not Started').length;
                  const inProgressCount = empTasks.filter(t => t.status === 'In Progress').length;
                  
                  return (
                    <>
                      <div style={{ backgroundColor: 'hsl(var(--muted-light))', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted))', margin: 0, marginBottom: '4px' }}>Total Assigned</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--primary))', margin: 0 }}>{assignedCount}</p>
                      </div>
                      <div style={{ backgroundColor: 'hsl(var(--muted-light))', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted))', margin: 0, marginBottom: '4px' }}>Completed</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--success))', margin: 0 }}>{completedCount}</p>
                      </div>
                      <div style={{ backgroundColor: 'hsl(var(--muted-light))', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted))', margin: 0, marginBottom: '4px' }}>In Progress</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--warning))', margin: 0 }}>{inProgressCount}</p>
                      </div>
                      <div style={{ backgroundColor: 'hsl(var(--muted-light))', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted))', margin: 0, marginBottom: '4px' }}>Pending</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--danger))', margin: 0 }}>{pendingCount}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Recent Tasks */}
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'hsl(var(--muted))', marginBottom: '8px' }}>Recent Tasks</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                  {(() => {
                    const empTasks = tasks.filter(t => t.assignedEmployeeId === selectedEmployee.employeeId).slice(-5).reverse();
                    if (empTasks.length === 0) {
                      return <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted))', margin: 0 }}>No tasks assigned</p>;
                    }
                    return empTasks.map((task) => (
                      <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', padding: '8px', backgroundColor: 'hsl(var(--muted-light))', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${task.status === 'Completed' ? 'hsl(var(--success))' : task.status === 'In Progress' ? 'hsl(var(--warning))' : 'hsl(var(--danger))'}` }}>
                        {task.status === 'Completed' && <CheckCircle size={14} color='hsl(var(--success))' />}
                        {task.status === 'In Progress' && <Clock size={14} color='hsl(var(--warning))' />}
                        {task.status === 'Not Started' && <AlertCircle size={14} color='hsl(var(--danger))' />}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, margin: 0, marginBottom: '2px' }}>{task.taskTitle}</p>
                          <p style={{ color: 'hsl(var(--muted))', margin: 0 }}>{task.status} • Due: {task.dueDate}</p>
                        </div>
                        <span className={`badge ${task.priority === 'High' ? 'badge-danger' : task.priority === 'Medium' ? 'badge-warning' : 'badge-secondary'}`} style={{ fontSize: '0.7rem' }}>{task.priority}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn btn-primary" onClick={() => setIsViewModalOpen(false)}>Close Window</button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default Employees;
