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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!quiz) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography>Quiz not found</Typography>
      </Box>
    );
  }

  const stats = calculateStats();

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/teacher/my-quizzes')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Quiz Analytics
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Quiz Info */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {quiz.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Chip label={quiz.subject} color="primary" />
            <Chip label={`${quiz.questions.length} Questions`} />
            <Chip label={`Quiz Code: ${quiz.quizCode}`} variant="outlined" />
          </Box>
        </Paper>

        {/* Statistics Overview */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Overview Statistics
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={6} sm={4} md={2.4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {stats.totalAttempts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Attempts
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="secondary">
                  {stats.uniqueStudents}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unique Students
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {stats.averageScore}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Score
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.dark">
                  {stats.highestScore}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Highest Score
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {stats.lowestScore}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lowest Score
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Student Attempts Table */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Student Attempts
          </Typography>

          {scores.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No students have attempted this quiz yet.
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ mt: 2 }}>
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
                    .map((score) => {
                      const percentage = ((score.score / score.totalQuestions) * 100).toFixed(1);
                      const student = students[score.studentId] || {};

                      return (
                        <TableRow key={score.id}>
                          <TableCell>{student.name || 'Unknown'}</TableCell>
                          <TableCell>{student.email || 'N/A'}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${score.score}/${score.totalQuestions}`}
                              color={percentage >= 70 ? 'success' : percentage >= 50 ? 'primary' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <strong>{percentage}%</strong>
                          </TableCell>
                          <TableCell>{formatDate(score.completedAt)}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </>
  );
}