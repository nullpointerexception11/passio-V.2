/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PASSIO_ROOMS, IRoom } from '../../core/hub/RoomHubService';
import { RoomIcon } from './RoomIcon';
import { useTheme } from '../theme/ThemeContext';
import { useSession } from '../../core/session/SessionContext';
import { useGlobalSearch } from '../../core/search/GlobalSearchContext';
import { Sun, Moon, Lock, Search, Layout, Inbox } from 'lucide-react';
import { useInbox } from '../../core/inbox/InboxContext';

export const RoomHub: React.FC = () => {
  const navigate = useNavigate();
  const { themeType, toggleTheme } = useTheme();
  const { lockSession } = useSession();
  const { openSearch } = useGlobalSearch();
  const { openCapture, openManager } = useInbox();
  const [hoveredRoom, setHoveredRoom] = useState<IRoom | null>(null);
  const [ringRadius, setRingRadius] = useState<number>(150);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setRingRadius(120);
      } else if (window.innerWidth < 1024) {
        setRingRadius(140);
      } else {
        setRingRadius(160);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRoomClick = (room: IRoom) => {
    try {
      const win = window as unknown as { webkitAudioContext?: typeof AudioContext };
      const AudioCtx = window.AudioContext || win.webkitAudioContext;
      if (AudioCtx) {
        const context = new AudioCtx();
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, context.currentTime);
        gain.gain.setValueAtTime(0.006, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(context.destination);
        osc.start();
        osc.stop(context.currentTime + 0.05);
      }
    } catch {
      // Audio context error ignored
    }

    navigate(room.path);
  };

  return (
    <div
      id="passio-room-hub-container"
      className="flex flex-col items-center justify-center min-h-screen w-screen relative overflow-hidden select-none"
      style={{
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
      }}
    >
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <div 
          className="w-7 h-7 rounded-full border flex items-center justify-center font-serif text-xs font-semibold"
          style={{
            borderColor: 'var(--color-border-subtle)',
            backgroundColor: 'var(--color-bg-surface)',
            color: 'var(--color-text-primary)'
          }}
        >
          P
        </div>
        <span className="text-[10px] font-serif font-semibold tracking-[0.3em] opacity-40 uppercase">
          PASSIO
        </span>
      </div>

      <div className="absolute top-8 right-8 flex items-center gap-3">
        <button
          onClick={openCapture}
          className="px-3.5 py-1.5 rounded-full border text-xs font-mono flex items-center gap-2 cursor-pointer transition-all hover:bg-amber-500/10 hover:border-amber-500/40 opacity-90 hover:opacity-100 text-amber-600 dark:text-amber-400 font-medium"
          style={{
            borderColor: 'var(--color-border-subtle)',
            backgroundColor: 'var(--color-bg-surface)',
          }}
          title="Gelen Kutusu (CTRL + SHIFT + SPACE)"
        >
          <Inbox className="w-3.5 h-3.5 text-amber-500" />
          <span>Gelen Kutusu</span>
        </button>

        <button
          onClick={() => navigate('/desk')}
          className="px-3.5 py-1.5 rounded-full border text-xs font-mono flex items-center gap-2 cursor-pointer transition-all hover:bg-amber-500/10 hover:border-amber-500/40 opacity-90 hover:opacity-100 text-amber-600 dark:text-amber-400 font-medium"
          style={{
            borderColor: 'var(--color-border-subtle)',
            backgroundColor: 'var(--color-bg-surface)',
          }}
          title="Günün Masası (Daily Desk)"
        >
          <Layout className="w-3.5 h-3.5 text-amber-500" />
          <span>Günün Masası</span>
        </button>

        <button
          onClick={openSearch}
          className="px-3 py-1.5 rounded-full border text-xs font-mono flex items-center gap-2 cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100"
          style={{
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
          }}
          title="Genel Arama (CTRL + K)"
        >
          <Search className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Ara</span>
          <kbd className="px-1.5 py-0.5 text-[10px] rounded border bg-black/5 dark:bg-white/5 font-mono opacity-60">
            CTRL+K
          </kbd>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full border cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
          }}
          title="Temayı Değiştir"
        >
          {themeType === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={lockSession}
          className="p-2.5 rounded-full border cursor-pointer transition-colors hover:bg-red-500/10 hover:border-red-500/30 opacity-70 hover:opacity-100 text-neutral-400 hover:text-red-500"
          style={{
            borderColor: 'var(--color-border-subtle)',
          }}
          title="Oturumu Kilitle (Çıkış Yap)"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>

      <div className="relative w-[440px] h-[440px] flex items-center justify-center">
        <div 
          className="absolute rounded-full border border-dashed transition-all duration-300 pointer-events-none"
          style={{
            width: `${ringRadius * 2}px`,
            height: `${ringRadius * 2}px`,
            borderColor: 'var(--color-border-subtle)',
            opacity: 0.2,
          }}
        />

        <div className="absolute w-48 text-center flex flex-col items-center justify-center pointer-events-none">
          {hoveredRoom ? (
            <div className="flex flex-col items-center animate-fade-in">
              <h2 className="text-sm tracking-[0.2em] font-serif font-medium uppercase text-accent">
                {hoveredRoom.title}
              </h2>
              <p 
                className="text-[11px] font-mono leading-relaxed mt-2 opacity-60 max-w-[160px] tracking-wide"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {hoveredRoom.description}
              </p>
            </div>
          ) : (
            <div className="text-[11px] uppercase font-serif tracking-[0.4em] font-medium opacity-30">
              ANA SALON
            </div>
          )}
        </div>

        {PASSIO_ROOMS.map((room) => (
          <RoomIcon
            key={room.id}
            room={room}
            radius={ringRadius}
            isHovered={hoveredRoom?.id === room.id}
            onHoverStart={() => setHoveredRoom(room)}
            onHoverEnd={() => setHoveredRoom(null)}
            onClick={() => handleRoomClick(room)}
          />
        ))}
      </div>
    </div>
  );
};

export default RoomHub;
