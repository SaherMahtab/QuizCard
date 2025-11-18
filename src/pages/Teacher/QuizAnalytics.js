import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Grid,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

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
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const countUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '60vh',
  '& .MuiCircularProgress-root': {
    color: '#3b82f6',
    animation: `${pulse} 2s infinite`,
  }
});

const StyledCard = styled(Paper)({
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

const StatCard = styled(Box)({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: '1px solid rgba(59, 130, 246, 0.1)',
  padding: '24px',
  textAlign: 'center',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(96, 165, 250, 0.03) 100%)',
    opacity: 0,
    transition: 'opacity 0.4s ease',
  },
  '&:hover': {
    transform: 'translateY(-5px) scale(1.02)',
    boxShadow: '0 15px 30px rgba(59, 130, 246, 0.2)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    '&::before': {
      opacity: 1,
    },
  }
});

const StyledChip = styled(Chip)({
  borderRadius: '12px',
  fontWeight: '600',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  }
});

const PrimaryChip = styled(StyledChip)({
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  color: 'white',
});

const SecondaryChip = styled(StyledChip)({
  background: 'rgba(59, 130, 246, 0.1)',
  color: '#1e40af',
  border: '1px solid rgba(59, 130, 246, 0.2)',
});

const StyledTableContainer = styled(TableContainer)({
  borderRadius: '16px',
  border: '1px solid rgba(59, 130, 246, 0.1)',
  '& .MuiTableHead-root': {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(96, 165, 250, 0.05) 100%)',
  },
  '& .MuiTableRow-root': {
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(59, 130, 246, 0.05)',
      transform: 'scale(1.01)',
    }
  },
  '& .MuiTableCell-root': {
    borderColor: 'rgba(59, 130, 246, 0.1)',
  }
});

const StatNumber = styled(Typography)({
  fontWeight: '700',
  fontSize: '2.5rem',
  animation: `${countUp} 1s ease-out`,
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
});

const EmptyStateBox = styled(Box)({
  textAlign: 'center',
  padding: '48px 24px',
  '& .empty-icon': {
    fontSize: '64px',
    color: '#3b82f6',
    marginBottom: '16px',
    opacity: 0.7,
  }
});

