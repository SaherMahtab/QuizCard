import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { styled, keyframes, useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import DarkModeToggle from '../../components/Common/DarkModeToggle';

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Background
const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
      : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
}));

// App Bar
const GlassAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(20px)'
}));

// Card components
const MainCard = styled(Paper)({
  marginTop: 16,
  padding: 24,
  borderRadius: 12,
  animation: `${fadeInUp} 0.6s ease-out`
});

//QuestionCard
const QuestionCard = styled(Paper)({
  padding: 16,
  borderRadius: 12,
  marginTop: 12
});

//Styled TextField
const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px'
  }
});

// Main Component
export default function CreateQuiz() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const theme = useTheme();

  //empty question template
  const emptyQuestion = () => ({
    questionText: '',
    type: 'single',
    options: ['', '', '', ''],
    correctAnswer: 0,
    correctAnswers: []
  });

  //Quiz state
  const [quizData, setQuizData] = useState({
    title: '',
    subject: '',
    timePerQuestion: 10,
    questions: [emptyQuestion()]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Handler for quiz detail changes
  const handleQuizChange = (field, value) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  // Handler for question changes
  const handleQuestionChange = (index, field, value) => {
    setQuizData(prev => {
      const q = [...prev.questions];
      q[index] = { ...q[index], [field]: value };
      return { ...prev, questions: q };
    });
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    setQuizData(prev => {
      const questions = [...prev.questions];
      const opts = [...questions[qIndex].options];
      opts[optIndex] = value;
      questions[qIndex].options = opts;
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setQuizData(prev => ({ ...prev, questions: [...prev.questions, emptyQuestion()] }));
  };

  const deleteQuestion = (index) => {
    setQuizData(prev => {
      if (prev.questions.length <= 1) return prev;
      return { ...prev, questions: prev.questions.filter((_, i) => i !== index) };
    });
  };

  const toggleMultiAnswer = (qIndex, optIndex) => {
    setQuizData(prev => {
      const questions = [...prev.questions];
      const q = { ...questions[qIndex] };
      const arr = [...(q.correctAnswers || [])];
      const pos = arr.indexOf(optIndex);

      pos === -1 ? arr.push(optIndex) : arr.splice(pos, 1);
      q.correctAnswers = arr;
      questions[qIndex] = q;

      return { ...prev, questions };
    });
  };

  const setSingleCorrect = (qIndex, optIndex) => {
    handleQuestionChange(qIndex, 'correctAnswer', optIndex);
    setQuizData(prev => {
      const questions = [...prev.questions];
      questions[qIndex].correctAnswers = [];
      return { ...prev, questions };
    });
  };

  const setTrueFalseCorrect = (qIndex, val) => {
    handleQuestionChange(qIndex, 'correctAnswer', val ? 'True' : 'False');
    setQuizData(prev => {
      const questions = [...prev.questions];
      questions[qIndex].correctAnswers = [];
      return { ...prev, questions };
    });
  };

  const handleTypeChange = (qIndex, newType) => {
    setQuizData(prev => {
      const questions = [...prev.questions];
      const q = { ...questions[qIndex] };

      q.type = newType;

      if (newType === 'truefalse') {
        q.options = ['True', 'False'];
        q.correctAnswer = 'True';
        q.correctAnswers = [];
      } else if (newType === 'multiple') {
        q.options = q.options.length ? q.options : ['', '', '', ''];
        q.correctAnswers = [];
        q.correctAnswer = null;
      } else {
        q.options = q.options.slice(0, 4);
        q.correctAnswer = 0;
        q.correctAnswers = [];
      }

      questions[qIndex] = q;
      return { ...prev, questions };
    });
  };

  const validateQuiz = () => {
    if (!quizData.title.trim() || !quizData.subject.trim()) {
      setError('Please fill in quiz title and subject');
      return false;
    }

    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];

      if (!q.questionText.trim()) {
        setError(`Question ${i + 1} cannot be empty.`);
        return false;
      }

      if (q.options.some(opt => !opt.trim())) {
        setError(`All options in Question ${i + 1} must be filled.`);
        return false;
      }

      if (q.type === 'multiple' && q.correctAnswers.length === 0) {
        setError(`Question ${i + 1}: pick at least one correct option.`);
        return false;
      }

      if (q.type === 'single' && (q.correctAnswer === null || q.correctAnswer === undefined)) {
        setError(`Question ${i + 1}: pick the correct option.`);
        return false;
      }
    }

    return true;
  };

  const generateQuizCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateQuiz()) return;

    try {
      setLoading(true);

      const quizCode = generateQuizCode();
      const payload = {
        title: quizData.title,
        subject: quizData.subject,
        teacherId: currentUser.uid,
        quizCode,
        timePerQuestion: Number(quizData.timePerQuestion),
        questions: quizData.questions,
        createdAt: new Date().toISOString(),
        isPublic: true
      };

      await addDoc(collection(db, 'quizzes'), payload);

      setSuccess(true);
      setTimeout(() => navigate('/teacher/dashboard'), 1500);
    } catch (err) {
      setError('Failed to create quiz: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <GradientBackground>
        <GlassAppBar position="static">
          <Toolbar>
            <IconButton edge="start" onClick={() => navigate('/teacher/dashboard')} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <SchoolIcon sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Create New Quiz</Typography>
            <DarkModeToggle />
          </Toolbar>
        </GlassAppBar>

        <Container maxWidth="md" sx={{ py: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Quiz created! Redirecting...</Alert>}

          <MainCard>
            <form onSubmit={handleSubmit}>
              <Typography variant="h5">Quiz Details</Typography>

              <StyledTextField
                  fullWidth required label="Quiz Title"
                  value={quizData.title}
                  onChange={(e) => handleQuizChange('title', e.target.value)}
                  sx={{ mt: 2 }}
              />

              <StyledTextField
                  fullWidth required label="Subject"
                  value={quizData.subject}
                  onChange={(e) => handleQuizChange('subject', e.target.value)}
                  sx={{ mt: 2 }}
              />

              <StyledTextField
                  fullWidth type="number" label="Time per Question (seconds)"
                  value={quizData.timePerQuestion}
                  inputProps={{ min: 5, max: 600 }}
                  onChange={(e) => handleQuizChange('timePerQuestion', e.target.value)}
                  sx={{ mt: 2 }}
              />

              <Divider sx={{ my: 3 }} />

              <Typography variant="h5">Questions</Typography>

              {quizData.questions.map((q, qIndex) => (
                  <QuestionCard key={qIndex}>
                    <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                    >
                      <Typography variant="h6">Question {qIndex + 1}</Typography>

                      <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            zIndex: 5
                          }}
                      >
                        {/* Question Type Selector */}
                        <FormControl
                            size="small"
                            sx={{
                              minWidth: 160,
                              zIndex: 10
                            }}
                        >
                          <InputLabel id={`type-label-${qIndex}`}>Type</InputLabel>
                          <Select
                              labelId={`type-label-${qIndex}`}
                              value={q.type}
                              label="Type"
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleTypeChange(qIndex, e.target.value)}
                              MenuProps={{
                                sx: { zIndex: 2000 }   // dropdown stays above everything
                              }}
                          >
                            <MenuItem value="single">Single Answer</MenuItem>
                            <MenuItem value="multiple">Multiple Select</MenuItem>
                            <MenuItem value="truefalse">True / False</MenuItem>
                          </Select>
                        </FormControl>

                        {/* Delete Button */}
                        {quizData.questions.length > 1 && (
                            <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteQuestion(qIndex);
                                }}
                                sx={{
                                  border: "1px solid",
                                  borderColor: "error.main",
                                  color: "error.main",
                                  borderRadius: "8px",
                                  p: "6px",
                                  zIndex: 10
                                }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                        )}
                      </Box>
                    </Box>

                    <StyledTextField
                        fullWidth required multiline rows={2}
                        label="Question Text"
                        value={q.questionText}
                        onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                        sx={{ mt: 2 }}
                    />

                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Options
                    </Typography>

                    {q.type === 'truefalse' ? (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                              variant={q.correctAnswer === 'True' ? 'contained' : 'outlined'}
                              onClick={() => setTrueFalseCorrect(qIndex, true)}
                          >
                            True
                          </Button>

                          <Button
                              variant={q.correctAnswer === 'False' ? 'contained' : 'outlined'}
                              onClick={() => setTrueFalseCorrect(qIndex, false)}
                          >
                            False
                          </Button>
                        </Box>
                    ) : (
                        <>
                          {q.options.map((opt, optIndex) => (
                              <Box key={optIndex} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <Typography sx={{ mr: 2, minWidth: 90 }}>
                                  Option {optIndex + 1}:
                                </Typography>

                                <StyledTextField
                                    fullWidth
                                    value={opt}
                                    onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                />

                                {q.type === 'multiple' ? (
                                    <Button
                                        variant={q.correctAnswers.includes(optIndex) ? 'contained' : 'outlined'}
                                        sx={{ ml: 2 }}
                                        onClick={() => toggleMultiAnswer(qIndex, optIndex)}
                                    >
                                      {q.correctAnswers.includes(optIndex) ? 'Correct ✓' : 'Mark'}
                                    </Button>
                                ) : (
                                    <Button
                                        variant={q.correctAnswer === optIndex ? 'contained' : 'outlined'}
                                        sx={{ ml: 2 }}
                                        onClick={() => setSingleCorrect(qIndex, optIndex)}
                                    >
                                      {q.correctAnswer === optIndex ? 'Correct ✓' : 'Mark Correct'}
                                    </Button>
                                )}
                              </Box>
                          ))}
                        </>
                    )}
                  </QuestionCard>
              ))}

              <Button startIcon={<AddIcon />} onClick={addQuestion} sx={{ mt: 2 }}>
                Add Another Question
              </Button>

              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button variant="outlined"
                        fullWidth
                        onClick={() => navigate('/teacher/dashboard')}
                >
                  Cancel
                </Button>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Quiz'}
                </Button>
              </Box>
            </form>
          </MainCard>
        </Container>
      </GradientBackground>
  );
}