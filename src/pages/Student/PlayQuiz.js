import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  LinearProgress,
  AppBar,
  Toolbar,
  Chip,
  Fade
} from '@mui/material';
import { styled, keyframes, useTheme } from '@mui/material/styles';
import {
  EmojiEvents as EmojiEventsIcon,
  Timer as TimerIcon,
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import DarkModeToggle from '../../components/Common/DarkModeToggle';

// Animations (reduced intensity)
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
`;

const cardFlip = keyframes`
  0% {
    transform: perspective(1000px) rotateY(0deg);
  }
  50% {
    transform: perspective(1000px) rotateY(-90deg);
  }
  100% {
    transform: perspective(1000px) rotateY(0deg);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Main quiz card container
const QuizCardContainer = styled(Card)(({ theme, isFlipping }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(30, 41, 59, 0.7)'
    : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(96, 165, 250, 0.3)'
    : '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
    : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  padding: '32px',
  minHeight: '600px',
  display: 'flex',
  flexDirection: 'column',
  animation: isFlipping ? `${cardFlip} 0.6s ease-in-out` : 'none',
  transformStyle: 'preserve-3d',
  position: 'relative',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? '0 25px 30px -5px rgba(0, 0, 0, 0.7)'
      : '0 25px 30px -5px rgba(0, 0, 0, 0.15)',
  },
  transition: 'all 0.3s ease'
}));

// Styled Components
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
      ? `radial-gradient(circle at 20% 20%, rgba(96, 165, 250, 0.15) 0%, transparent 50%),
         radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`
      : `radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
         radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)`,
    pointerEvents: 'none',
  }
}));

const GlassAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(30, 41, 59, 0.8)'
    : 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(20px)',
  borderBottom: theme.palette.mode === 'dark'
    ? '1px solid rgba(96, 165, 250, 0.2)'
    : '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.5)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
}));

const QuizStartCard = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(30, 41, 59, 0.6)'
    : 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(20px)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(96, 165, 250, 0.2)'
    : '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.5)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  animation: `${fadeIn} 0.6s ease-out`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 20px 40px rgba(0, 0, 0, 0.7)'
      : '0 20px 40px rgba(0, 0, 0, 0.15)',
  }
}));

const ResultCard = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(30, 41, 59, 0.6)'
    : 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(20px)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(96, 165, 250, 0.2)'
    : '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.5)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
  animation: `${fadeIn} 0.6s ease-out`,
}));

const QuestionCard = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(51, 65, 85, 0.6)'
    : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
  border: theme.palette.mode === 'dark'
    ? '2px solid rgba(96, 165, 250, 0.2)'
    : '2px solid rgba(59, 130, 246, 0.1)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  '& h4': {
    color: theme.palette.text.primary,
    lineHeight: 1.4,
    fontWeight: '600'
  }
}));

const OptionCard = styled(Paper)(({ selected, theme }) => ({
  background: selected
    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    : (theme.palette.mode === 'dark'
      ? 'rgba(51, 65, 85, 0.6)'
      : 'rgba(255, 255, 255, 0.9)'),
  borderRadius: '16px',
  padding: '20px',
  border: selected
    ? '2px solid #1d4ed8'
    : (theme.palette.mode === 'dark'
      ? '2px solid rgba(96, 165, 250, 0.3)'
      : '2px solid rgba(59, 130, 246, 0.2)'),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  minHeight: '80px',
  display: 'flex',
  alignItems: 'center',
  boxShadow: selected
    ? '0 8px 25px -5px rgba(59, 130, 246, 0.3)'
    : (theme.palette.mode === 'dark'
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: selected
      ? '0 12px 30px -5px rgba(59, 130, 246, 0.4)'
      : (theme.palette.mode === 'dark'
        ? '0 8px 25px -5px rgba(59, 130, 246, 0.25)'
        : '0 8px 25px -5px rgba(59, 130, 246, 0.15)'),
    borderColor: '#3b82f6'
  },
  '& .option-text': {
    color: selected ? 'white' : theme.palette.text.primary,
    fontWeight: selected ? '600' : '500',
    fontSize: '1.1rem',
    width: '100%'
  }
}));

const TimerChip = styled(Chip)(({ warning }) => ({
  fontWeight: '600',
  fontSize: '1.1rem',
  padding: '20px 10px',
  animation: warning === 'true' ? `${shake} 0.5s infinite` : 'none',
  background: warning === 'true'
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  color: 'white',
  border: '2px solid rgba(255, 255, 255, 0.3)',
}));

const StartButton = styled(Button)({
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  borderRadius: '12px',
  padding: '12px 32px',
  color: 'white',
  fontWeight: '600',
  textTransform: 'none',
  fontSize: '1.1rem',
  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
  border: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
  }
});

