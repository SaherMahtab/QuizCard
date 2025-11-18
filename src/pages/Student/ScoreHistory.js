import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  Analytics as AnalyticsIcon,
  Quiz as QuizIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

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

const StyledCard = styled(Paper)({
  background: 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  }
});

const StatCard = styled(Box)({
  textAlign: 'center',
  padding: '1.5rem',
  borderRadius: '16px',
  background: 'rgba(255, 255, 255, 0.3)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    background: 'rgba(255, 255, 255, 0.4)',
  }
});

const ScoreCard = styled(Card)({
  background: 'rgba(255, 255, 255, 0.3)',
  backdropFilter: 'blur(15px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.15)',
    background: 'rgba(255, 255, 255, 0.4)',
  }
});

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
});

const EmptyStateCard = styled(StyledCard)({
  textAlign: 'center',
  padding: '3rem',
});

const QuestionChip = styled(Chip)(({ correct }) => ({
  minWidth: '35px',
  height: '35px',
  fontSize: '0.875rem',
  fontWeight: '600',
  background: correct ? 
    'linear-gradient(135deg, #059669 0%, #047857 100%)' : 
    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  color: 'white',
  border: correct ? '2px solid rgba(5, 150, 105, 0.3)' : '2px solid rgba(239, 68, 68, 0.3)',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  }
}));

export default function ScoreHistory() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchScores = async () => {
    try {
      const q = query(
        collection(db, 'scores'),
        where('studentId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const scoresData = [];
      querySnapshot.forEach((doc) => {
        scoresData.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort manually by completedAt
      scoresData.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
      
      setScores(scoresData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching scores:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateStats = () => {
    if (scores.length === 0) return { avgScore: 0, totalQuizzes: 0, totalCorrect: 0, totalQuestions: 0 };

    const totalCorrect = scores.reduce((sum, s) => sum + s.score, 0);
    const totalQuestions = scores.reduce((sum, s) => sum + s.totalQuestions, 0);
    const avgScore = ((totalCorrect / totalQuestions) * 100).toFixed(1);

    return {
      avgScore,
      totalQuizzes: scores.length,
      totalCorrect,
      totalQuestions
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <GradientBackground>
        <LoadingContainer>
          <CircularProgress size={60} sx={{ color: '#3b82f6' }} />
        </LoadingContainer>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <GlassAppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate('/student/dashboard')}
            sx={{ 
              color: '#1e40af',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              '&:hover': {
                background: 'rgba(59, 130, 246, 0.2)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <AnalyticsIcon sx={{ mx: 2, color: '#3b82f6', fontSize: 28 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#000000', fontWeight: '600' }}>
            My Score History
          </Typography>
        </Toolbar>
      </GlassAppBar>

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Statistics Summary */}
        {scores.length > 0 && (
          <StyledCard sx={{ p: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TrendingUpIcon sx={{ fontSize: 32, color: '#3b82f6', mr: 2 }} />
              <Typography variant="h5" sx={{ color: '#000000', fontWeight: '600' }}>
                Overall Statistics
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <StatCard>
                  <SchoolIcon sx={{ fontSize: 40, color: '#3b82f6', mb: 1 }} />
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      mb: 1
                    }}
                  >
                    {stats.totalQuizzes}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666', fontWeight: '500' }}>
                    Quizzes Taken
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard>
                  <TrendingUpIcon sx={{ fontSize: 40, color: '#059669', mb: 1 }} />
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      mb: 1
                    }}
                  >
                    {stats.avgScore}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666', fontWeight: '500' }}>
                    Average Score
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard>
                  <CheckCircleIcon sx={{ fontSize: 40, color: '#7c3aed', mb: 1 }} />
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      mb: 1
                    }}
                  >
                    {stats.totalCorrect}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666', fontWeight: '500' }}>
                    Correct Answers
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard>
                  <QuizIcon sx={{ fontSize: 40, color: '#ef4444', mb: 1 }} />
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      mb: 1
                    }}
                  >
                    {stats.totalQuestions}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666', fontWeight: '500' }}>
                    Total Questions
                  </Typography>
                </StatCard>
              </Grid>
            </Grid>
          </StyledCard>
        )}

        {/* Score History List */}
        {scores.length === 0 ? (
          <EmptyStateCard>
            <QuizIcon sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h5" sx={{ color: '#000000', fontWeight: '600', mb: 2 }}>
              No quiz attempts yet
            </Typography>
            <Typography variant="body1" sx={{ color: '#666666', mb: 3 }}>
              Start playing quizzes to see your score history!
            </Typography>
            <Box sx={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              px: 3, 
              py: 1.5, 
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <SchoolIcon sx={{ mr: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: '600' }}>
                Ready to start your journey?
              </Typography>
            </Box>
          </EmptyStateCard>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {scores.map((scoreRecord) => {
              const percentage = ((scoreRecord.score / scoreRecord.totalQuestions) * 100).toFixed(1);
              return (
                <Grid item xs={12} md={8} lg={6} key={scoreRecord.id}>
                  <ScoreCard>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ color: '#000000', fontWeight: '600', mb: 1 }}>
                            📚 {scoreRecord.quizTitle}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666666', fontWeight: '500' }}>
                            🗓️ Completed: {formatDate(scoreRecord.completedAt)}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${scoreRecord.score} / ${scoreRecord.totalQuestions}`}
                          sx={{
                            background: percentage >= 80 ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' :
                                       percentage >= 60 ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' :
                                       percentage >= 40 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                                       'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '1rem',
                            px: 2,
                            py: 1
                          }}
                        />
                      </Box>

                      <Divider sx={{ my: 2, background: 'rgba(156, 163, 175, 0.3)' }} />

                      <Box sx={{ mb: 3 }}>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: '700',
                            background: percentage >= 80 ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' :
                                       percentage >= 60 ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' :
                                       percentage >= 40 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                                       'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            textAlign: 'center',
                            mb: 1
                          }}
                        >
                          {percentage}%
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666666', textAlign: 'center', fontWeight: '500' }}>
                          Performance Score
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: '600', mb: 2 }}>
                          🎯 Question-by-Question Results:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                          {scoreRecord.answers.map((answer, index) => (
                            <QuestionChip
                              key={index}
                              label={index + 1}
                              correct={answer.isCorrect}
                              size="small"
                            />
                          ))}
                        </Box>
                      </Box>
                    </CardContent>
                  </ScoreCard>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </GradientBackground>
  );
}