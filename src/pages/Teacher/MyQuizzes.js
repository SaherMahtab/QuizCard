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
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import { styled, keyframes, useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QuizIcon from '@mui/icons-material/Quiz';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import DarkModeToggle from '../../components/Common/DarkModeToggle';
import { QRCodeCanvas } from 'qrcode.react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';

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

// Styled Components with Dark Mode Support
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
      ? `radial-gradient(circle at 20% 80%, rgba(96, 165, 250, 0.15) 0%, transparent 50%),
         radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`
      : `radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
         radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.08) 0%, transparent 50%)`,
    pointerEvents: 'none',
  }
}));

const GlassAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(30, 41, 59, 0.8)'
    : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderBottom: theme.palette.mode === 'dark'
    ? '1px solid rgba(96, 165, 250, 0.2)'
    : '1px solid rgba(59, 130, 246, 0.1)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.5)'
    : '0 4px 20px rgba(59, 130, 246, 0.08)',
  transition: 'all 0.3s ease',
}));

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

const EmptyStateCard = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(30, 41, 59, 0.6)'
    : 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(96, 165, 250, 0.2)'
    : '1px solid rgba(59, 130, 246, 0.1)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 10px 25px rgba(0, 0, 0, 0.5)'
    : '0 10px 25px rgba(59, 130, 246, 0.1)',
  padding: '48px',
  textAlign: 'center',
  animation: `${fadeInUp} 0.8s ease-out`,
}));

const QuizCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(30, 41, 59, 0.6)'
    : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(96, 165, 250, 0.2)'
    : '1px solid rgba(59, 130, 246, 0.1)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 20px rgba(0, 0, 0, 0.5)'
    : '0 8px 20px rgba(59, 130, 246, 0.08)',
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
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(96, 165, 250, 0.03) 100%)',
    opacity: 0,
    transition: 'opacity 0.4s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 20px 40px rgba(96, 165, 250, 0.3)'
      : '0 20px 40px rgba(59, 130, 246, 0.2)',
    '&::before': {
      opacity: 1,
    },
    '& .quiz-icon': {
      animation: `${float} 2s infinite`,
    }
  }
}));

const QuizCodeBox = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)'
    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(96, 165, 250, 0.1) 100%)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(96, 165, 250, 0.3)'
    : '1px solid rgba(59, 130, 246, 0.2)',
  borderRadius: '12px',
  padding: '8px 16px',
  marginTop: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)'
      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(96, 165, 250, 0.15) 100%)',
    transform: 'scale(1.02)',
  }
}));

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

const PrimaryButton = styled(ActionButton)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.1)',
  color: theme.palette.mode === 'dark' ? '#93c5fd' : '#1e40af',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.3)'
      : 'rgba(59, 130, 246, 0.2)',
    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
  }
}));

const EditButton = styled(ActionButton)({
  color: '#059669',
  background: 'rgba(5, 150, 105, 0.1)',
  border: '1px solid rgba(5, 150, 105, 0.2)',
  '&:hover': {
    background: 'rgba(5, 150, 105, 0.2)',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
  }
});

const AnalyticsButton = styled(ActionButton)({
  color: '#7c3aed',
  background: 'rgba(124, 58, 237, 0.1)',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  '&:hover': {
    background: 'rgba(124, 58, 237, 0.2)',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
  }
});

