import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  LinearProgress,
  AppBar,
  Toolbar,
  Chip,
  Fade,
  Zoom
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimerIcon from '@mui/icons-material/Timer';
import QuizIcon from '@mui/icons-material/Quiz';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
`;

const flipIn = keyframes`
  from {
    transform: perspective(400px) rotateY(90deg);
    opacity: 0;
  }
  to {
    transform: perspective(400px) rotateY(0deg);
    opacity: 1;
  }
`;

// Styled Components
const GradientAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}));

const QuizStartCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  color: 'white',
  padding: theme.spacing(5),
  borderRadius: '20px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  animation: `${flipIn} 0.6s ease-out`,
}));

const ResultCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  color: 'white',
  padding: theme.spacing(5),
  borderRadius: '20px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  textAlign: 'center',
  animation: `${flipIn} 0.8s ease-out`,
}));

const QuestionCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: '15px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  animation: `${flipIn} 0.5s ease-out`,
  marginBottom: theme.spacing(3),
}));

const AnswerCard = styled(Card)(({ selected, isanimating }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: '12px',
  border: selected ? '3px solid #667eea' : '2px solid #e0e0e0',
  background: selected
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'white',
  transform: selected ? 'scale(1.05)' : 'scale(1)',
  boxShadow: selected
    ? '0 8px 24px rgba(102, 126, 234, 0.4)'
    : '0 2px 8px rgba(0,0,0,0.1)',
  animation: isanimating === 'true' ? `${pulse} 0.5s ease-in-out` : 'none',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
  },
}));

const TimerChip = styled(Chip)(({ warning }) => ({
  fontWeight: 'bold',
  fontSize: '1.1rem',
  padding: '20px 10px',
  animation: warning === 'true' ? `${shake} 0.5s infinite` : 'none',
  background: warning === 'true'
    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  color: 'white',
}));

export default function PlayQuiz() {
  const { quizCode } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [animatingCard, setAnimatingCard] = useState(null);

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizStarted && !quizCompleted) {
      handleNextQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, quizStarted, quizCompleted]);

  const fetchQuiz = async () => {
    try {
      const q = query(
        collection(db, 'quizzes'),
        where('quizCode', '==', quizCode.toUpperCase())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('Quiz not found!');
        navigate('/student/dashboard');
        return;
      }

      const quizData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
      setQuiz(quizData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert('Error loading quiz');
      navigate('/student/dashboard');
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(quiz.timePerQuestion);
  };

  const handleAnswerSelect = (optionIndex) => {
    setSelectedAnswer(optionIndex);
    setAnimatingCard(optionIndex);
    setTimeout(() => setAnimatingCard(null), 500);
  };

  const handleNextQuestion = () => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const answerData = {
      questionIndex: currentQuestionIndex,
      selectedAnswer: selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: isCorrect,
      timeTaken: quiz.timePerQuestion - timeLeft
    };

    setAnswers([...answers, answerData]);

    if (isCorrect) {
      setScore(score + 1);
    }

    // Move to next question or finish
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setTimeLeft(quiz.timePerQuestion);
    } else {
      finishQuiz([...answers, answerData], isCorrect ? score + 1 : score);
    }
  };

  const finishQuiz = async (finalAnswers, finalScore) => {
    setQuizCompleted(true);

    try {
      await addDoc(collection(db, 'scores'), {
        studentId: currentUser.uid,
        quizId: quiz.id,
        quizTitle: quiz.title,
        score: finalScore,
        totalQuestions: quiz.questions.length,
        answers: finalAnswers,
        completedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading quiz...</Typography>
      </Box>
    );
  }

  if (!quiz) {
    return null;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <>
      <GradientAppBar position="static">
        <Toolbar>
          <QuizIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {quiz.title}
          </Typography>
          {quizStarted && !quizCompleted && (
            <TimerChip
              icon={<TimerIcon />}
              label={`${timeLeft}s`}
              warning={timeLeft <= 3 ? 'true' : 'false'}
            />
          )}
        </Toolbar>
      </GradientAppBar>

      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="md">
          {!quizStarted ? (
            <Fade in timeout={800}>
              <QuizStartCard elevation={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <EmojiEventsIcon sx={{ fontSize: 80, mb: 2 }} />
                  <Typography variant="h3" gutterBottom fontWeight="bold">
                    {quiz.title}
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                    {quiz.subject}
                  </Typography>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      📝 {quiz.questions.length} Questions
                    </Typography>
                    <Typography variant="h6">
                      ⏱️ {quiz.timePerQuestion} seconds per question
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={startQuiz}
                    sx={{
                      px: 6,
                      py: 2,
                      fontSize: '1.2rem',
                      borderRadius: '50px',
                      background: 'white',
                      color: '#667eea',
                      fontWeight: 'bold',
                      '&:hover': {
                        background: '#f5f5f5',
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    Start Quiz 🚀
                  </Button>
                </Box>
              </QuizStartCard>
            </Fade>
          ) : quizCompleted ? (
            <Zoom in timeout={800}>
              <ResultCard elevation={3}>
                <EmojiEventsIcon sx={{ fontSize: 100, mb: 2 }} />
                <Typography variant="h3" gutterBottom fontWeight="bold">
                  Quiz Completed! 🎉
                </Typography>
                <Typography variant="h2" sx={{ my: 3, fontWeight: 'bold' }}>
                  {score} / {quiz.questions.length}
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {((score / quiz.questions.length) * 100).toFixed(1)}%
                </Typography>
                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/student/dashboard')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: '50px',
                      background: 'white',
                      color: '#4facfe',
                      fontWeight: 'bold',
                      '&:hover': { background: '#f5f5f5' },
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate(`/student/leaderboard/${quizCode}`)}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: '50px',
                      borderColor: 'white',
                      color: 'white',
                      fontWeight: 'bold',
                      '&:hover': { borderColor: 'white', background: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    View Leaderboard
                  </Button>
                </Box>
              </ResultCard>
            </Zoom>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    },
                  }}
                />
              </Box>

              <QuestionCard elevation={3}>
                <Typography variant="h4" fontWeight="bold">
                  {currentQuestion.questionText}
                </Typography>
              </QuestionCard>

              <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 2,
                  '@media (max-width: 600px)': {
                    gridTemplateColumns: '1fr'
                  }
                }}>
                  {currentQuestion.options.map((option, index) => (
                    <Fade in timeout={300 + index * 100} key={index}>
                      <Box>
                        <AnswerCard
                          selected={selectedAnswer === index}
                          isanimating={animatingCard === index ? 'true' : 'false'}
                          onClick={() => handleAnswerSelect(index)}
                        >
                          <CardContent sx={{ display: 'flex', alignItems: 'center', padding: '24px !important', minHeight: '80px' }}>
                            <Typography
                              variant="h6"
                              sx={{
                                color: selectedAnswer === index ? 'white' : '#333',
                                fontWeight: selectedAnswer === index ? 'bold' : 'normal',
                                wordBreak: 'break-word',
                                width: '100%',
                              }}
                            >
                              {String.fromCharCode(65 + index)}. {option}
                            </Typography>
                          </CardContent>
                        </AnswerCard>
                      </Box>
                    </Fade>
                  ))}
                </Box>
              </Box>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === null}
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: '1.1rem',
                    borderRadius: '50px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    },
                    '&:disabled': {
                      background: '#ccc',
                    },
                  }}
                >
                  {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question →' : 'Finish Quiz ✓'}
                </Button>
              </Box>
            </>
          )}
        </Container>
      </Box>
    </>
  );
}