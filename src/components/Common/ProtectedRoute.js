import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

export default function ProtectedRoute({ children, role }) {
  const { currentUser, userRole } = useAuth();

  // Show loading spinner while checking auth
  if (currentUser === undefined || userRole === undefined) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If role is specified and doesn't match, redirect to correct dashboard
  if (role && userRole !== role) {
    return <Navigate to={`/${userRole}/dashboard`} />;
  }

  return children;
}