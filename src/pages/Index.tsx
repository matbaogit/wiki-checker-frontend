
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';
import Dashboard from '../components/Dashboard';

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated ? <Dashboard /> : <LoginForm />}
    </>
  );
};

export default Index;
