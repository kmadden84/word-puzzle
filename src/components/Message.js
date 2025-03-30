import React, { useEffect, useState } from 'react';
import './Message.css';

const Message = ({ text, type }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [text]);
  
  return (
    <div className={`message ${type} ${visible ? 'visible' : ''}`}>
      {text}
    </div>
  );
};

export default Message; 