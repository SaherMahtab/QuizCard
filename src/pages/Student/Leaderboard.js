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
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  EmojiEvents as EmojiEventsIcon,
  Leaderboard as LeaderboardIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

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

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
});

const StyledTableContainer = styled(TableContainer)({
  background: 'rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  overflow: 'hidden',
  '& .MuiTableHead-root': {
    background: 'rgba(59, 130, 246, 0.1)',
  },
  '& .MuiTableBody-root .MuiTableRow-root': {
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(59, 130, 246, 0.1)',
      transform: 'scale(1.01)',
    }
  }
});

const RankBadge = styled(Box)(({ rank }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 50,
  height: 50,
  borderRadius: '50%',
  margin: '0 auto',
  fontSize: rank <= 3 ? '1.8rem' : '1.2rem',
  fontWeight: 'bold',
  background: rank === 1 ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' :
              rank === 2 ? 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)' :
              rank === 3 ? 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)' :
              'rgba(156, 163, 175, 0.3)',
  color: rank <= 3 ? '#000000' : '#666666',
  boxShadow: rank <= 3 ? '0 4px 15px rgba(0, 0, 0, 0.2)' : 'none',
  border: rank <= 3 ? '3px solid rgba(255, 255, 255, 0.5)' : '2px solid rgba(156, 163, 175, 0.3)',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: rank <= 3 ? 'scale(1.1)' : 'scale(1.05)',
  }
}));

const TrophyChip = styled(Chip)(({ rank }) => ({
  background: rank <= 3 ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' :
              'rgba(156, 163, 175, 0.3)',
  color: rank <= 3 ? 'white' : '#666666',
  fontWeight: '600',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  }
}));

const UserRankCard = styled(StyledCard)(({ isCurrentUser }) => ({
  background: isCurrentUser ? 
    'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)' :
    'rgba(255, 255, 255, 0.2)',
  border: isCurrentUser ? 
    '2px solid rgba(59, 130, 246, 0.4)' :
    '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: isCurrentUser ? 'scale(1.02)' : 'none',
  }
}));

