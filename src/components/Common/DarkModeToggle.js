import React, { useContext } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { DarkModeContext } from '../../App';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  marginRight: '8px',
  background: theme.palette.mode === 'dark'
    ? 'rgba(96, 165, 250, 0.1)'
    : 'rgba(59, 130, 246, 0.1)',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? 'rgba(96, 165, 250, 0.2)'
      : 'rgba(59, 130, 246, 0.2)',
    transform: 'scale(1.1) rotate(180deg)',
  },
}));

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

  return (
    <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
      <StyledIconButton onClick={toggleDarkMode} color="inherit">
        {darkMode ? (
          <Brightness7Icon sx={{ color: '#fbbf24' }} />
        ) : (
          <Brightness4Icon sx={{ color: '#1e40af' }} />
        )}
      </StyledIconButton>
    </Tooltip>
  );
}