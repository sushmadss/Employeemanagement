import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import { Plus, Edit2, Trash2, FolderTree, AlertTriangle, Users } from 'lucide-react';

const Departments = () => {
  const { currentUser } = useAuth();
  const { departments, employees, addDepartment, updateDepartment, deleteDepartment } = useAppData();

  const isAdmin = currentUser?.role === 'Admin';

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');
  
  // Form values
  const [deptName, setDeptName] = useState('');
  const [formError, setFormError] = useState('');

  if (!isAdmin) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
        <AlertTriangle size={48} style={{ color: 'hsl(var(--danger))', marginBottom: '16px' }} />
        <h3 className="heading-font" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Access Denied</h3>
        <p style={{ color: 'hsl(var(--muted))', fontSize: '0.9rem' }}>You do not have permissions to manage departments.</p>
      </div>
    );
  }

  // Get employee count for a department
  const getEmployeeCount = (name) => {
    return employees.filter(emp => emp.department === name).length;
  };

  const handleOpenAdd = () => {
    setDeptName('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (name) => {
    setSelectedDept(name);
    setDeptName(name);
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!deptName.trim()) {
      setFormError('Department name cannot be empty.');
      return;
    }
    const res = addDepartment(deptName.trim());
    if (res.success) {
      setIsAddModalOpen(false);
    } else {
      setFormError(res.error);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!deptName.trim()) {
      setFormError('Department name cannot be empty.');
      return;
    }
    const res = updateDepartment(selectedDept, deptName.trim());
    if (res.success) {
      setIsEditModalOpen(false);
    } else {
      setFormError(res.error);
    }
  };

  const handleDelete = (name) => {
    const count = getEmployeeCount(name);
    if (count > 0) {
      alert(`Cannot delete department "${name}" because it contains ${count} employee(s). Reassign them first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete the "${name}" department?`)) {
      deleteDepartment(name);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted))' }}>Create, update, and manage organizational units.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add Department</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid-3">
        {departments.map((dept) => {
          const empCount = getEmployeeCount(dept);
          return (
            <div className="card" key={dept} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'hsl(var(--primary-light))',
                  color: 'hsl(var(--primary))'
                }}>
                  <FolderTree size={22} />
                </div>
                
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="btn-icon" onClick={() => handleOpenEdit(dept)} title="Edit name">
                    <Edit2 size={14} />
                  </button>
                  <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(dept)} title="Delete department">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="heading-font" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
                  {dept}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'hsl(var(--muted))' }}>
                  <Users size={14} />
                  <span>{empCount} Employee{empCount !== 1 ? 's' : ''} active</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Department Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Department">
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formError && <p style={{ fontSize: '0.8rem', color: 'hsl(var(--danger))', fontWeight: 500 }}>{formError}</p>}

          <div>
            <label className="label-text">Department Name</label>
            <input
              type="text"
              placeholder="e.g. Sales & Marketing"
              className="input-field"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Department</button>
          </div>
        </form>
      </Modal>

      {/* Edit Department Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Department Name">
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formError && <p style={{ fontSize: '0.8rem', color: 'hsl(var(--danger))', fontWeight: 500 }}>{formError}</p>}

          <div>
            <label className="label-text">Department Name</label>
            <input
              type="text"
              className="input-field"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Update Name</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Departments;
