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
  CircularProgress,
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
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import DarkModeToggle from '../../components/Common/DarkModeToggle';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const MainCard = styled(Paper)(({ theme }) => ({
  marginTop: 16,
  padding: 24,
  borderRadius: 12,
  animation: `${fadeInUp} 0.6s ease-out`
}));

const QuestionCard = styled(Paper)(({ theme }) => ({
  padding: 16,
  borderRadius: 12,
  marginTop: 12
}));

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px'
  }
});

export default function EditQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [quizData, setQuizData] = useState({
    title: '',
    subject: '',
    timePerQuestion: 10,
    questions: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line
  }, []);

  const fetchQuiz = async () => {
    try {
      const docRef = doc(db, 'quizzes', quizId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        alert('Quiz not found');
        return navigate('/teacher/my-quizzes');
      }
      const data = docSnap.data();
      // normalize questions: ensure type and arrays exist
      const questions = (data.questions || []).map(q => ({
        type: q.type || 'single',
        questionText: q.questionText || q.question || '',
        options: q.options || q.options || (q.type === 'truefalse' ? ['True', 'False'] : ['', '', '', '']),
        correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : (q.type === 'truefalse' ? 'True' : 0),
        correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : (q.correctAnswers ? q.correctAnswers : [])
      }));
      setQuizData({
        title: data.title || '',
        subject: data.subject || '',
        timePerQuestion: data.timePerQuestion || 10,
        questions
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert('Error loading quiz');
      navigate('/teacher/my-quizzes');
    }
  };

  const handleQuizChange = (field, value) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    setQuizData(prev => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], [field]: value };
      return { ...prev, questions };
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
    setQuizData(prev => ({ ...prev, questions: [...prev.questions, {
        questionText: '',
        type: 'single',
        options: ['', '', '', ''],
        correctAnswer: 0,
        correctAnswers: []
      }] }));
  };

  const deleteQuestion = (index) => {
    setQuizData(prev => {
      if (prev.questions.length <= 1) return prev;
      const questions = prev.questions.filter((_, i) => i !== index);
      return { ...prev, questions };
    });
  };

  const toggleMultiAnswer = (qIndex, optIndex) => {
    setQuizData(prev => {
      const questions = [...prev.questions];
      const q = { ...questions[qIndex] };
      const arr = Array.isArray(q.correctAnswers) ? [...q.correctAnswers] : [];
      const pos = arr.indexOf(optIndex);
      if (pos === -1) arr.push(optIndex);
      else arr.splice(pos, 1);
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
        q.options = q.options && q.options.length ? q.options : ['', '', '', ''];
        q.correctAnswers = [];
        q.correctAnswer = null;
      } else {
        q.options = q.options && q.options.length ? q.options.slice(0, 4) : ['', '', '', ''];
        q.correctAnswer = 0;
        q.correctAnswers = [];
      }
      questions[qIndex] = q;
      return { ...prev, questions };
    });
  };

  const validateQuiz = () => {
    if (!quizData.title.trim() || !quizData.subject.trim()) {
      setError('Please fill title and subject');
      return false;
    }
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      if (!q.questionText || q.questionText.trim() === '') {
        setError(`Question ${i+1} cannot be empty`);
        return false;
      }
      if (!q.options || q.options.length < 2) {
        setError(`Question ${i+1} must have at least 2 options`);
        return false;
      }
      for (let j=0; j<q.options.length; j++) {
        if (!q.options[j] || q.options[j].trim() === '') {
          setError(`Option ${j+1} of Question ${i+1} cannot be empty`);
          return false;
        }
      }
      if (q.type === 'multiple' && (!q.correctAnswers || q.correctAnswers.length === 0)) {
        setError(`Question ${i+1}: pick at least one correct option`);
        return false;
      }
      if (q.type === 'truefalse' && (q.correctAnswer !== 'True' && q.correctAnswer !== 'False')) {
        setError(`Question ${i+1}: select True or False`);
        return false;
      }
      if (q.type === 'single' && (q.correctAnswer === null || q.correctAnswer === undefined)) {
        setError(`Question ${i+1}: select correct option`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!validateQuiz()) return;

    try {
      setSaving(true);
      const docRef = doc(db, 'quizzes', quizId);
      await updateDoc(docRef, {
        title: quizData.title,
        subject: quizData.subject,
        timePerQuestion: parseInt(quizData.timePerQuestion, 10),
        questions: quizData.questions,
        updatedAt: new Date().toISOString()
      });
      setSuccess(true);
      setTimeout(() => navigate('/teacher/my-quizzes'), 1400);
    } catch (err) {
      setError('Failed to update quiz: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress size={60} /></Box>;
  }

  return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <IconButton edge="start" onClick={() => navigate('/teacher/my-quizzes')} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <SchoolIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Edit Quiz</Typography>
            <DarkModeToggle />
          </Toolbar>
        </AppBar>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Quiz updated successfully! Redirecting...</Alert>}

        <MainCard>
          <form onSubmit={handleSubmit}>
            <Typography variant="h5" gutterBottom>Quiz Details</Typography>

            <StyledTextField
                fullWidth
                label="Quiz Title"
                value={quizData.title}
                onChange={(e) => handleQuizChange('title', e.target.value)}
                sx={{ mt: 2 }}
            />

            <StyledTextField
                fullWidth
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
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" gutterBottom>Questions</Typography>

            {quizData.questions.map((q, qIndex) => (
                <QuestionCard key={qIndex}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Question {qIndex + 1}</Typography>
                    <Box>
                      <FormControl size="small" sx={{ mr: 1, minWidth: 160 }}>
                        <InputLabel id={`type-label-${qIndex}`}>Type</InputLabel>
                        <Select
                            labelId={`type-label-${qIndex}`}
                            value={q.type}
                            label="Type"
                            onChange={(e) => handleTypeChange(qIndex, e.target.value)}
                        >
                          <MenuItem value="single">Single Answer</MenuItem>
                          <MenuItem value="multiple">Multiple Select</MenuItem>
                          <MenuItem value="truefalse">True / False</MenuItem>
                        </Select>
                      </FormControl>

                      {quizData.questions.length > 1 && <IconButton onClick={() => deleteQuestion(qIndex)}><DeleteIcon /></IconButton>}
                    </Box>

                  </Box>

                  <StyledTextField
                      fullWidth
                      label="Question Text"
                      value={q.questionText}
                      onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                      multiline rows={2}
                      sx={{ mt: 2 }}
                  />

                  <Typography variant="subtitle2" sx={{ mt: 2 }}>Options</Typography>

                  {q.type === 'truefalse' ? (
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Button variant={q.correctAnswer === 'True' ? 'contained' : 'outlined'} onClick={() => setTrueFalseCorrect(qIndex, true)}>True</Button>
                        <Button variant={q.correctAnswer === 'False' ? 'contained' : 'outlined'} onClick={() => setTrueFalseCorrect(qIndex, false)}>False</Button>
                      </Box>
                  ) : (
                      <>
                        {q.options.map((opt, optIndex) => (
                            <Box key={optIndex} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Typography sx={{ mr: 2, minWidth: 90 }}>Option {optIndex + 1}:</Typography>
                              <StyledTextField fullWidth value={opt} onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)} />
                              {q.type === 'multiple' ? (
                                  <Button variant={q.correctAnswers && q.correctAnswers.includes(optIndex) ? 'contained' : 'outlined'} sx={{ ml: 2 }} onClick={() => toggleMultiAnswer(qIndex, optIndex)}>
                                    {q.correctAnswers && q.correctAnswers.includes(optIndex) ? 'Correct ✓' : 'Mark'}
                                  </Button>
                              ) : (
                                  <Button variant={q.correctAnswer === optIndex ? 'contained' : 'outlined'} sx={{ ml: 2 }} onClick={() => setSingleCorrect(qIndex, optIndex)}>
                                    {q.correctAnswer === optIndex ? 'Correct ✓' : 'Mark Correct'}
                                  </Button>
                              )}
                            </Box>
                        ))}
                      </>
                  )}
                </QuestionCard>
            ))}

            <Button startIcon={<AddIcon />} onClick={addQuestion} sx={{ mt: 2 }}>Add Another Question</Button>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/teacher/my-quizzes')} fullWidth>Cancel</Button>
              <Button type="submit" variant="contained" fullWidth disabled={saving}>{saving ? 'Updating...' : 'Update Quiz'}</Button>
            </Box>
          </form>
        </MainCard>
      </Container>
  );
}
