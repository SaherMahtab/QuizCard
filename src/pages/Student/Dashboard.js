import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  TextField
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [quizCode, setQuizCode] = useState('');

  const handleStartQuiz = () => {
    if (quizCode.trim()) {
      navigate(`/student/play/${quizCode.trim()}`);
    }
  };

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
      <AppBar position="static" color="secondary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            QuizCard - Student Portal
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome, Student! 🎓
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Email: {currentUser?.email}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="Quiz Code"
              variant="outlined"
              placeholder="e.g., ABC123"
              sx={{ flexGrow: 1 }}
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleStartQuiz}
              disabled={!quizCode}
            >
              Start Quiz
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate(`/student/leaderboard/${quizCode}`)}
              disabled={!quizCode}
            >
              Leaderboard
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              My Recent Scores:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No quizzes attempted yet. Enter a quiz code to get started!
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              🎮 Coming soon: Browse quizzes, track progress, and compete on leaderboards!
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
}