export default function PlayQuiz() {
  const { quizCode } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const theme = useTheme();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCardFlipping, setIsCardFlipping] = useState(false);

  // Redirect to login if not authenticated, storing the quiz code
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem('redirectAfterLogin', `/student/play/${quizCode}`);
      navigate('/login');
    }
  }, [currentUser, quizCode, navigate]);

  useEffect(() => {
    if (!currentUser) return; // Add this check
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); // Add currentUser as dependency

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
    if (!currentUser) return;

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

      const quizDoc = querySnapshot.docs[0];
      const quizData = { id: quizDoc.id, ...quizDoc.data() };

      const scoreQuery = query(
        collection(db, 'scores'),
        where('studentId', '==', currentUser.uid),
        where('quizId', '==', quizData.id)
      );
      const scoreSnapshot = await getDocs(scoreQuery);

      if (!scoreSnapshot.empty) {
        alert('You have already attempted this quiz. Each student can attempt a quiz only once.');
        navigate('/student/dashboard');
        return;
      }

      setQuiz(quizData);
      setTimeLeft(quizData.timeLimit * 60);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert('Error loading quiz. Please try again.');
      navigate('/student/dashboard');
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(quiz.timePerQuestion);
  };

  const handleAnswerSelect = (optionIndex) => {
    setSelectedAnswer(optionIndex);
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

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setIsCardFlipping(true);

      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setTimeLeft(quiz.timePerQuestion);
        setIsCardFlipping(false);
      }, 300);
    } else {
      finishQuiz([...answers, answerData], isCorrect ? score + 1 : score);
    }
  };

  const finishQuiz = async (finalAnswers, finalScore) => {
    setQuizCompleted(true);

    try {
      const scoreData = {
        studentId: currentUser.uid,
        quizId: quiz.id,
        quizTitle: quiz.title,
        score: finalScore,
        totalQuestions: quiz.questions.length,
        answers: finalAnswers,
        completedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'scores'), scoreData);
      console.log('Score saved successfully with ID:', docRef.id);
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
    <GradientBackground>
      <GlassAppBar position="static" elevation={0}>
        <Toolbar>
          <QuizIcon sx={{ mr: 2, color: theme.palette.primary.main, fontSize: 28 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, color: theme.palette.text.primary, fontWeight: '600' }}>
            {quiz.title}
          </Typography>
          <DarkModeToggle />
          {quizStarted && !quizCompleted && (
            <TimerChip
              icon={<TimerIcon />}
              label={`${timeLeft}s`}
              warning={timeLeft <= 10 ? 'true' : 'false'}
              sx={{ ml: 2 }}
            />
          )}
        </Toolbar>
      </GlassAppBar>

      <Container maxWidth="md" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {!quizStarted ? (
          <QuizStartCard sx={{ p: 5 }}>
            <Box sx={{ textAlign: 'center' }}>
              <EmojiEventsIcon sx={{ fontSize: 80, mb: 2, color: theme.palette.primary.main }} />
              <Typography
                variant="h3"
                gutterBottom
                sx={{
                  fontWeight: '700',
                  color: theme.palette.text.primary,
                  mb: 2
                }}
              >
                {quiz.title}
              </Typography>
              <Typography variant="h5" sx={{ mb: 3, color: theme.palette.text.secondary, fontWeight: '500' }}>
                📚 {quiz.subject}
              </Typography>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 1, color: theme.palette.text.primary, fontWeight: '600' }}>
                  📝 {quiz.questions.length} Questions
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: '600' }}>
                  ⏱️ {quiz.timePerQuestion} seconds per question
                </Typography>
              </Box>
              <StartButton
                variant="contained"
                size="large"
                onClick={startQuiz}
                startIcon={<PlayArrowIcon />}
              >
                Start Quiz 🚀
              </StartButton>
            </Box>
          </QuizStartCard>
        ) : quizCompleted ? (
          <Fade in timeout={600}>
            <ResultCard sx={{ p: 5, textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 100, mb: 2, color: '#22c55e' }} />
              <Typography
                variant="h3"
                gutterBottom
                sx={{
                  fontWeight: '700',
                  color: theme.palette.text.primary
                }}
              >
                Quiz Completed! 🎉
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  my: 3,
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                {score} / {quiz.questions.length}
              </Typography>
              <Typography variant="h4" gutterBottom sx={{ color: theme.palette.text.secondary, fontWeight: '500' }}>
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
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.3s ease'
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
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    fontWeight: 'bold',
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      background: 'rgba(59, 130, 246, 0.1)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  View Leaderboard
                </Button>
              </Box>
            </ResultCard>
          </Fade>
        ) : (
          <>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', color: theme.palette.text.primary }}>
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(96, 165, 250, 0.2)'
                    : 'rgba(59, 130, 246, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
                    borderRadius: 6,
                  },
                }}
              />
            </Box>

            <QuizCardContainer elevation={0} isFlipping={isCardFlipping}>
              <QuestionCard elevation={0}>
                <Typography variant="h4" sx={{ fontWeight: '600', textAlign: 'center', mb: 2 }}>
                  {currentQuestion.questionText}
                </Typography>
              </QuestionCard>

              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 3,
                flex: 1
              }}>
                {currentQuestion.options.map((option, index) => (
                  <OptionCard
                    key={`${currentQuestionIndex}-${index}`}
                    selected={selectedAnswer === index}
                    onClick={() => handleAnswerSelect(index)}
                    elevation={0}
                  >
                    <Typography className="option-text">
                      <Box component="span" sx={{
                        fontWeight: '700',
                        mr: 2,
                        fontSize: '1.2rem',
                        color: selectedAnswer === index
                          ? 'rgba(255,255,255,0.9)'
                          : theme.palette.primary.main
                      }}>
                        {String.fromCharCode(65 + index)}.
                      </Box>
                      {option}
                    </Typography>
                  </OptionCard>
                ))}
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
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                      transform: 'translateY(-1px)'
                    },
                    '&:disabled': {
                      background: '#9ca3af',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question →' : 'Finish Quiz ✓'}
                </Button>
              </Box>
            </QuizCardContainer>
          </>
        )}
      </Container>
    </GradientBackground>
  );
}