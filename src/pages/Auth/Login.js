import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Link
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import QuizIcon from '@mui/icons-material/Quiz';
import { useAuth } from '../../contexts/AuthContext';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const LoginGradientBox = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
});

const LoginCard = styled(Paper)({
  padding: '40px',
  borderRadius: '20px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  animation: `${fadeIn} 0.6s ease-out`,
  background: 'white',
  maxWidth: '450px',
  width: '100%',
});

const LoginLogoBox = styled(Box)({
  textAlign: 'center',
  marginBottom: '30px',
  animation: `${float} 3s ease-in-out infinite`,
});

const LoginStyledButton = styled(Button)({
  marginTop: '24px',
  marginBottom: '16px',
  padding: '12px',
  borderRadius: '50px',
  fontSize: '1rem',
  fontWeight: 'bold',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  '&:hover': {
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
  },
  transition: 'all 0.3s ease',
});

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, userRole } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(formData.email, formData.password);

      setTimeout(() => {
        // Check if there's a redirect URL stored
        const redirectTo = localStorage.getItem('redirectAfterLogin');

        if (redirectTo) {
          localStorage.removeItem('redirectAfterLogin');
          navigate(redirectTo);
        } else if (userRole === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }, 500);
    } catch (err) {
      setError('Failed to login: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <LoginGradientBox>
      <Container component="main" maxWidth="xs">
        <LoginCard elevation={3}>
          <LoginLogoBox>
            <QuizIcon sx={{ fontSize: 80, color: '#667eea', mb: 1 }} />
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              QuizCard
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
              Welcome Back! 👋
            </Typography>
          </LoginLogoBox>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              type="email"
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <LoginStyledButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              aria-label={loading ? 'Logging in, please wait' : 'Login to your account'}
              aria-disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </LoginStyledButton>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/signup')}
                  sx={{
                    color: '#667eea',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </form>
        </LoginCard>
      </Container>
    </LoginGradientBox>
  );
}