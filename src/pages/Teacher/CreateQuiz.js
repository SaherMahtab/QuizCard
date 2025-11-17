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
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function CreateQuiz() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [quizData, setQuizData] = useState({
    title: '',
    subject: '',
    timePerQuestion: 10,
    questions: [
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]
  });

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

  const generateQuizCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
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
      setLoading(true);

      const quizCode = generateQuizCode();

      await addDoc(collection(db, 'quizzes'), {
        title: quizData.title,
        subject: quizData.subject,
        teacherId: currentUser.uid,
        quizCode: quizCode,
        timePerQuestion: parseInt(quizData.timePerQuestion),
        questions: quizData.questions,
        createdAt: new Date().toISOString(),
        isPublic: true
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/teacher/dashboard');
      }, 2000);
    } catch (err) {
      setError('Failed to create quiz: ' + err.message);
    }
    setLoading(false);
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
            Create New Quiz
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Quiz created successfully! Redirecting...</Alert>}

        <Paper elevation={3} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {/* Quiz Details */}
            <Typography variant="h5" gutterBottom>
              Quiz Details
            </Typography>

            <TextField
              fullWidth
              required
              label="Quiz Title"
              value={quizData.title}
              onChange={(e) => handleQuizChange('title', e.target.value)}
              sx={{ mt: 2 }}
            />

            <TextField
              fullWidth
              required
              label="Subject"
              value={quizData.subject}
              onChange={(e) => handleQuizChange('subject', e.target.value)}
              sx={{ mt: 2 }}
            />

            <TextField
              fullWidth
              type="number"
              label="Time per Question (seconds)"
              value={quizData.timePerQuestion}
              onChange={(e) => handleQuizChange('timePerQuestion', e.target.value)}
              sx={{ mt: 2 }}
              inputProps={{ min: 5, max: 60 }}
            />

            <Divider sx={{ my: 4 }} />

            {/* Questions */}
            <Typography variant="h5" gutterBottom>
              Questions
            </Typography>

            {quizData.questions.map((question, qIndex) => (
              <Paper key={qIndex} variant="outlined" sx={{ p: 3, mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Question {qIndex + 1}</Typography>
                  {quizData.questions.length > 1 && (
                    <IconButton color="error" onClick={() => deleteQuestion(qIndex)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <TextField
                  fullWidth
                  required
                  label="Question Text"
                  value={question.questionText}
                  onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                  multiline
                  rows={2}
                  sx={{ mt: 2 }}
                />

                <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                  Options:
                </Typography>

                {question.options.map((option, optIndex) => (
                  <Box key={optIndex} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography sx={{ mr: 2, minWidth: 80 }}>
                      Option {optIndex + 1}:
                    </Typography>
                    <TextField
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
                      sx={{ ml: 2 }}
                      onClick={() => handleQuestionChange(qIndex, 'correctAnswer', optIndex)}
                    >
                      {question.correctAnswer === optIndex ? 'Correct ✓' : 'Mark Correct'}
                    </Button>
                  </Box>
                ))}
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addQuestion}
              sx={{ mt: 3 }}
              fullWidth
            >
              Add Another Question
            </Button>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/teacher/dashboard')}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Creating Quiz...' : 'Create Quiz'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </>
  );
}