const DeleteButton = styled(ActionButton)({
  color: '#ef4444',
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  '&:hover': {
    background: 'rgba(239, 68, 68, 0.2)',
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

const SecondaryButton = styled(ActionButton)({
  color: '#6b7280',
  background: 'rgba(107, 114, 128, 0.1)',
  border: '1px solid rgba(107, 114, 128, 0.2)',
  '&:hover': {
    background: 'rgba(107, 114, 128, 0.2)',
    transform: 'translateY(-2px)',
  }
});

export default function MyQuizzes() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [copySnackbar, setCopySnackbar] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedQuizCode, setSelectedQuizCode] = useState('');

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

      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      setDeleteLoading(null);
      alert('Quiz deleted successfully!');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz: ' + error.message);
      setDeleteLoading(null);
    }
  };

  const handleShowQR = (quizCode) => {
    setSelectedQuizCode(quizCode);
    setQrDialogOpen(true);
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('qr-canvas');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `quiz-${selectedQuizCode}-qr.png`;
    link.href = url;
    link.click();
  };

  return (
    <GradientBackground>
      <GlassAppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate('/teacher/dashboard')}
            sx={{
              color: theme.palette.mode === 'dark' ? '#93c5fd' : '#1e40af',
              background: theme.palette.mode === 'dark'
                ? 'rgba(59, 130, 246, 0.15)'
                : 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              '&:hover': {
                background: theme.palette.mode === 'dark'
                  ? 'rgba(59, 130, 246, 0.25)'
                  : 'rgba(59, 130, 246, 0.2)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <SchoolIcon sx={{ mx: 2, color: theme.palette.primary.main, fontSize: 28 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, color: theme.palette.text.primary, fontWeight: '600' }}>
            My Quizzes
          </Typography>
          <DarkModeToggle />
          <PrimaryButton
            startIcon={<AddIcon />}
            onClick={() => navigate('/teacher/create-quiz')}
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
            <Typography variant="h5" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: '600' }}>
              No quizzes created yet
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
              Create your first quiz to get started with engaging your students
            </Typography>
            <PrimaryButton
              startIcon={<AddIcon />}
              onClick={() => navigate('/teacher/create-quiz')}
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                }
              }}
            >
              Create Your First Quiz
            </PrimaryButton>
          </EmptyStateCard>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {quizzes.map((quiz, index) => (
              <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                <QuizCard sx={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <QuizIcon className="quiz-icon" sx={{ fontSize: 32, color: '#3b82f6', mr: 1.5 }} />
                      <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: '600', mb: 0 }}>
                        {quiz.title}
                      </Typography>
                    </Box>

                    <StyledChip
                      label={quiz.subject}
                      size="small"
                      sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {quiz.questions.length} Questions
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {quiz.timePerQuestion}s each
                      </Typography>
                    </Box>

                    <QuizCodeBox>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#000000', fontWeight: '600' }}>
                          Quiz Code: {quiz.quizCode}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Show QR Code" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleShowQR(quiz.quizCode)}
                            aria-label={`Show QR code for quiz ${quiz.title}`}
                            sx={{
                              color: '#7c3aed',
                              '&:hover': {
                                background: 'rgba(124, 58, 237, 0.1)',
                              }
                            }}
                          >
                            <QrCodeIcon fontSize="small" />
                          </IconButton>
                          </Tooltip>

                          <Tooltip title="Copy Quiz Code" arrow>
                          <IconButton
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(quiz.quizCode);
                              setCopySnackbar(true);
                            }}
                            aria-label={`Copy quiz code ${quiz.quizCode}`}
                            sx={{
                              color: '#3b82f6',
                              '&:hover': {
                                background: 'rgba(59, 130, 246, 0.1)',
                              }
                            }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </QuizCodeBox>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0, gap: 1, flexWrap: 'wrap' }}>
                  <Tooltip title="Edit this quiz" arrow>
                    <EditButton
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/teacher/edit-quiz/${quiz.id}`)}
                      aria-label={`Edit quiz: ${quiz.title}`}
                    >
                      Edit
                    </EditButton>
                    </Tooltip>

                    <Tooltip title="View analytics & student scores" arrow>
                    <AnalyticsButton
                      size="small"
                      startIcon={<AnalyticsIcon />}
                      onClick={() => navigate(`/teacher/quiz-analytics/${quiz.id}`)}
                      aria-label={`View analytics for quiz: ${quiz.title}`}
                    >
                      Analytics
                    </AnalyticsButton>
                    </Tooltip>

                    <Tooltip title="Delete this quiz permanently" arrow>
                    <DeleteButton
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                      disabled={deleteLoading === quiz.id}
                      aria-label={`Delete quiz: ${quiz.title}`}
                    >
                      {deleteLoading === quiz.id ? 'Deleting...' : 'Delete'}
                    </DeleteButton>
                    </Tooltip>

                  </CardActions>
                </QuizCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* QR Code Dialog */}
            <Dialog
              open={qrDialogOpen}
              onClose={() => setQrDialogOpen(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle sx={{ textAlign: 'center', fontWeight: '600' }}>
                📱 Scan to Join Quiz
              </DialogTitle>
              <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3
                }}>
                  <QRCodeCanvas
                    id="qr-canvas"
                    value={`${window.location.origin}/student/play/${selectedQuizCode}`}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: '700', color: '#3b82f6', mb: 1 }}>
                      {selectedQuizCode}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666666' }}>
                      Students can scan this QR code to join the quiz
                    </Typography>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
                <PrimaryButton onClick={handleDownloadQR}>
                  Download QR Code
                </PrimaryButton>
                <SecondaryButton onClick={() => setQrDialogOpen(false)}>
                  Close
                </SecondaryButton>
              </DialogActions>
            </Dialog>

            <Snackbar
              open={copySnackbar}
              autoHideDuration={2000}
              onClose={() => setCopySnackbar(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert
                onClose={() => setCopySnackbar(false)}
                severity="success"
                sx={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                  fontWeight: '600'
                }}
              >
                Quiz code copied to clipboard!
              </Alert>
            </Snackbar>
    </GradientBackground>
  );
}