import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';

export default function ProtectedRoute({ children, requireAdmin = false, onNavigate }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fresh-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Login onNavigate={onNavigate} />;
  }

  if (requireAdmin && !isAdmin()) {
    if (onNavigate) {
      onNavigate('home');
    }
    return null;
  }

  return children;
}

