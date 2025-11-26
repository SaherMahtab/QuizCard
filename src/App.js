import React, { useState, useEffect, useMemo } from 'react';
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
import PreviewQuiz from './pages/Teacher/PreviewQuiz';

// Student Pages
import StudentDashboard from './pages/Student/Dashboard';
import PlayQuiz from './pages/Student/PlayQuiz';
import ScoreHistory from './pages/Student/ScoreHistory';
import Leaderboard from './pages/Student/Leaderboard';

// Create a context for dark mode
export const DarkModeContext = React.createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

function App() {
  // Initialize dark mode from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // Save to localStorage whenever darkMode changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Create theme based on darkMode state
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: darkMode ? '#60a5fa' : '#3b82f6',
            light: darkMode ? '#93c5fd' : '#60a5fa',
            dark: darkMode ? '#2563eb' : '#1d4ed8',
          },
          secondary: {
            main: darkMode ? '#a78bfa' : '#7c3aed',
            light: darkMode ? '#c4b5fd' : '#a78bfa',
            dark: darkMode ? '#7c3aed' : '#5b21b6',
          },
          background: {
            default: darkMode ? '#0f172a' : '#f0f9ff',
            paper: darkMode ? '#1e293b' : '#ffffff',
          },
          text: {
            primary: darkMode ? '#f1f5f9' : '#000000',
            secondary: darkMode ? '#cbd5e1' : '#666666',
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                transition: 'background-color 0.3s ease, color 0.3s ease',
              },
            },
          },
        },
      }),
    [darkMode]
  );

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
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

              <Route
                path="/teacher/preview-quiz/:quizId"
                element={
                  <ProtectedRoute role="teacher">
                    <PreviewQuiz />
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
    </DarkModeContext.Provider>
  );
}

export default App;