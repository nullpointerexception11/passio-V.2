/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../core/theme/ThemeContext';
import { AppConfig } from '../core/config/AppConfig';
import { 
  BookOpen, 
  PenTool, 
  Settings, 
  Menu, 
  ChevronLeft, 
  Sun, 
  Moon, 
  ShieldCheck, 
  EyeOff, 
  HardDrive,
  Home,
  Archive
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { themeType, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zenMode, setZenMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const location = useLocation();
  const navigate = useNavigate();

  // Clock updating for status bar
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut listener: Escape key or Alt+Z to trigger Zen Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key === 'z') || (e.altKey && e.key === 'Z')) {
        setZenMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { path: '/', label: 'Ana Salon', icon: Home },
    { path: '/focus', label: 'Yazıhane', icon: PenTool },
    { path: '/library', label: 'Kütüphane', icon: BookOpen },
    { path: '/archive', label: 'Arşiv', icon: Archive },
    { path: '/settings', label: 'Ayarlar', icon: Settings },
  ];

  return (
    <div 
      id="passio-app-layout-root"
      className="flex flex-col h-screen w-screen overflow-hidden select-none font-sans"
      style={{
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
        transition: 'background-color var(--motion-duration-normal) var(--motion-duration-standard), color var(--motion-duration-normal) var(--motion-duration-standard)',
      }}
    >
      {/* Primary Layout Row */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Minimal Collapsible Sidebar */}
        <aside
          id="passio-sidebar-pane"
          className="flex flex-col h-full border-r shrink-0 z-sidebar transition-all duration-300 relative"
          style={{
            width: zenMode ? '0px' : sidebarOpen ? '240px' : '64px',
            opacity: zenMode ? 0 : 1,
            pointerEvents: zenMode ? 'none' : 'auto',
            backgroundColor: 'var(--color-bg-sidebar)',
            borderColor: 'var(--color-border-subtle)',
            transform: zenMode ? 'translateX(-100%)' : 'translateX(0)',
          }}
        >
          {/* Logo / Header Area */}
          <div className="flex items-center h-16 px-4 border-b shrink-0 justify-between"
               style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            {sidebarOpen ? (
              <span className="text-sm font-serif font-semibold tracking-widest uppercase text-accent">
                PASSIO
              </span>
            ) : (
              <span className="text-xs font-serif font-bold text-accent mx-auto">P.</span>
            )}
            
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-4 px-3 flex flex-col gap-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex items-center h-10 px-3.5 rounded-lg text-sm font-medium transition-all duration-150 text-left cursor-pointer group"
                  style={{
                    backgroundColor: isActive ? 'var(--color-bg-surface)' : 'transparent',
                    border: isActive ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
                    boxShadow: isActive ? 'var(--shadows-subtle)' : 'none',
                    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  }}
                >
                  <IconComponent className={`w-4.5 h-4.5 shrink-0 ${sidebarOpen ? 'mr-3' : 'mx-auto'} ${isActive ? 'text-accent' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer Controls */}
          <div className="p-3 border-t flex flex-col gap-2 shrink-0" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <button
              onClick={toggleTheme}
              className="flex items-center h-10 px-3.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {themeType === 'light' ? (
                <>
                  <Moon className="w-4.5 h-4.5 shrink-0 mr-3" />
                  {sidebarOpen && <span>Premium Black</span>}
                </>
              ) : (
                <>
                  <Sun className="w-4.5 h-4.5 shrink-0 mr-3" />
                  {sidebarOpen && <span>Premium White</span>}
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Floating Zen Toggle */}
        <button
          onClick={() => setZenMode(!zenMode)}
          className="absolute top-4 right-4 p-2.5 rounded-full border cursor-pointer z-dropdown backdrop-blur-sm shadow-md transition-all duration-300"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-secondary)',
          }}
          title="Toggle Distraction-Free (Alt + Z)"
        >
          {zenMode ? (
            <Menu className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </button>

        {/* Central Document Workspace Canvas */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <div className="flex-1 overflow-y-auto px-6 py-12 md:px-16 md:py-20 flex justify-center">
            {/* Elegant Typographic Column (Constrained width for readability 65-75 ch) */}
            <div className="w-full max-w-2xl h-full flex flex-col">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* High-End Status Bar */}
      <footer
        id="passio-status-bar"
        className="h-8 border-t px-4 flex items-center justify-between shrink-0 text-xs tracking-wide"
        style={{
          backgroundColor: 'var(--color-bg-sidebar)',
          borderColor: 'var(--color-border-subtle)',
          color: 'var(--color-text-muted)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-accent" />
            <span>100% Local Workspace</span>
          </div>
          <div className="flex items-center gap-1.5 border-l pl-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            <span>Privacy First Active</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span>{currentTime.toLocaleTimeString()}</span>
          <span className="border-l pl-4" style={{ borderColor: 'var(--color-border-subtle)' }}>v{AppConfig.version}</span>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
