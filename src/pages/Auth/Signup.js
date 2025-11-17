import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  FormLabel,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Link
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
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

const GradientBox = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
});

const SignupCard = styled(Paper)({
  padding: '40px',
  borderRadius: '20px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  animation: `${fadeIn} 0.6s ease-out`,
  background: 'white',
  maxWidth: '450px',
  width: '100%',
});

const LogoBox = styled(Box)({
  textAlign: 'center',
  marginBottom: '30px',
  animation: `${float} 3s ease-in-out infinite`,
});

const StyledButton = styled(Button)({
  marginTop: '24px',
  marginBottom: '16px',
  padding: '12px',
  borderRadius: '50px',
  fontSize: '1rem',
  fontWeight: 'bold',
  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  '&:hover': {
    background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(245, 87, 108, 0.4)',
  },
  transition: 'all 0.3s ease',
});

const RoleCard = styled(Box)(({ selected }) => ({
  padding: '16px',
  borderRadius: '12px',
  border: selected ? '3px solid #f5576c' : '2px solid #e0e0e0',
  background: selected ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'white',
  color: selected ? 'white' : '#333',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}));

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      await signup(formData.email, formData.password, formData.name, formData.role);

      if (formData.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError('Failed to create account: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <GradientBox>
      <Container component="main" maxWidth="xs">
        <SignupCard elevation={3}>
          <LogoBox>
            <QuizIcon sx={{ fontSize: 80, color: '#f5576c', mb: 1 }} />
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              QuizCard
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
              Create Your Account 🚀
            </Typography>
          </LogoBox>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              name="email"
              autoComplete="email"
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
              autoComplete="new-password"
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
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ mt: 3, mb: 2 }}>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold' }}>
                I am a:
              </FormLabel>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <RoleCard
                  selected={formData.role === 'student'}
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                  sx={{ flex: 1 }}
                >
                  <SchoolIcon sx={{ fontSize: 30 }} />
                  <Typography variant="body1" fontWeight="bold">
                    Student
                  </Typography>
                </RoleCard>
                <RoleCard
                  selected={formData.role === 'teacher'}
                  onClick={() => setFormData({ ...formData, role: 'teacher' })}
                  sx={{ flex: 1 }}
                >
                  <PersonIcon sx={{ fontSize: 30 }} />
                  <Typography variant="body1" fontWeight="bold">
                    Teacher
                  </Typography>
                </RoleCard>
              </Box>
            </Box>

            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </StyledButton>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: '#f5576c',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Login
                </Link>
              </Typography>
            </Box>
          </form>
        </SignupCard>
      </Container>
    </GradientBox>
  );
}