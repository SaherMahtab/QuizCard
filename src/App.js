import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';

// Auth Pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';

// Teacher Pages
import TeacherDashboard from './pages/Teacher/Dashboard';
import CreateQuiz from './pages/Teacher/CreateQuiz';
import MyQuizzes from './pages/Teacher/MyQuizzes';
import EditQuiz from './pages/Teacher/EditQuiz';
import QuizAnalytics from './pages/Teacher/QuizAnalytics';

// Student Pages
import StudentDashboard from './pages/Student/Dashboard';
import PlayQuiz from './pages/Student/PlayQuiz';
import ScoreHistory from './pages/Student/ScoreHistory';
import Leaderboard from './pages/Student/Leaderboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00897b', // Teal color
    },
    secondary: {
      main: '#0277bd', // Blue color
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Teacher Routes */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute role="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/create-quiz"
              element={
                <ProtectedRoute role="teacher">
                  <CreateQuiz />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/my-quizzes"
              element={
                <ProtectedRoute role="teacher">
                  <MyQuizzes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/edit-quiz/:quizId"
              element={
                <ProtectedRoute role="teacher">
                  <EditQuiz />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/quiz-analytics/:quizId"
              element={
                <ProtectedRoute role="teacher">
                  <QuizAnalytics />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/play/:quizCode"
              element={
                <ProtectedRoute role="student">
                  <PlayQuiz />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/score-history"
              element={
                <ProtectedRoute role="student">
                  <ScoreHistory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/leaderboard/:quizCode"
              element={
                <ProtectedRoute role="student">
                  <Leaderboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;