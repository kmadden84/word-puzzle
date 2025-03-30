import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer>
      <div className="footer-content">
        <p>© {currentYear} Word Puzzle</p>
        <p className="footer-tagline">Challenge your vocabulary daily!</p>
      </div>
    </footer>
  );
};

export default Footer; 