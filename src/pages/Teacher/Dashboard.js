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
import { styled, keyframes } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../contexts/AuthContext';

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

// Styled Components
const GradientBackground = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.08) 0%, transparent 50%)',
    pointerEvents: 'none',
  }
});

const GlassAppBar = styled(AppBar)({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.08)',
});

const WelcomeCard = styled(Paper)({
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(59, 130, 246, 0.1)',
  boxShadow: '0 10px 25px rgba(59, 130, 246, 0.1)',
  animation: `${fadeInUp} 0.8s ease-out`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 15px 35px rgba(59, 130, 246, 0.15)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
  }
});

const ActionCard = styled(Card)({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: '1px solid rgba(59, 130, 246, 0.1)',
  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.08)',
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
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(96, 165, 250, 0.05) 100%)',
    opacity: 0,
    transition: 'opacity 0.4s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    '&::before': {
      opacity: 1,
    },
    '& .icon': {
      transform: 'scale(1.1) rotate(5deg)',
      color: '#2563eb !important',
    }
  }
});

const GradientButton = styled(Button)({
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  borderRadius: '12px',
  padding: '10px 24px',
  fontWeight: '600',
  textTransform: 'none',
  fontSize: '0.95rem',
  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.25)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
    transition: 'left 0.6s',
  },
  '&:hover': {
    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
    '&::before': {
      left: '100%',
    }
  }
});

const StatsCard = styled(Paper)({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: '1px solid rgba(59, 130, 246, 0.1)',
  padding: '24px',
  color: '#000000',
  animation: `${fadeInUp} 0.8s ease-out 0.3s both`,
  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.08)',
});

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
    <GradientBackground>
      <GlassAppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#000000', fontWeight: '600' }}>
            QuizCard - Teacher Portal
          </Typography>
          <GradientButton 
            color="inherit" 
            onClick={handleLogout}
            sx={{ 
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#000000',
              '&:hover': { 
                background: 'rgba(96, 165, 250, 0.2)',
                color: '#000000'
              }
            }}
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
              <Typography variant="h4" gutterBottom sx={{ fontWeight: '700', color: '#000000' }}>
                Welcome, Teacher! 👨‍🏫
              </Typography>
              <Typography variant="body1" sx={{ color: '#666666' }}>
                Email: {currentUser?.email}
              </Typography>
            </Box>
          </Box>
        </WelcomeCard>

        {/* Quick Actions Section */}
        <Typography variant="h5" gutterBottom sx={{ color: '#000000', fontWeight: '600', mb: 3 }}>
          Quick Actions
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <ActionCard onClick={() => navigate('/teacher/create-quiz')}>
              <CardContent sx={{ p: 3, textAlign: 'center', transition: 'all 0.3s ease' }}>
                <AddCircleOutlineIcon className="icon" sx={{ fontSize: 48, mb: 2, color: '#3b82f6', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', color: '#000000' }}>
                  Create New Quiz
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  Design engaging quizzes for your students
                </Typography>
              </CardContent>
            </ActionCard>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <ActionCard onClick={() => navigate('/teacher/my-quizzes')}>
              <CardContent sx={{ p: 3, textAlign: 'center', transition: 'all 0.3s ease' }}>
                <QuizIcon className="icon" sx={{ fontSize: 48, mb: 2, color: '#1d4ed8', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', color: '#000000' }}>
                  My Quizzes
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  Manage and view your created quizzes
                </Typography>
              </CardContent>
            </ActionCard>
          </Grid>
        </Grid>

        {/* Coming Soon Section */}
        <StatsCard>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', mb: 2, color: '#000000' }}>
            🚀 Coming Soon
          </Typography>
          <Typography variant="body2" sx={{ color: '#666666' }}>
            Quiz creation, student analytics, and more exciting features are on the way!
          </Typography>
        </StatsCard>
      </Container>
    </GradientBackground>
  );
}