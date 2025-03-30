import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import './Modal.css';

const StatsModal = ({ onClose }) => {
  const { stats, difficulty: currentDifficulty } = useGame();
  const [activeDifficulty, setActiveDifficulty] = useState(currentDifficulty);
  
  const handleTabClick = (difficulty) => {
    setActiveDifficulty(difficulty);
  };
  
  const activeStats = stats[activeDifficulty];
  const winPercentage = activeStats.played > 0 
    ? Math.round((activeStats.won / activeStats.played) * 100)
    : 0;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Your Stats</h2>
        
        <div className="stats-tabs">
          <button 
            className={`stats-tab ${activeDifficulty === 'total' ? 'active' : ''}`}
            onClick={() => handleTabClick('total')}
          >
            All
          </button>
          <button 
            className={`stats-tab ${activeDifficulty === 'beginner' ? 'active' : ''}`}
            onClick={() => handleTabClick('beginner')}
          >
            Beginner
          </button>
          <button 
            className={`stats-tab ${activeDifficulty === 'intermediate' ? 'active' : ''}`}
            onClick={() => handleTabClick('intermediate')}
          >
            Inter
          </button>
          <button 
            className={`stats-tab ${activeDifficulty === 'advanced' ? 'active' : ''}`}
            onClick={() => handleTabClick('advanced')}
          >
            Advanced
          </button>
        </div>
        
        <div className="stats-container">
          <div className="stat-box">
            <div className="stat-value">{activeStats.played}</div>
            <div className="stat-label">Played</div>
          </div>
          
          <div className="stat-box">
            <div className="stat-value">{winPercentage}%</div>
            <div className="stat-label">Win %</div>
          </div>
          
          <div className="stat-box">
            <div className="stat-value">{activeStats.currentStreak}</div>
            <div className="stat-label">Current Streak</div>
          </div>
          
          <div className="stat-box">
            <div className="stat-value">{activeStats.maxStreak}</div>
            <div className="stat-label">Max Streak</div>
          </div>
        </div>
        
        <p className="stats-info">
          {activeDifficulty === 'total' 
            ? 'Stats across all difficulty levels' 
            : `Stats for ${activeDifficulty} difficulty`}
        </p>
      </div>
    </div>
  );
};

export default StatsModal; 