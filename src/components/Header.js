import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import StatsModal from './StatsModal';
import HelpModal from './HelpModal';
import './Header.css';
import { useTheme } from '../contexts/ThemeContext';

const Header = () => {
  const [statsOpen, setStatsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const { stats } = useGame();
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <header>
      <div className="header-container">
        <div className="header-buttons left">
          <button 
            className="icon-button" 
            onClick={() => setHelpOpen(true)}
            aria-label="How to play"
          >
            ?
          </button>
        </div>
        
        <h1 className="app-title">
          <span className="title-word">WORD</span> <span className="title-puzzle">PUZZLE</span>
        </h1>
        
        <div className="header-buttons right">
          <button 
            className="icon-button" 
            onClick={() => setStatsOpen(true)}
            aria-label="Statistics"
          >
            📊
          </button>
          
          <button 
            className="icon-button theme-toggle-header" 
            onClick={toggleDarkMode} 
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
      
      {statsOpen && <StatsModal stats={stats} onClose={() => setStatsOpen(false)} />}
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </header>
  );
};

export default Header; 