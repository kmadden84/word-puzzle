import React, { useEffect, useCallback } from 'react';
import Lottie from 'react-lottie';
import fireworksAnimation from '../animations/fireworks.json';
import { useGame } from '../contexts/GameContext';
import './LevelCompleteModal.css';

const LevelCompleteModal = ({ show, difficulty, onClose, solvedCount, totalCount }) => {
  const { changeDifficulty } = useGame();

  // Map difficulty levels to readable names
  const difficultyNames = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced'
  };

  // Next difficulty map
  const nextDifficultyMap = {
    beginner: 'intermediate',
    intermediate: 'advanced',
    advanced: null // No next level for advanced
  };
  
  const isAdvanced = difficulty === 'advanced';
  
  // Handle continue button click - change difficulty BEFORE closing modal
  const handleContinue = useCallback(() => {
    // Only change difficulty if not already at advanced level
    if (!isAdvanced && nextDifficultyMap[difficulty]) {
      // Change to next difficulty level
      const nextDifficulty = nextDifficultyMap[difficulty];
      console.log(`Moving to ${nextDifficulty} difficulty from modal continue button`);
      changeDifficulty(nextDifficulty);
    }
    
    // Close the modal (which will also trigger getNextWord)
    onClose();
  }, [difficulty, isAdvanced, changeDifficulty, onClose]);

  // Add body class when modal opens and remove when it closes
  useEffect(() => {
    // Only add classes and set timer if the modal is shown
    if (!show) return;
    
    // Add class to prevent body scrolling
    document.body.classList.add('modal-open');
    
    // Auto-close after 8 seconds (optional)
    const timer = setTimeout(() => {
      handleContinue();
    }, 8000);
    
    // Clean up function to remove class when component unmounts
    return () => {
      document.body.classList.remove('modal-open');
      clearTimeout(timer);
    };
  }, [show, handleContinue]);

  // Don't render if not showing - MOVED after the hooks
  if (!show) return null;

  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: fireworksAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return (
    <div className="level-complete-overlay">
      <div className="level-complete-container">
        <div className="fireworks-animation">
          <Lottie 
            options={lottieOptions}
            height={300}
            width={300}
          />
        </div>

        <h1 className="stage-cleared">Stage Cleared!</h1>
        
        <p className="completion-message">
          Congratulations! You've solved all {totalCount} words in the 
          <span className="difficulty-name"> {difficultyNames[difficulty]} </span> 
          difficulty level!
        </p>
        
        {!isAdvanced ? (
          <p className="next-level-message">
            You've been upgraded to <span className="next-difficulty">{nextDifficultyMap[difficulty].charAt(0).toUpperCase() + nextDifficultyMap[difficulty].slice(1)}</span> level!
          </p>
        ) : (
          <p className="next-level-message">
            You've mastered all difficulty levels! Great job!
          </p>
        )}
        
        <button className="continue-button" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default LevelCompleteModal; 