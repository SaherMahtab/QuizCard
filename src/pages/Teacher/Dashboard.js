import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Grid,
  Avatar
} from '@mui/material';
import { styled, keyframes, useTheme } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../contexts/AuthContext';
import DarkModeToggle from '../../components/Common/DarkModeToggle';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components with Dark Mode Support
const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
    : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
  position: 'relative',
  transition: 'background 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.palette.mode === 'dark'
      ? `radial-gradient(circle at 20% 80%, rgba(96, 165, 250, 0.15) 0%, transparent 50%),
         radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`
      : `radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
         radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.08) 0%, transparent 50%)`,
    pointerEvents: 'none',
  }
}));

const GlassAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(30, 41, 59, 0.8)'
    : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderBottom: theme.palette.mode === 'dark'
    ? '1px solid rgba(96, 165, 250, 0.2)'
    : '1px solid rgba(59, 130, 246, 0.1)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.5)'
    : '0 4px 20px rgba(59, 130, 246, 0.08)',
  transition: 'all 0.3s ease',
}));

const WelcomeCard = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(30, 41, 59, 0.6)'
    : 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(96, 165, 250, 0.2)'
    : '1px solid rgba(59, 130, 246, 0.1)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 10px 25px rgba(0, 0, 0, 0.5)'
    : '0 10px 25px rgba(59, 130, 246, 0.1)',
  animation: `${fadeInUp} 0.8s ease-out`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 15px 35px rgba(0, 0, 0, 0.7)'
      : '0 15px 35px rgba(59, 130, 246, 0.15)',
  }
}));

const ActionCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(30, 41, 59, 0.6)'
    : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(96, 165, 250, 0.2)'
    : '1px solid rgba(59, 130, 246, 0.1)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 20px rgba(0, 0, 0, 0.5)'
    : '0 8px 20px rgba(59, 130, 246, 0.08)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  animation: `${fadeInUp} 0.8s ease-out`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(96, 165, 250, 0.05) 100%)',
    opacity: 0,
    transition: 'opacity 0.4s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 20px 40px rgba(96, 165, 250, 0.3)'
      : '0 20px 40px rgba(59, 130, 246, 0.2)',
    '&::before': {
      opacity: 1,
    },
    '& .icon': {
      transform: 'scale(1.1) rotate(5deg)',
      color: '#2563eb !important',
    }
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.1)',
  borderRadius: '12px',
  padding: '10px 24px',
  fontWeight: '600',
  textTransform: 'none',
  fontSize: '0.95rem',
  color: theme.palette.mode === 'dark' ? '#93c5fd' : '#1e40af',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.3)'
      : 'rgba(59, 130, 246, 0.2)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
  }
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(30, 41, 59, 0.5)'
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(96, 165, 250, 0.2)'
    : '1px solid rgba(59, 130, 246, 0.1)',
  padding: '24px',
  animation: `${fadeInUp} 0.8s ease-out 0.3s both`,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 20px rgba(0, 0, 0, 0.5)'
    : '0 8px 20px rgba(59, 130, 246, 0.08)',
}));

export default function TeacherDashboard() {
  const { currentUser, userName, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <GradientBackground>
      <GlassAppBar position="static" elevation={0}>
        <Toolbar>
          <SchoolIcon sx={{ mr: 2, color: theme.palette.primary.main, fontSize: 28 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: theme.palette.text.primary, fontWeight: '600' }}>
            QuizCard - Teacher Portal
          </Typography>
          <DarkModeToggle />
          <GradientButton
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </GradientButton>
        </Toolbar>
      </GlassAppBar>

      <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
        {/* Welcome Section */}
        <WelcomeCard sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mr: 2,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
              }}
            >
              <PersonIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom sx={{
                fontWeight: '700',
                color: theme.palette.text.primary,
                mb: 0.5
              }}>
                Welcome, {userName || 'Teacher'}! <SchoolIcon sx={{ fontSize: 32, color: '#3b82f6', ml: 1 }} />
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                Email: {currentUser?.email}
              </Typography>
            </Box>
          </Box>
        </WelcomeCard>

        {/* Quick Actions Section */}
        <Typography variant="h5" gutterBottom sx={{
          color: theme.palette.text.primary,
          fontWeight: '600',
          mb: 3,
          textAlign: 'center'
        }}>
          Quick Actions
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
          <Grid item xs={12} sm={10} md={6} lg={5}>
            <ActionCard onClick={() => navigate('/teacher/create-quiz')}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <AddCircleOutlineIcon
                  className="icon"
                  sx={{
                    fontSize: 48,
                    mb: 2,
                    color: '#3b82f6',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', color: theme.palette.text.primary }}>
                  Create New Quiz
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Design engaging quizzes for your students
                </Typography>
              </CardContent>
            </ActionCard>
          </Grid>

          <Grid item xs={12} sm={10} md={6} lg={5}>
            <ActionCard onClick={() => navigate('/teacher/my-quizzes')}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <QuizIcon
                  className="icon"
                  sx={{
                    fontSize: 48,
                    mb: 2,
                    color: '#1d4ed8',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', color: theme.palette.text.primary }}>
                  My Quizzes
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Manage and view your created quizzes
                </Typography>
              </CardContent>
            </ActionCard>
          </Grid>
        </Grid>

        {/* Coming Soon Section */}
        <StatsCard>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', mb: 2, color: theme.palette.text.primary }}>
            🚀 Coming Soon
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Advanced analytics, bulk quiz import, student progress tracking, and more exciting features are on the way!
          </Typography>
        </StatsCard>
      </Container>
    </GradientBackground>
  );
}