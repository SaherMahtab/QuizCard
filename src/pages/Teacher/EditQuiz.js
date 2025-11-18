import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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

const MainCard = styled(Paper)({
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(59, 130, 246, 0.1)',
  boxShadow: '0 10px 25px rgba(59, 130, 246, 0.1)',
  animation: `${fadeInUp} 0.8s ease-out`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
});

const QuestionCard = styled(Paper)({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: '1px solid rgba(59, 130, 246, 0.1)',
  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.08)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 30px rgba(59, 130, 246, 0.15)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
  }
});

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
  '& .MuiCircularProgress-root': {
    color: '#3b82f6',
    animation: `${pulse} 2s infinite`,
  }
});

const StyledButton = styled(Button)({
  borderRadius: '12px',
  padding: '10px 24px',
  fontWeight: '600',
  textTransform: 'none',
  fontSize: '0.95rem',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
    transition: 'left 0.6s',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    '&::before': {
      left: '100%',
    }
  }
});

const PrimaryButton = styled(StyledButton)({
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  color: 'white',
  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.25)',
  '&:hover': {
    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
    boxShadow: 'none',
    transform: 'none',
  }
});

const SecondaryButton = styled(StyledButton)({
  border: '1px solid rgba(59, 130, 246, 0.3)',
  color: '#1e40af',
  background: 'rgba(59, 130, 246, 0.05)',
  '&:hover': {
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.5)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.15)',
  }
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.8)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.9)',
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 1)',
      '& fieldset': {
        borderColor: '#3b82f6',
        borderWidth: '2px',
      }
    }
  }
});

const DeleteButton = styled(IconButton)({
  color: '#ef4444',
  background: 'rgba(239, 68, 68, 0.1)',
  borderRadius: '12px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'rgba(239, 68, 68, 0.2)',
    transform: 'scale(1.1)',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
  }
});

export default function EditQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [quizData, setQuizData] = useState({
    title: '',
    subject: '',
    timePerQuestion: 10,
    questions: []
  });

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchQuiz = async () => {
    try {
      const docRef = doc(db, 'quizzes', quizId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setQuizData({
          title: data.title,
          subject: data.subject,
          timePerQuestion: data.timePerQuestion,
          questions: data.questions
        });
        setLoading(false);
      } else {
        alert('Quiz not found!');
        navigate('/teacher/my-quizzes');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert('Error loading quiz');
      navigate('/teacher/my-quizzes');
    }
  };

  const handleQuizChange = (field, value) => {
    setQuizData({ ...quizData, [field]: value });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index][field] = value;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[qIndex].options[optIndex] = value;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          questionText: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      ]
    });
  };

  const deleteQuestion = (index) => {
    if (quizData.questions.length > 1) {
      const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
      setQuizData({ ...quizData, questions: updatedQuestions });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!quizData.title || !quizData.subject) {
      setError('Please fill in quiz title and subject');
      return;
    }

    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      if (!q.questionText) {
        setError(`Question ${i + 1} is empty`);
        return;
      }
      if (q.options.some(opt => !opt)) {
        setError(`Question ${i + 1} has empty options`);
        return;
      }
    }

    try {
      setSaving(true);

      const docRef = doc(db, 'quizzes', quizId);
      await updateDoc(docRef, {
        title: quizData.title,
        subject: quizData.subject,
        timePerQuestion: parseInt(quizData.timePerQuestion),
        questions: quizData.questions,
        updatedAt: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/teacher/my-quizzes');
      }, 2000);
    } catch (err) {
      setError('Failed to update quiz: ' + err.message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress size={60} />
      </LoadingContainer>
    );
  }

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
            Edit Quiz
          </Typography>
        </Toolbar>
      </GlassAppBar>

      <Container maxWidth="md" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2, 
              borderRadius: '12px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}
          >
            Quiz updated successfully! Redirecting...
          </Alert>
        )}

        <MainCard sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {/* Quiz Details */}
            <Typography variant="h5" gutterBottom sx={{ color: '#000000', fontWeight: '600', mb: 3 }}>
              Quiz Details
            </Typography>

            <StyledTextField
              fullWidth
              required
              label="Quiz Title"
              value={quizData.title}
              onChange={(e) => handleQuizChange('title', e.target.value)}
              sx={{ mt: 2 }}
            />

            <StyledTextField
              fullWidth
              required
              label="Subject"
              value={quizData.subject}
              onChange={(e) => handleQuizChange('subject', e.target.value)}
              sx={{ mt: 2 }}
            />

            <StyledTextField
              fullWidth
              type="number"
              label="Time per Question (seconds)"
              value={quizData.timePerQuestion}
              onChange={(e) => handleQuizChange('timePerQuestion', e.target.value)}
              sx={{ mt: 2 }}
              inputProps={{ min: 5, max: 60 }}
            />

            <Divider sx={{ my: 4, background: 'rgba(59, 130, 246, 0.1)' }} />

            {/* Questions */}
            <Typography variant="h5" gutterBottom sx={{ color: '#000000', fontWeight: '600', mb: 3 }}>
              Questions
            </Typography>

            {quizData.questions.map((question, qIndex) => (
              <QuestionCard key={qIndex} sx={{ p: 3, mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#000000', fontWeight: '600' }}>
                    Question {qIndex + 1}
                  </Typography>
                  {quizData.questions.length > 1 && (
                    <DeleteButton onClick={() => deleteQuestion(qIndex)}>
                      <DeleteIcon />
                    </DeleteButton>
                  )}
                </Box>

                <StyledTextField
                  fullWidth
                  required
                  label="Question Text"
                  value={question.questionText}
                  onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                  multiline
                  rows={2}
                  sx={{ mt: 2 }}
                />

                <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, color: '#000000', fontWeight: '600' }}>
                  Options:
                </Typography>

                {question.options.map((option, optIndex) => (
                  <Box key={optIndex} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography sx={{ mr: 2, minWidth: 80, color: '#666666' }}>
                      Option {optIndex + 1}:
                    </Typography>
                    <StyledTextField
                      fullWidth
                      required
                      value={option}
                      onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                      color={question.correctAnswer === optIndex ? 'success' : 'primary'}
                    />
                    <Button
                      variant={question.correctAnswer === optIndex ? 'contained' : 'outlined'}
                      color="success"
                      size="small"
                      sx={{ 
                        ml: 2,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                      onClick={() => handleQuestionChange(qIndex, 'correctAnswer', optIndex)}
                    >
                      {question.correctAnswer === optIndex ? 'Correct ✓' : 'Mark Correct'}
                    </Button>
                  </Box>
                ))}
              </QuestionCard>
            ))}

            <SecondaryButton
              startIcon={<AddIcon />}
              onClick={addQuestion}
              sx={{ mt: 3 }}
              fullWidth
            >
              Add Another Question
            </SecondaryButton>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <SecondaryButton
                onClick={() => navigate('/teacher/my-quizzes')}
                fullWidth
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                fullWidth
                disabled={saving}
              >
                {saving ? 'Updating Quiz...' : 'Update Quiz'}
              </PrimaryButton>
            </Box>
          </form>
        </MainCard>
      </Container>
    </GradientBackground>
  );
}