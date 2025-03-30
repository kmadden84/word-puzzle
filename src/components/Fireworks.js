import React from 'react';
import Lottie from 'lottie-react';
import confettiAnimation from '../assets/animations/confetti.json';
import './Game.css';

const Fireworks = ({ duration = 3000 }) => {
  return (
    <div className="lottie-container">
      <Lottie
        animationData={confettiAnimation}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      />
    </div>
  );
};

export default Fireworks; 