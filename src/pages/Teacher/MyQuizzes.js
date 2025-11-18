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
import { styled, keyframes } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QuizIcon from '@mui/icons-material/Quiz';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
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

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
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

const EmptyStateCard = styled(Paper)({
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(59, 130, 246, 0.1)',
  boxShadow: '0 10px 25px rgba(59, 130, 246, 0.1)',
  padding: '48px',
  textAlign: 'center',
  animation: `${fadeInUp} 0.8s ease-out`,
});

const QuizCard = styled(Card)({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(59, 130, 246, 0.1)',
  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.08)',
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
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    '&::before': {
      opacity: 1,
    },
    '& .quiz-icon': {
      animation: `${float} 2s infinite`,
    }
  }
});

const QuizCodeBox = styled(Box)({
  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(96, 165, 250, 0.1) 100%)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  borderRadius: '12px',
  padding: '8px 16px',
  marginTop: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(96, 165, 250, 0.15) 100%)',
    transform: 'scale(1.02)',
  }
});

const ActionButton = styled(Button)({
  borderRadius: '12px',
  padding: '8px 16px',
  fontWeight: '600',
  textTransform: 'none',
  fontSize: '0.85rem',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
  }
});

const PrimaryButton = styled(ActionButton)({
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  color: 'white',
  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.25)',
  '&:hover': {
    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
    transform: 'translateY(-2px)',
  }
});

const EditButton = styled(ActionButton)({
  color: '#059669',
  background: 'rgba(5, 150, 105, 0.1)',
  border: '1px solid rgba(5, 150, 105, 0.2)',
  '&:hover': {
    background: 'rgba(5, 150, 105, 0.2)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
  }
});

const AnalyticsButton = styled(ActionButton)({
  color: '#7c3aed',
  background: 'rgba(124, 58, 237, 0.1)',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  '&:hover': {
    background: 'rgba(124, 58, 237, 0.2)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
  }
});

const DeleteButton = styled(ActionButton)({
  color: '#ef4444',
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  '&:hover': {
    background: 'rgba(239, 68, 68, 0.2)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
  },
  '&:disabled': {
    background: 'rgba(156, 163, 175, 0.1)',
    color: '#9ca3af',
  }
});

const StyledChip = styled(Chip)({
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  color: 'white',
  fontWeight: '600',
  borderRadius: '12px',
  '& .MuiChip-label': {
    padding: '4px 12px',
  }
});

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
    <GradientBackground>
      <GlassAppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate('/teacher/dashboard')}
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
            My Quizzes
          </Typography>
          <PrimaryButton 
            startIcon={<AddIcon />}
            onClick={() => navigate('/teacher/create-quiz')}
            sx={{ 
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#1e40af',
              '&:hover': {
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#1e40af'
              }
            }}
          >
            Create New
          </PrimaryButton>
        </Toolbar>
      </GlassAppBar>

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {loading ? (
          <LoadingContainer>
            <CircularProgress size={60} />
          </LoadingContainer>
        ) : quizzes.length === 0 ? (
          <EmptyStateCard>
            <QuizIcon sx={{ fontSize: 64, color: '#3b82f6', mb: 2, animation: `${float} 3s infinite` }} />
            <Typography variant="h5" gutterBottom sx={{ color: '#000000', fontWeight: '600' }}>
              No quizzes created yet
            </Typography>
            <Typography variant="body1" sx={{ color: '#666666', mb: 3 }}>
              Create your first quiz to get started with engaging your students
            </Typography>
            <PrimaryButton
              startIcon={<AddIcon />}
              onClick={() => navigate('/teacher/create-quiz')}
            >
              Create Your First Quiz
            </PrimaryButton>
          </EmptyStateCard>
        ) : (
          <Grid container spacing={3}>
            {quizzes.map((quiz, index) => (
              <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                <QuizCard sx={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <QuizIcon className="quiz-icon" sx={{ fontSize: 32, color: '#3b82f6', mr: 1.5 }} />
                      <Typography variant="h6" gutterBottom sx={{ color: '#000000', fontWeight: '600', mb: 0 }}>
                        {quiz.title}
                      </Typography>
                    </Box>
                    
                    <StyledChip
                      label={quiz.subject}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#666666' }}>
                        {quiz.questions.length} Questions
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666666' }}>
                        {quiz.timePerQuestion}s each
                      </Typography>
                    </Box>
                    
                    <QuizCodeBox>
                      <Typography variant="body2" sx={{ color: '#000000', fontWeight: '600', textAlign: 'center' }}>
                        Quiz Code: {quiz.quizCode}
                      </Typography>
                    </QuizCodeBox>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0, gap: 1, flexWrap: 'wrap' }}>
                    <EditButton
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/teacher/edit-quiz/${quiz.id}`)}
                    >
                      Edit
                    </EditButton>
                    <AnalyticsButton
                      size="small"
                      startIcon={<AnalyticsIcon />}
                      onClick={() => navigate(`/teacher/quiz-analytics/${quiz.id}`)}
                    >
                      Analytics
                    </AnalyticsButton>
                    <DeleteButton
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                      disabled={deleteLoading === quiz.id}
                    >
                      {deleteLoading === quiz.id ? 'Deleting...' : 'Delete'}
                    </DeleteButton>
                  </CardActions>
                </QuizCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </GradientBackground>
  );
}