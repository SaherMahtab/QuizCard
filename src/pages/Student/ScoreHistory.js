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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

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
        where('studentId', '==', currentUser.uid),
        orderBy('completedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const scoresData = [];
      querySnapshot.forEach((doc) => {
        scoresData.push({ id: doc.id, ...doc.data() });
      });
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

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'primary';
    if (percentage >= 40) return 'warning';
    return 'error';
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
            My Score History
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Statistics Summary */}
        {scores.length > 0 && (
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Overall Statistics
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {stats.totalQuizzes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quizzes Taken
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {stats.avgScore}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Score
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary">
                    {stats.totalCorrect}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Correct Answers
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4">
                    {stats.totalQuestions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Questions
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Score History List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : scores.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No quiz attempts yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Start playing quizzes to see your score history!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {scores.map((scoreRecord) => (
              <Grid item xs={12} key={scoreRecord.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {scoreRecord.quizTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Completed: {formatDate(scoreRecord.completedAt)}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${scoreRecord.score} / ${scoreRecord.totalQuestions}`}
                        color={getScoreColor(scoreRecord.score, scoreRecord.totalQuestions)}
                        sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Percentage: {((scoreRecord.score / scoreRecord.totalQuestions) * 100).toFixed(1)}%
                      </Typography>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Question Results:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                          {scoreRecord.answers.map((answer, index) => (
                            <Chip
                              key={index}
                              label={index + 1}
                              size="small"
                              color={answer.isCorrect ? 'success' : 'error'}
                              variant={answer.isCorrect ? 'filled' : 'outlined'}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}