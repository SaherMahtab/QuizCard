import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Card,
  LinearProgress,
  Chip,
  Paper,
  Fade,
  Tooltip,
  MenuItem,
  Select
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

const shake = keyframes`0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}`;
const cardFlip = keyframes`0%{transform:perspective(1000px)rotateY(0)}50%{transform:perspective(1000px)rotateY(-90deg)}100%{transform:perspective(1000px)rotateY(0)}`;
const fadeIn = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;

const QuizCardContainer = styled(Card)(({ isFlipping }) => ({
  padding: 24,
  minHeight: 460,
  animation: isFlipping ? `${cardFlip} 0.6s ease-in-out` : 'none'
}));

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: theme.palette.mode === 'dark' ? '#0f172a' : '#f0f9ff'
}));

const GlassAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.25)',
  backdropFilter: 'blur(20px)'
}));

const QuestionCard = styled(Paper)(({ theme }) => ({
  padding: 20,
  borderRadius: 12,
  marginBottom: 12
}));

const OptionCard = styled(Paper)(({ selected }) => ({
  padding: 14,
  borderRadius: 12,
  cursor: 'pointer',
  marginBottom: 10,
  background: selected ? 'linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)' : 'white',
  color: selected ? 'white' : 'inherit'
}));

const TimerChip = styled(Chip)(({ warning }) => ({
  fontWeight: 600,
  animation: warning === 'true' ? `${shake} 0.5s infinite` : 'none'
}));

