import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function MyQuizzes() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchQuizzes = async () => {
    try {
      const q = query(
        collection(db, 'quizzes'),
        where('teacherId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const quizzesData = [];
      querySnapshot.forEach((doc) => {
        quizzesData.push({ id: doc.id, ...doc.data() });
      });
      setQuizzes(quizzesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId, quizTitle) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${quizTitle}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setDeleteLoading(quizId);
      await deleteDoc(doc(db, 'quizzes', quizId));

      // Remove from local state
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      setDeleteLoading(null);
      alert('Quiz deleted successfully!');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz: ' + error.message);
      setDeleteLoading(null);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/teacher/dashboard')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My Quizzes
          </Typography>
          <Button color="inherit" onClick={() => navigate('/teacher/create-quiz')}>
            + Create New
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : quizzes.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No quizzes created yet
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate('/teacher/create-quiz')}
            >
              Create Your First Quiz
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {quizzes.map((quiz) => (
              <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {quiz.title}
                    </Typography>
                    <Chip
                      label={quiz.subject}
                      color="primary"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {quiz.questions.length} Questions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {quiz.timePerQuestion}s per question
                    </Typography>
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Quiz Code: {quiz.quizCode}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(`/teacher/edit-quiz/${quiz.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="info"
                      onClick={() => navigate(`/teacher/quiz-analytics/${quiz.id}`)}
                    >
                      Analytics
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                      disabled={deleteLoading === quiz.id}
                    >
                      {deleteLoading === quiz.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}