import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('wf_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, password, employeesList, adminsList) => {
    // Admin Check - Check against the admins list
    const admin = adminsList.find(
      (adm) => (adm.email.toLowerCase() === email.toLowerCase() || adm.sgid.toLowerCase() === email.toLowerCase())
    );

    if (admin && admin.password === password) {
      if (admin.status !== 'Active') {
        return { success: false, error: 'Your admin account is inactive. Please contact System Admin.' };
      }
      const adminUser = {
        ...admin,
        role: 'Admin'
      };
      setCurrentUser(adminUser);
      localStorage.setItem('wf_user', JSON.stringify(adminUser));
      return { success: true };
    }

    // Employee Check
    const employee = employeesList.find(
      (emp) => emp.email.toLowerCase() === email.toLowerCase() || (emp.sgid && emp.sgid.toLowerCase() === email.toLowerCase())
    );

    if (employee ) {
      if (employee.status !== 'Active') {
        return { success: false, error: 'Your account is inactive. Please contact HR.' };
      }
      const userObj = { ...employee, role: 'Employee' };
      setCurrentUser(userObj);
      localStorage.setItem('wf_user', JSON.stringify(userObj));
      return { success: true };
    }

    return { success: false, error: 'Invalid email/SGID or password.' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('wf_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
