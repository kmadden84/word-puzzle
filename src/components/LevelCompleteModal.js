import React, { useEffect, useCallback } from 'react';
import Lottie from 'react-lottie';
import fireworksAnimation from '../animations/fireworks.json';
import { useGame } from '../contexts/GameContext';
import './LevelCompleteModal.css';

const LevelCompleteModal = ({ show, difficulty, onClose, solvedCount, totalCount }) => {
  // Import all needed functions from GameContext
  const { 
    changeDifficulty, 
    getDifficultyWordCount, 
    solvedWords 
  } = useGame();

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
  
  // Check if all levels have been completed
  const allLevelsCompleted = isAdvanced && (() => {
    if (!getDifficultyWordCount || !solvedWords) return false;
    
    const beginnerWordCount = getDifficultyWordCount('beginner');
    const intermediateWordCount = getDifficultyWordCount('intermediate');
    
    const solvedBeginnerCount = solvedWords['beginner']?.length || 0;
    const solvedIntermediateCount = solvedWords['intermediate']?.length || 0;
    
    return solvedBeginnerCount >= beginnerWordCount && 
          solvedIntermediateCount >= intermediateWordCount;
  })();
  
  // Handle continue button click - change difficulty BEFORE closing modal
  const handleContinue = useCallback(() => {
    // Check if we're in the process of resetting - if solvedCount is 0, we're likely resetting
    const isResetting = solvedCount === 0;
    
    // Only change difficulty if not already at advanced level and not in reset mode
    if (!isResetting && !isAdvanced && nextDifficultyMap[difficulty]) {
      // Change to next difficulty level
      const nextDifficulty = nextDifficultyMap[difficulty];
      console.log(`Moving to ${nextDifficulty} difficulty from modal continue button`);
      
      // Change difficulty first
      changeDifficulty(nextDifficulty);
      
      // No need to manually reset hints - the getNextWord function in Game.js
      // will set hints based on the new word's length when onClose is called
    } else if (!isResetting && isAdvanced) {
      // For advanced level, just close the modal and let Game.js handle logic
      console.log("Advanced level completed - letting Game.js handle next steps");
      // Game.js will handle resetting hints through getNextWord
    }
    
    // Close the modal (which will also trigger getNextWord)
    onClose();
  }, [difficulty, isAdvanced, changeDifficulty, onClose, solvedCount]);

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
            {allLevelsCompleted ? (
              "You've mastered all difficulty levels! Great job!"
            ) : (
              "You'll be returned to Beginner level to try more words!"
            )}
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