export default function QuizAnalytics() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [scores, setScores] = useState([]);
  const [students, setStudents] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      // Fetch quiz data
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      if (quizDoc.exists()) {
        setQuiz({ id: quizDoc.id, ...quizDoc.data() });
      }

      // Fetch all scores for this quiz
      const scoresQuery = query(
        collection(db, 'scores'),
        where('quizId', '==', quizId)
      );
      const scoresSnapshot = await getDocs(scoresQuery);
      const scoresData = [];
      const studentIds = new Set();

      scoresSnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        scoresData.push(data);
        studentIds.add(data.studentId);
      });

      setScores(scoresData);

      // Fetch student details
      const studentsData = {};
      for (const studentId of studentIds) {
        const studentDoc = await getDoc(doc(db, 'users', studentId));
        if (studentDoc.exists()) {
          studentsData[studentId] = studentDoc.data();
        }
      }
      setStudents(studentsData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (scores.length === 0) {
      return {
        totalAttempts: 0,
        uniqueStudents: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0
      };
    }

    const uniqueStudents = new Set(scores.map(s => s.studentId)).size;
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    const totalQuestions = scores.reduce((sum, s) => sum + s.totalQuestions, 0);
    const averagePercentage = (totalScore / totalQuestions) * 100;

    const percentages = scores.map(s => (s.score / s.totalQuestions) * 100);
    const highestScore = Math.max(...percentages);
    const lowestScore = Math.min(...percentages);

    return {
      totalAttempts: scores.length,
      uniqueStudents,
      averageScore: averagePercentage.toFixed(1),
      highestScore: highestScore.toFixed(1),
      lowestScore: lowestScore.toFixed(1)
    };
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

  if (loading) {
    return (
      <GradientBackground>
        <LoadingContainer>
          <CircularProgress size={60} />
        </LoadingContainer>
      </GradientBackground>
    );
  }

  if (!quiz) {
    return (
      <GradientBackground>
        <EmptyStateBox sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box>
            <AssessmentIcon className="empty-icon" />
            <Typography variant="h5" sx={{ color: '#000000', fontWeight: '600' }}>
              Quiz not found
            </Typography>
          </Box>
        </EmptyStateBox>
      </GradientBackground>
    );
  }

  const stats = calculateStats();

  return (
    <GradientBackground>
      <GlassAppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate('/teacher/my-quizzes')}
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
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#000000', fontWeight: '600', ml: 2 }}>
            Quiz Analytics
          </Typography>
        </Toolbar>
      </GlassAppBar>

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Quiz Info */}
        <StyledCard sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BarChartIcon sx={{ fontSize: 32, color: '#3b82f6', mr: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ color: '#000000', fontWeight: '600', mb: 0 }}>
              {quiz.title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            <PrimaryChip label={quiz.subject} />
            <SecondaryChip label={`${quiz.questions.length} Questions`} />
            <SecondaryChip label={`Quiz Code: ${quiz.quizCode}`} />
          </Box>
        </StyledCard>

        {/* Statistics Overview */}
        <StyledCard sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#000000', fontWeight: '600', mb: 3 }}>
            📊 Overview Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={4} md={2.4}>
              <StatCard sx={{ animationDelay: '0.1s' }}>
                <TrendingUpIcon sx={{ fontSize: 32, color: '#3b82f6', mb: 1 }} />
                <StatNumber>
                  {stats.totalAttempts}
                </StatNumber>
                <Typography variant="body2" sx={{ color: '#666666', fontWeight: '500' }}>
                  Total Attempts
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <StatCard sx={{ animationDelay: '0.2s' }}>
                <GroupIcon sx={{ fontSize: 32, color: '#7c3aed', mb: 1 }} />
                <StatNumber sx={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                  {stats.uniqueStudents}
                </StatNumber>
                <Typography variant="body2" sx={{ color: '#666666', fontWeight: '500' }}>
                  Unique Students
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <StatCard sx={{ animationDelay: '0.3s' }}>
                <AssessmentIcon sx={{ fontSize: 32, color: '#059669', mb: 1 }} />
                <StatNumber sx={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                  {stats.averageScore}%
                </StatNumber>
                <Typography variant="body2" sx={{ color: '#666666', fontWeight: '500' }}>
                  Average Score
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <StatCard sx={{ animationDelay: '0.4s' }}>
                <SchoolIcon sx={{ fontSize: 32, color: '#16a34a', mb: 1 }} />
                <StatNumber sx={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                  {stats.highestScore}%
                </StatNumber>
                <Typography variant="body2" sx={{ color: '#666666', fontWeight: '500' }}>
                  Highest Score
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <StatCard sx={{ animationDelay: '0.5s' }}>
                <TrendingUpIcon sx={{ fontSize: 32, color: '#ef4444', mb: 1 }} />
                <StatNumber sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                  {stats.lowestScore}%
                </StatNumber>
                <Typography variant="body2" sx={{ color: '#666666', fontWeight: '500' }}>
                  Lowest Score
                </Typography>
              </StatCard>
            </Grid>
          </Grid>
        </StyledCard>

        {/* Student Attempts Table */}
        <StyledCard sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#000000', fontWeight: '600', mb: 3 }}>
            👥 Student Attempts
          </Typography>

          {scores.length === 0 ? (
            <EmptyStateBox>
              <GroupIcon className="empty-icon" />
              <Typography variant="h6" sx={{ color: '#000000', fontWeight: '600', mb: 1 }}>
                No Attempts Yet
              </Typography>
              <Typography variant="body1" sx={{ color: '#666666' }}>
                No students have attempted this quiz yet.
              </Typography>
            </EmptyStateBox>
          ) : (
            <StyledTableContainer sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong style={{ color: '#000000' }}>Student</strong></TableCell>
                    <TableCell><strong style={{ color: '#000000' }}>Email</strong></TableCell>
                    <TableCell align="center"><strong style={{ color: '#000000' }}>Score</strong></TableCell>
                    <TableCell align="center"><strong style={{ color: '#000000' }}>Percentage</strong></TableCell>
                    <TableCell><strong style={{ color: '#000000' }}>Completed At</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scores
                    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                    .map((score, index) => {
                      const percentage = ((score.score / score.totalQuestions) * 100).toFixed(1);
                      const student = students[score.studentId] || {};

                      return (
                        <TableRow key={score.id} sx={{ animationDelay: `${index * 0.1}s` }}>
                          <TableCell sx={{ color: '#000000', fontWeight: '500' }}>
                            {student.name || 'Unknown'}
                          </TableCell>
                          <TableCell sx={{ color: '#666666' }}>
                            {student.email || 'N/A'}
                          </TableCell>
                          <TableCell align="center">
                            <StyledChip
                              label={`${score.score}/${score.totalQuestions}`}
                              sx={{
                                background: percentage >= 70 ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' :
                                           percentage >= 50 ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' :
                                           'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white'
                              }}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography sx={{ 
                              fontWeight: '600', 
                              color: percentage >= 70 ? '#059669' : percentage >= 50 ? '#3b82f6' : '#ef4444' 
                            }}>
                              {percentage}%
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ color: '#666666' }}>
                            {formatDate(score.completedAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </StyledTableContainer>
          )}
        </StyledCard>
      </Container>
    </GradientBackground>
  );
}