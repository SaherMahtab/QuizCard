import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function TeacherDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            QuizCard - Teacher Portal
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome, Teacher! 👨‍🏫
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Email: {currentUser?.email}
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions:
            </Typography>
            <Button
              variant="contained"
              sx={{ mr: 2, mt: 2 }}
              onClick={() => navigate('/teacher/create-quiz')}
            >
              Create New Quiz
            </Button>
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => navigate('/teacher/my-quizzes')}
            >
              My Quizzes
            </Button>
          </Box>

          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              🚀 Coming soon: Quiz creation, student analytics, and more!
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
}