export default function Leaderboard() {
  const { quizCode } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // First, find the quiz by code
      const quizQuery = query(
        collection(db, 'quizzes'),
        where('quizCode', '==', quizCode.toUpperCase())
      );
      const quizSnapshot = await getDocs(quizQuery);

      if (quizSnapshot.empty) {
        alert('Quiz not found!');
        navigate('/student/dashboard');
        return;
      }

      const quizData = { id: quizSnapshot.docs[0].id, ...quizSnapshot.docs[0].data() };
      setQuiz(quizData);

      // Fetch all scores for this quiz
      const scoresQuery = query(
        collection(db, 'scores'),
        where('quizId', '==', quizData.id)
      );
      const scoresSnapshot = await getDocs(scoresQuery);

      // Group scores by student (get best score for each student)
      const studentScores = {};
      const studentIds = new Set();

      scoresSnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        const percentage = (data.score / data.totalQuestions) * 100;

        if (!studentScores[data.studentId] || percentage > studentScores[data.studentId].percentage) {
          studentScores[data.studentId] = {
            ...data,
            percentage: percentage
          };
        }
        studentIds.add(data.studentId);
      });

      // Fetch student details
      const leaderboardData = [];
      for (const studentId of studentIds) {
        const studentDoc = await getDoc(doc(db, 'users', studentId));
        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          const scoreData = studentScores[studentId];
          leaderboardData.push({
            studentId,
            name: studentData.name,
            email: studentData.email,
            score: scoreData.score,
            totalQuestions: scoreData.totalQuestions,
            percentage: scoreData.percentage,
            completedAt: scoreData.completedAt,
            isCurrentUser: studentId === currentUser.uid
          });
        }
      }

      // Sort by percentage (highest first), then by completion time (earliest first)
      leaderboardData.sort((a, b) => {
        if (b.percentage !== a.percentage) {
          return b.percentage - a.percentage;
        }
        return new Date(a.completedAt) - new Date(b.completedAt);
      });

      setLeaderboard(leaderboardData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <GradientBackground>
        <LoadingContainer>
          <CircularProgress size={60} sx={{ color: '#3b82f6' }} />
        </LoadingContainer>
      </GradientBackground>
    );
  }

  if (!quiz) {
    return null;
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
          <LeaderboardIcon sx={{ mx: 2, color: '#3b82f6', fontSize: 28 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#000000', fontWeight: '600' }}>
            Leaderboard
          </Typography>
          <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 32 }} />
        </Toolbar>
      </GlassAppBar>

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Quiz Info Header */}
        <StyledCard sx={{ p: 4, mb: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <EmojiEventsIcon sx={{ fontSize: 60, color: '#FFD700', mr: 2 }} />
          </Box>
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
            {quiz.title}
          </Typography>
          <Typography variant="h6" sx={{ color: '#666666', fontWeight: '500', mb: 2 }}>
            📚 {quiz.subject}
          </Typography>
          <Chip 
            label={`${quiz.questions.length} Questions`} 
            sx={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              fontWeight: '600',
              fontSize: '1rem',
              px: 2,
              py: 1
            }} 
          />
        </StyledCard>

        {/* Leaderboard Table */}
        <StyledCard sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SchoolIcon sx={{ fontSize: 32, color: '#3b82f6', mr: 2 }} />
            <Typography variant="h5" sx={{ color: '#000000', fontWeight: '600' }}>
            Top Performers
            </Typography>
          </Box>

          {leaderboard.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <EmojiEventsIcon sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#000000', fontWeight: '600', mb: 1 }}>
                No scores yet
              </Typography>
              <Typography variant="body1" sx={{ color: '#666666' }}>
                Be the first to play and claim the top spot! 🚀
              </Typography>
            </Box>
          ) : (
            <StyledTableContainer sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width={100}>
                      <Typography sx={{ color: '#000000', fontWeight: '700', fontSize: '1.1rem' }}>
                        Rank
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: '#000000', fontWeight: '700', fontSize: '1.1rem' }}>
                        Student
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ color: '#000000', fontWeight: '700', fontSize: '1.1rem' }}>
                        Score
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ color: '#000000', fontWeight: '700', fontSize: '1.1rem' }}>
                        Percentage
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.map((entry, index) => {
                    const rank = index + 1;
                    return (
                      <TableRow
                        key={entry.studentId}
                        sx={{
                          bgcolor: entry.isCurrentUser ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                          border: entry.isCurrentUser ? '2px solid rgba(59, 130, 246, 0.3)' : 'none',
                          borderRadius: entry.isCurrentUser ? '12px' : '0',
                        }}
                      >
                        <TableCell align="center">
                          <RankBadge rank={rank}>
                            {rank <= 3 ? (rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉') : rank}
                          </RankBadge>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              sx={{ 
                                width: 45, 
                                height: 45, 
                                background: entry.isCurrentUser ? 
                                  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' :
                                  'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                border: '3px solid rgba(255, 255, 255, 0.3)'
                              }}
                            >
                              {entry.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6" sx={{ color: '#000000', fontWeight: '600' }}>
                                  {entry.name}
                                </Typography>
                                {entry.isCurrentUser && (
                                  <Chip
                                    label="You"
                                    size="small"
                                    sx={{ 
                                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                      color: 'white',
                                      fontWeight: '600'
                                    }}
                                  />
                                )}
                              </Box>
                              <Typography variant="body2" sx={{ color: '#666666', fontWeight: '500' }}>
                                {entry.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <TrophyChip
                            label={`${entry.score}/${entry.totalQuestions}`}
                            rank={rank}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography 
                            variant="h5" 
                            sx={{ 
                              fontWeight: '700',
                              background: rank <= 3 ? 
                                'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' :
                                'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              color: 'transparent'
                            }}
                          >
                            {entry.percentage.toFixed(1)}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </StyledTableContainer>
          )}
        </StyledCard>

        {/* User's Rank Info */}
        {leaderboard.length > 0 && (
          <UserRankCard 
            isCurrentUser={leaderboard.find(e => e.isCurrentUser)} 
            sx={{ p: 3, mt: 4, textAlign: 'center' }}
          >
            {leaderboard.find(e => e.isCurrentUser) ? (
              <Box>
                <Typography variant="h6" sx={{ color: '#000000', fontWeight: '600', mb: 1 }}>
                  🎯 Your Performance
                </Typography>
                <Typography variant="h5" sx={{ 
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}>
                  Rank #{leaderboard.findIndex(e => e.isCurrentUser) + 1} out of {leaderboard.length}
                </Typography>
              </Box>
            ) : (
              <Box>
                <EmojiEventsIcon sx={{ fontSize: 40, color: '#3b82f6', mb: 1 }} />
                <Typography variant="h6" sx={{ color: '#000000', fontWeight: '600' }}>
                  Join the Competition!
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666' }}>
                  Play this quiz to see your rank on the leaderboard
                </Typography>
              </Box>
            )}
          </UserRankCard>
        )}
      </Container>
    </GradientBackground>
  );
}