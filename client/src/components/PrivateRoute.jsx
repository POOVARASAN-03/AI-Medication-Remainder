import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const userInfo = localStorage.getItem('userInfo');
  
  // Check if userInfo exists and has a valid token
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  try {
    const parsedUserInfo = JSON.parse(userInfo);
    if (!parsedUserInfo || !parsedUserInfo.token) {
      localStorage.removeItem('userInfo');
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    // If parsing fails, remove invalid data
    localStorage.removeItem('userInfo');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
