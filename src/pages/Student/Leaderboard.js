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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

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

  const getMedalIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getMedalColor = (rank) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return 'transparent';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!quiz) {
    return null;
  }

  return (
    <>
      <AppBar position="static" color="secondary">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/student/dashboard')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Leaderboard
          </Typography>
          <EmojiEventsIcon />
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {/* Quiz Info */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            🏆 {quiz.title}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {quiz.subject}
          </Typography>
          <Chip label={`${quiz.questions.length} Questions`} sx={{ mt: 1 }} />
        </Paper>

        {/* Leaderboard Table */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Top Performers
          </Typography>

          {leaderboard.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No scores yet. Be the first to play!
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width={80}><strong>Rank</strong></TableCell>
                    <TableCell><strong>Student</strong></TableCell>
                    <TableCell align="center"><strong>Score</strong></TableCell>
                    <TableCell align="center"><strong>Percentage</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.map((entry, index) => {
                    const rank = index + 1;
                    return (
                      <TableRow
                        key={entry.studentId}
                        sx={{
                          bgcolor: entry.isCurrentUser ? 'action.selected' : 'inherit',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: getMedalColor(rank),
                              margin: '0 auto',
                              fontSize: rank <= 3 ? '1.5rem' : '1rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {getMedalIcon(rank)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              {entry.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body1">
                                {entry.name}
                                {entry.isCurrentUser && (
                                  <Chip
                                    label="You"
                                    size="small"
                                    color="primary"
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {entry.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${entry.score}/${entry.totalQuestions}`}
                            color={entry.percentage >= 80 ? 'success' : entry.percentage >= 60 ? 'primary' : 'default'}
                            variant={rank <= 3 ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="h6" color={rank <= 3 ? 'primary' : 'inherit'}>
                            {entry.percentage.toFixed(1)}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* User's Rank Info */}
        {leaderboard.length > 0 && (
          <Paper elevation={3} sx={{ p: 2, mt: 3, textAlign: 'center', bgcolor: 'info.light' }}>
            {leaderboard.find(e => e.isCurrentUser) ? (
              <Typography variant="body1">
                Your Rank: <strong>#{leaderboard.findIndex(e => e.isCurrentUser) + 1}</strong> out of {leaderboard.length}
              </Typography>
            ) : (
              <Typography variant="body1">
                Play this quiz to join the leaderboard!
              </Typography>
            )}
          </Paper>
        )}
      </Container>
    </>
  );
}