export default function PlayQuiz() {
  const { quizCode } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const theme = useTheme();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // For different types:
  const [selectedSingle, setSelectedSingle] = useState(null); // index
  const [selectedMulti, setSelectedMulti] = useState([]); // array of indices
  const [selectedTF, setSelectedTF] = useState(null); // 'True'|'False'
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCardFlipping, setIsCardFlipping] = useState(false);

  // redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem('redirectAfterLogin', `/student/play/${quizCode}`);
      navigate('/login');
    }
  }, [currentUser, quizCode, navigate]);

  useEffect(() => {
    if (!currentUser) return;
    fetchQuiz();
    // eslint-disable-next-line
  }, [currentUser]);

  useEffect(() => {
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    } else if (timeLeft === 0 && quizStarted && !quizCompleted) {
      handleNextQuestion();
    }
  }, [timeLeft, quizStarted, quizCompleted]); // eslint-disable-line

  const fetchQuiz = async () => {
    try {
      const q = query(collection(db, 'quizzes'), where('quizCode', '==', quizCode.toUpperCase()));
      const qs = await getDocs(q);
      if (qs.empty) {
        alert('Quiz not found');
        return navigate('/student/dashboard');
      }
      const quizDoc = qs.docs[0];
      const data = { id: quizDoc.id, ...quizDoc.data() };
      // ensure field names: questions array expected to have type, options, correctAnswer/correctAnswers
      setQuiz(data);
      setTimeLeft(data.timePerQuestion || 10);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert('Error loading quiz');
      navigate('/student/dashboard');
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(quiz.timePerQuestion || 10);
    setSelectedSingle(null);
    setSelectedMulti([]);
    setSelectedTF(null);
    setAnswers([]);
    setScore(0);
    setCurrentQuestionIndex(0);
  };

  // handlers
  const toggleMulti = (i) => {
    setSelectedMulti(prev => {
      const idx = prev.indexOf(i);
      if (idx === -1) return [...prev, i];
      const cp = [...prev]; cp.splice(idx, 1); return cp;
    });
  };

  const evaluateCurrent = () => {
    const q = quiz.questions[currentQuestionIndex];
    if (!q) return false;
    if (q.type === 'single') {
      const correct = q.correctAnswer;
      return Number(selectedSingle) === Number(correct);
    }
    if (q.type === 'multiple') {
      const correctArr = (q.correctAnswers || []).map(Number).sort();
      const user = [...selectedMulti].map(Number).sort();
      if (correctArr.length !== user.length) return false;
      return correctArr.every((v, i) => v === user[i]);
    }
    if (q.type === 'truefalse') {
      return String(selectedTF) === String(q.correctAnswer);
    }
    // fallback
    return false;
  };

  const handleNextQuestion = () => {
    const q = quiz.questions[currentQuestionIndex];
    // build userAnswer for storing
    let userAnswer = null;
    if (q.type === 'single') userAnswer = selectedSingle;
    else if (q.type === 'multiple') userAnswer = selectedMulti;
    else if (q.type === 'truefalse') userAnswer = selectedTF;

    const isCorrect = evaluateCurrent();

    const answerData = {
      questionIndex: currentQuestionIndex,
      userAnswer,
      correctAnswer: q.type === 'multiple' ? q.correctAnswers : q.correctAnswer,
      isCorrect,
      timeTaken: (quiz.timePerQuestion || 0) - timeLeft
    };

    setAnswers(prev => [...prev, answerData]);

    if (isCorrect) setScore(prev => prev + 1);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setIsCardFlipping(true);
      setTimeout(() => {
        setCurrentQuestionIndex(idx => idx + 1);
        // reset selections
        setSelectedSingle(null);
        setSelectedMulti([]);
        setSelectedTF(null);
        setTimeLeft(quiz.timePerQuestion || 10);
        setIsCardFlipping(false);
      }, 300);
    } else {
      finishQuiz([...answers, answerData], isCorrect ? score + 1 : score);
    }
  };

  const finishQuiz = async (finalAnswers, finalScore) => {
    setQuizCompleted(true);
    try {
      const payload = {
        studentId: currentUser.uid,
        quizId: quiz.id,
        quizTitle: quiz.title,
        score: finalScore,
        totalQuestions: quiz.questions.length,
        answers: finalAnswers,
        completedAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'scores'), payload);
    } catch (err) {
      console.error('Error saving score', err);
    }
  };

  if (loading) return <Box sx={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography>Loading quiz...</Typography></Box>;
  if (!quiz) return null;

  const q = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
      <GradientBackground>
        <GlassAppBar position="static" elevation={0}>
          <Toolbar>
            <QuizIcon sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>{quiz.title}</Typography>
            <DarkModeToggle />
            {quizStarted && !quizCompleted && <TimerChip label={`${timeLeft}s`} warning={timeLeft <= 10 ? 'true' : 'false'} icon={<TimerIcon />} sx={{ ml: 2 }} />}
          </Toolbar>
        </GlassAppBar>

        <Container maxWidth="md" sx={{ py: 4 }}>
          {!quizStarted ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <EmojiEventsIcon sx={{ fontSize: 64, color: theme.palette.primary.main }} />
                <Typography variant="h4" sx={{ mt: 2 }}>{quiz.title}</Typography>
                <Typography sx={{ mt: 1 }}>{quiz.questions.length} Questions • {quiz.timePerQuestion}s each</Typography>
                <Box sx={{ mt: 3 }}>
                  <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={startQuiz}>Start Quiz</Button>
                </Box>
              </Paper>
          ) : quizCompleted ? (
              <Fade in timeout={600}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 72, color: '#22c55e' }} />
                  <Typography variant="h3" sx={{ mt: 2 }}>{score} / {quiz.questions.length}</Typography>
                  <Typography variant="h5" sx={{ mt: 1 }}>{((score / quiz.questions.length) * 100).toFixed(1)}%</Typography>
                  <Box sx={{ mt: 3 }}>
                    <Button variant="contained" onClick={() => navigate('/student/dashboard')}>Dashboard</Button>
                    <Button sx={{ ml: 2 }} variant="outlined" onClick={() => navigate(`/student/leaderboard/${quiz.quizCode}`)}>Leaderboard</Button>
                  </Box>
                </Paper>
              </Fade>
          ) : (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Question {currentQuestionIndex + 1} of {quiz.questions.length}</Typography>
                  <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 6, mt: 1 }} />
                </Box>

                <QuizCardContainer elevation={0} isFlipping={isCardFlipping}>
                  <QuestionCard>
                    <Typography variant="h5" sx={{ textAlign: 'center' }}>{q.questionText}</Typography>
                  </QuestionCard>

                  {/* Render based on type */}
                  {q.type === 'single' && (
                      <Box>
                        {q.options.map((opt, i) => (
                            <OptionCard key={i} selected={selectedSingle === i} onClick={() => setSelectedSingle(i)}>
                              <Typography><strong>{String.fromCharCode(65 + i)}.</strong> {opt}</Typography>
                            </OptionCard>
                        ))}
                      </Box>
                  )}

                  {q.type === 'multiple' && (
                      <Box>
                        {q.options.map((opt, i) => (
                            <OptionCard key={i} selected={selectedMulti.includes(i)} onClick={() => toggleMulti(i)}>
                              <Typography><strong>{String.fromCharCode(65 + i)}.</strong> {opt}</Typography>
                            </OptionCard>
                        ))}
                      </Box>
                  )}

                  {q.type === 'truefalse' && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <OptionCard selected={selectedTF === 'True'} onClick={() => setSelectedTF('True')}><Typography>True</Typography></OptionCard>
                        <OptionCard selected={selectedTF === 'False'} onClick={() => setSelectedTF('False')}><Typography>False</Typography></OptionCard>
                      </Box>
                  )}

                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Tooltip title={
                      q.type === 'single' ? 'Select an answer' :
                          q.type === 'multiple' ? 'Select one or more options' :
                              'Select True or False'}>
                  <span>
                    <Button
                        variant="contained"
                        onClick={handleNextQuestion}
                        disabled={
                            (q.type === 'single' && selectedSingle === null) ||
                            (q.type === 'multiple' && selectedMulti.length === 0) ||
                            (q.type === 'truefalse' && selectedTF === null)
                        }
                    >
                      {currentQuestionIndex < quiz.questions.length - 1 ? 'Next' : 'Finish'}
                    </Button>
                  </span>
                    </Tooltip>
                  </Box>
                </QuizCardContainer>
              </>
          )}
        </Container>
      </GradientBackground>
  );
}