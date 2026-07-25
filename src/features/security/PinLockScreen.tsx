/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Security } from '../../infrastructure/security/SecurityService';
import { useTheme } from '../theme/ThemeContext';
import { ShieldAlert, Delete } from 'lucide-react';

interface PinLockScreenProps {
  onUnlock: () => void;
}

type Mode = 'CHECK_STATUS' | 'SETUP_CHOOSE' | 'SETUP_CONFIRM' | 'UNLOCK';

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ onUnlock }) => {
  useTheme();
  const [mode, setMode] = useState<Mode>('CHECK_STATUS');
  const [pin, setPin] = useState<string>('');
  const [setupPin, setSetupPin] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const playTick = () => {
    try {
      const win = window as unknown as { webkitAudioContext?: typeof AudioContext };
      const AudioCtx = window.AudioContext || win.webkitAudioContext;
      if (!AudioCtx) return;
      const context = new AudioCtx();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, context.currentTime);
      gain.gain.setValueAtTime(0.01, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start();
      osc.stop(context.currentTime + 0.05);
    } catch {
      // Audio context error ignored
    }
  };

  useEffect(() => {
    async function determineMode() {
      const isSetup = await Security.isSetupCompleted();
      if (isSetup) {
        setMode('UNLOCK');
      } else {
        setMode('SETUP_CHOOSE');
      }
    }
    determineMode();
  }, []);

  const handleKeyPress = async (value: string) => {
    playTick();
    if (isShaking) return;

    if (value === 'back') {
      setPin((prev) => prev.slice(0, -1));
      return;
    }

    if (pin.length >= 4) return;
    const newPin = pin + value;
    setPin(newPin);

    if (newPin.length === 4) {
      setTimeout(async () => {
        await processFullPin(newPin);
      }, 150);
    }
  };

  const processFullPin = async (completedPin: string) => {
    if (mode === 'UNLOCK') {
      const success = await Security.verifyPin(completedPin);
      if (success) {
        onUnlock();
      } else {
        triggerShake();
      }
    } else if (mode === 'SETUP_CHOOSE') {
      setSetupPin(completedPin);
      setPin('');
      setMode('SETUP_CONFIRM');
    } else if (mode === 'SETUP_CONFIRM') {
      if (completedPin === setupPin) {
        const success = await Security.setupPin(completedPin);
        if (success) {
          onUnlock();
        } else {
          triggerShake();
        }
      } else {
        triggerShake();
        setTimeout(() => {
          setMode('SETUP_CHOOSE');
          setSetupPin('');
        }, 500);
      }
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setPin('');
    setTimeout(() => {
      setIsShaking(false);
    }, 450);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'CHECK_STATUS') return;
      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeyPress('back');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, mode, setupPin, isShaking]);

  if (mode === 'CHECK_STATUS') {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: 'var(--color-bg-base)' }}
      />
    );
  }

  const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '0', 'back'];

  return (
    <div
      id="passio-pin-lock-canvas"
      className="flex flex-col items-center justify-center min-h-screen w-screen relative select-none"
      style={{
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
        transition: 'background-color var(--motion-duration-slow) var(--motion-duration-standard)',
      }}
    >
      <div className="w-full max-w-sm flex flex-col items-center px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex flex-col items-center"
        >
          <div
            className="w-10 h-10 mb-4 rounded-full border flex items-center justify-center font-serif text-lg font-bold"
            style={{
              borderColor: 'var(--color-border-subtle)',
              backgroundColor: 'var(--color-bg-surface)',
              color: 'var(--color-text-accent)',
              boxShadow: 'var(--shadows-subtle)',
            }}
          >
            P
          </div>
          <h1 className="text-xs uppercase tracking-[0.25em] font-serif font-medium text-accent">
            PASSIO
          </h1>
          <p className="text-xs mt-2 opacity-50 font-mono tracking-wider">
            {mode === 'SETUP_CHOOSE' && 'CHOOSE SECURITY PIN'}
            {mode === 'SETUP_CONFIRM' && 'CONFIRM SECURITY PIN'}
            {mode === 'UNLOCK' && 'ENTER VAULT PIN'}
          </p>
        </motion.div>

        <div className="mb-12 relative flex justify-center w-full">
          <motion.div
            animate={isShaking ? { x: [-10, 10, -6, 6, -3, 3, 0] } : { x: 0 }}
            transition={{ duration: 0.45 }}
            className="flex gap-4 justify-center"
          >
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className="w-3.5 h-3.5 rounded-full transition-all duration-200 border"
                  style={{
                    backgroundColor: isFilled
                      ? 'var(--color-text-accent, #d97706)'
                      : 'transparent',
                    borderColor: isShaking
                      ? '#e5484d'
                      : isFilled
                      ? 'var(--color-text-accent, #d97706)'
                      : 'var(--color-border-subtle)',
                    boxShadow: isFilled ? '0 0 12px rgba(217, 119, 6, 0.4)' : 'none',
                    transform: isFilled ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              );
            })}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-3 gap-y-4 gap-x-8 w-full max-w-[280px]"
        >
          {keypadKeys.map((key, index) => {
            const isBack = key === 'back';
            const isEmpty = key === ' ';

            if (isEmpty) return <div key={index} className="w-14 h-14" />;

            return (
              <button
                key={index}
                onClick={() => !isBack && handleKeyPress(key)}
                onMouseDown={() => isBack && handleKeyPress('back')}
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg transition-all duration-200 cursor-pointer border hover:border-amber-500/40 hover:bg-amber-500/5 hover:scale-105 active:scale-95 mx-auto font-mono"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border-subtle)',
                  color: isBack ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                  boxShadow: 'var(--shadows-subtle)',
                }}
              >
                {isBack ? <Delete className="w-4 h-4" /> : key}
              </button>
            );
          })}
        </motion.div>

        <div className="mt-12 flex items-center gap-1.5 opacity-40 font-mono text-[10px] tracking-widest uppercase">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Offline Hardware Sandboxed</span>
        </div>
      </div>
    </div>
  );
};

export default PinLockScreen;
