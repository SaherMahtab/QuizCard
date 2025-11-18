import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  TextField,
  Grid,
  Card
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  School as SchoolIcon,
  Quiz as QuizIcon,
  Leaderboard as LeaderboardIcon,
  TrendingUp as TrendingUpIcon,
  PlayArrow as PlayArrowIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
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

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
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
    background: `
      radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  }
});

const GlassAppBar = styled(AppBar)({
  background: 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
});

const StyledCard = styled(Card)({
  background: 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  animation: `${fadeInUp} 0.6s ease-out`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  }
});

const ActionCard = styled(Card)({
  background: 'rgba(255, 255, 255, 0.3)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  animation: `${fadeInUp} 0.6s ease-out`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px) scale(1.02)',
    boxShadow: '0 15px 35px rgba(59, 130, 246, 0.2)',
    '&::before': {
      opacity: 1,
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  }
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.5)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(59, 130, 246, 0.5)',
      }
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 0.6)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#3b82f6',
        borderWidth: '2px',
      }
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    }
  },
  '& .MuiInputLabel-root': {
    color: '#1e40af',
    fontWeight: '500',
    '&.Mui-focused': {
      color: '#1d4ed8',
    }
  },
  '& .MuiOutlinedInput-input': {
    color: '#000000',
    fontWeight: '500',
  }
});

const PrimaryButton = styled(Button)({
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  borderRadius: '12px',
  padding: '12px 24px',
  color: 'white',
  fontWeight: '600',
  textTransform: 'none',
  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
  border: 'none',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&:disabled': {
    background: 'rgba(156, 163, 175, 0.5)',
    color: 'rgba(255, 255, 255, 0.7)',
    boxShadow: 'none',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    )`,
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
    animation: `${shimmer} 0.5s`,
  }
});

const SecondaryButton = styled(Button)({
  background: 'rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  padding: '12px 24px',
  color: '#1e40af',
  fontWeight: '600',
  textTransform: 'none',
  border: '1px solid rgba(59, 130, 246, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.2)',
  },
  '&:disabled': {
    background: 'rgba(156, 163, 175, 0.3)',
    color: 'rgba(107, 114, 128, 0.7)',
    borderColor: 'rgba(156, 163, 175, 0.3)',
  }
});

const WelcomeSection = styled(Box)({
  textAlign: 'center',
  marginBottom: '3rem',
  animation: `${fadeInUp} 0.8s ease-out`,
});

const StatsCard = styled(ActionCard)({
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.2)',
  '&:hover': {
    animation: `${pulse} 1s ease-in-out infinite`,
  }
});

export default function StudentDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [quizCode, setQuizCode] = useState('');
  const [leaderboardCode, setLeaderboardCode] = useState('');

  const handleStartQuiz = () => {
    if (quizCode.trim()) {
      navigate(`/student/play/${quizCode.trim()}`);
    }
  };

  const handleViewLeaderboard = () => {
    if (leaderboardCode.trim()) {
      navigate(`/student/leaderboard/${leaderboardCode.trim()}`);
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
    <GradientBackground>
      <GlassAppBar position="static" elevation={0}>
        <Toolbar>
          <SchoolIcon sx={{ mr: 2, color: '#1e40af', fontSize: 28 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#000000', fontWeight: '600' }}>
            QuizCard - Student Portal
          </Typography>
          <SecondaryButton 
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            size="small"
          >
            Logout
          </SecondaryButton>
        </Toolbar>
      </GlassAppBar>

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Welcome Section */}
        <WelcomeSection>
          <StyledCard sx={{ p: 4, mb: 4 }}>
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 2
              }}
            >
              Welcome, Student! 🎓
            </Typography>
            <Typography variant="h6" sx={{ color: '#666666', fontWeight: '500', mb: 3 }}>
              {currentUser?.email}
            </Typography>
            
            {/* Quiz Code Input Section */}
            <Box sx={{ display: 'flex', gap: 2, maxWidth: '600px', mx: 'auto', alignItems: 'stretch' }}>
              <StyledTextField
                label="Enter Quiz Code"
                variant="outlined"
                placeholder="e.g., ABC123"
                fullWidth
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                InputProps={{
                  startAdornment: <QuizIcon sx={{ color: '#3b82f6', mr: 1 }} />
                }}
              />
              <PrimaryButton
                size="large"
                onClick={handleStartQuiz}
                disabled={!quizCode}
                startIcon={<PlayArrowIcon />}
                sx={{ minWidth: '140px' }}
              >
                Start Quiz
              </PrimaryButton>
            </Box>
          </StyledCard>
        </WelcomeSection>

        {/* Action Cards */}
        <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
          <Grid item xs={12} sm={10} md={6} lg={5}>
            <ActionCard 
              sx={{ p: 3, height: '100%', animationDelay: '0.2s' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LeaderboardIcon sx={{ fontSize: 40, color: '#3b82f6', mr: 2 }} />
                <Typography variant="h6" sx={{ color: '#000000', fontWeight: '600' }}>
                  View Leaderboard
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
                Check your ranking and compete with other students
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <StyledTextField
                  label="Enter Quiz Code"
                  variant="outlined"
                  placeholder="ABC123"
                  size="small"
                  fullWidth
                  value={leaderboardCode}
                  onChange={(e) => setLeaderboardCode(e.target.value.toUpperCase())}
                />
              </Box>
              <SecondaryButton
                disabled={!leaderboardCode}
                startIcon={<LeaderboardIcon />}
                fullWidth
                onClick={handleViewLeaderboard}
              >
                View Rankings
              </SecondaryButton>
            </ActionCard>
          </Grid>

          <Grid item xs={12} sm={10} md={6} lg={5}>
            <ActionCard 
              sx={{ p: 3, height: '100%', animationDelay: '0.3s' }}
              onClick={() => navigate('/student/score-history')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#059669', mr: 2 }} />
                <Typography variant="h6" sx={{ color: '#000000', fontWeight: '600' }}>
                  Score History
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
                Track your progress and view past quiz results
              </Typography>
              <SecondaryButton
                startIcon={<TrendingUpIcon />}
                fullWidth
              >
                View History
              </SecondaryButton>
            </ActionCard>
          </Grid>
        </Grid>

        {/* Coming Soon Features */}
        <StyledCard sx={{ p: 4, animationDelay: '0.5s' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#000000', fontWeight: '600', mb: 3 }}>
            🚀 Coming Soon
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <StatsCard sx={{ p: 3, animationDelay: '0.6s' }}>
                <SchoolIcon sx={{ fontSize: 40, color: '#7c3aed', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#000000', fontWeight: '600', mb: 1 }}>
                  Browse Quizzes
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  Discover available quizzes by subject
                </Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <StatsCard sx={{ p: 3, animationDelay: '0.7s' }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#059669', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#000000', fontWeight: '600', mb: 1 }}>
                  Progress Tracking
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  Detailed analytics and insights
                </Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <StatsCard sx={{ p: 3, animationDelay: '0.8s' }}>
                <LeaderboardIcon sx={{ fontSize: 40, color: '#ef4444', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#000000', fontWeight: '600', mb: 1 }}>
                  Global Rankings
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  Compete with students worldwide
                </Typography>
              </StatsCard>
            </Grid>
          </Grid>
        </StyledCard>
      </Container>
    </GradientBackground>
  );
}