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
  TableRow,
  Button
} from '@mui/material';
import { styled, keyframes, useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
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

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const countUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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

const StyledCard = styled(Paper)(({ theme }) => ({
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

const StatCard = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(30, 41, 59, 0.5)'
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(96, 165, 250, 0.2)'
    : '1px solid rgba(59, 130, 246, 0.1)',
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
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(96, 165, 250, 0.03) 100%)',
    opacity: 0,
    transition: 'opacity 0.4s ease',
  },
  '&:hover': {
    transform: 'translateY(-5px) scale(1.02)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 15px 30px rgba(96, 165, 250, 0.3)'
      : '0 15px 30px rgba(59, 130, 246, 0.2)',
    '&::before': {
      opacity: 1,
    },
  }
}));

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

const SecondaryChip = styled(StyledChip)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.1)',
  color: theme.palette.mode === 'dark' ? '#93c5fd' : '#1e40af',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(96, 165, 250, 0.3)'
    : '1px solid rgba(59, 130, 246, 0.2)',
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(30, 41, 59, 0.6)'
    : 'rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(96, 165, 250, 0.3)'
    : '1px solid rgba(59, 130, 246, 0.1)',
  overflow: 'hidden',
  '& .MuiTableHead-root': {
    background: theme.palette.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.2)'
      : 'rgba(59, 130, 246, 0.1)',
  },
  '& .MuiTableBody-root .MuiTableRow-root': {
    transition: 'all 0.3s ease',
    '&:hover': {
      background: theme.palette.mode === 'dark'
        ? 'rgba(59, 130, 246, 0.15)'
        : 'rgba(59, 130, 246, 0.1)',
      transform: 'scale(1.01)',
    }
  },
  '& .MuiTableCell-root': {
    borderColor: theme.palette.mode === 'dark'
      ? 'rgba(96, 165, 250, 0.2)'
      : 'rgba(59, 130, 246, 0.1)',
    color: theme.palette.text.primary,
  }
}));

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

const ExportButton = styled(Button)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  color: 'white',
  borderRadius: '12px',
  padding: '8px 20px',
  textTransform: 'none',
  fontWeight: '600',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 12px rgba(59, 130, 246, 0.3)'
    : '0 4px 12px rgba(59, 130, 246, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)'
      : 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 6px 16px rgba(59, 130, 246, 0.4)'
      : '0 6px 16px rgba(59, 130, 246, 0.3)',
  },
  '&:disabled': {
    background: theme.palette.mode === 'dark'
      ? 'rgba(100, 116, 139, 0.5)'
      : 'rgba(203, 213, 225, 0.5)',
    color: theme.palette.mode === 'dark'
      ? 'rgba(148, 163, 184, 0.5)'
      : 'rgba(100, 116, 139, 0.5)',
  }
}));

export default function QuizAnalytics() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
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

  const exportToCSV = () => {
    if (scores.length === 0) {
      alert('No data to export');
      return;
    }

    // CSV Headers
    const headers = ['Student Name', 'Email', 'Score', 'Total Questions', 'Percentage (%)', 'Completed At'];

    // CSV Rows
    const rows = scores
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .map(score => {
        const student = students[score.studentId] || {};
        const percentage = ((score.score / score.totalQuestions) * 100).toFixed(1);

        return [
          student.name || 'Unknown',
          student.email || 'N/A',
          score.score,
          score.totalQuestions,
          percentage,
          formatDate(score.completedAt)
        ];
      });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Generate filename with quiz title and date
    const fileName = `${quiz.title.replace(/[^a-z0-9]/gi, '_')}_Results_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: '600' }}>
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
              color: theme.palette.mode === 'dark' ? '#93c5fd' : '#1e40af',
              background: theme.palette.mode === 'dark'
                ? 'rgba(59, 130, 246, 0.15)'
                : 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              '&:hover': {
                background: theme.palette.mode === 'dark'
                  ? 'rgba(59, 130, 246, 0.25)'
                  : 'rgba(59, 130, 246, 0.2)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <BarChartIcon sx={{ mx: 2, color: theme.palette.primary.main, fontSize: 28 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, color: theme.palette.text.primary, fontWeight: '600' }}>
            Quiz Analytics
          </Typography>
          <ExportButton
            startIcon={<DownloadIcon />}
            onClick={exportToCSV}
            disabled={scores.length === 0}
            sx={{ mr: 2 }}
          >
            Export CSV
          </ExportButton>
          <DarkModeToggle />
        </Toolbar>
      </GlassAppBar>

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Quiz Info */}
        <StyledCard sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SchoolIcon sx={{ fontSize: 32, color: '#3b82f6', mr: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: '600', mb: 0 }}>
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
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: '600', mb: 3 }}>
            📊 Overview Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={4} md={2.4}>
              <StatCard sx={{ animationDelay: '0.1s' }}>
                <TrendingUpIcon sx={{ fontSize: 32, color: '#3b82f6', mb: 1 }} />
                <StatNumber>
                  {stats.totalAttempts}
                </StatNumber>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: '500' }}>
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
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: '500' }}>
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
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: '500' }}>
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
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: '500' }}>
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
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: '500' }}>
                  Lowest Score
                </Typography>
              </StatCard>
            </Grid>
          </Grid>
        </StyledCard>

        {/* Student Attempts Table */}
        <StyledCard sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: '600', mb: 3 }}>
            👥 Student Attempts
          </Typography>

          {scores.length === 0 ? (
            <EmptyStateBox>
              <GroupIcon className="empty-icon" />
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: '600', mb: 1 }}>
                No Attempts Yet
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                No students have attempted this quiz yet.
              </Typography>
            </EmptyStateBox>
          ) : (
            <StyledTableContainer sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Student</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell align="center"><strong>Score</strong></TableCell>
                    <TableCell align="center"><strong>Percentage</strong></TableCell>
                    <TableCell><strong>Completed At</strong></TableCell>
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
                          <TableCell sx={{ fontWeight: '500' }}>
                            {student.name || 'Unknown'}
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.text.secondary }}>
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
                          <TableCell sx={{ color: theme.palette.text.secondary }}>
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