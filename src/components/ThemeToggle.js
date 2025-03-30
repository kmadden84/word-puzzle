import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './Game.css';

// This component is no longer used as the toggle is now in the header
const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  // Return null to not render anything
  return null;
};

export default ThemeToggle; 