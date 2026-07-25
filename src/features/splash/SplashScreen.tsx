/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1700);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      id="passio-splash-canvas"
      className="flex items-center justify-center min-h-screen w-screen bg-black z-splash select-none overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ 
          opacity: [0, 0.9, 0.9, 0],
          scale: [0.94, 1.02, 1.00, 0.96]
        }}
        transition={{ 
          duration: 1.7,
          times: [0, 0.35, 0.75, 1],
          ease: [0.25, 1, 0.5, 1]
        }}
        className="flex flex-col items-center justify-center"
      >
        <div 
          className="w-14 h-14 rounded-full border flex items-center justify-center font-serif text-xl font-medium text-white bg-neutral-950"
          style={{ 
            borderColor: 'rgba(255, 255, 255, 0.08)',
            boxShadow: '0 0 30px rgba(255, 255, 255, 0.03)'
          }}
        >
          P
        </div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
