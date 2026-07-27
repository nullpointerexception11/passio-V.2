/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger } from '../logger/Logger';

export interface IReadingSession {
  id: string;
  docId?: string;
  docTitle?: string;
  start: string; // ISO string
  end: string;   // ISO string
  duration: number; // in seconds
}

export interface IReadingTimeStats {
  todaySeconds: number;
  thisWeekSeconds: number;
  dailyGoalSeconds: number;
}

type TimeListener = (stats: IReadingTimeStats) => void;

function getTodayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatReadingDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}sn`;
  }
  const mins = Math.floor(seconds / 60);
  if (mins < 60) {
    return `${mins}dk`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (remMins === 0) {
    return `${hours}sa`;
  }
  return `${hours}sa ${remMins}dk`;
}

const STORAGE_SESSIONS_KEY = 'passio_reading_sessions';
const IDLE_TIMEOUT_MS = 120000; // 2 minutes of inactivity ends session

class ReadingTimeDomainService {
  private sessions: IReadingSession[] = [];
  private activeSession: IReadingSession | null = null;
  private listeners: Set<TimeListener> = new Set();
  private timerId: ReturnType<typeof setInterval> | null = null;
  private lastActivityTime: number = Date.now();
  private isInactive: boolean = false;
  private boundActivityHandler: () => void;
  private boundVisibilityHandler: () => void;
  private activeDocInfo: { docId?: string; docTitle?: string } | null = null;
  private dailyGoalSeconds: number = 1800; // default 30 minutes

  constructor() {
    this.boundActivityHandler = this.handleUserActivity.bind(this);
    this.boundVisibilityHandler = this.handleVisibilityChange.bind(this);
    this.loadSessions();
    this.loadGoal();
  }

  private loadGoal() {
    try {
      const raw = localStorage.getItem('passio_reading_goal_seconds');
      if (raw) {
        this.dailyGoalSeconds = parseInt(raw, 10) || 1800;
      }
    } catch (err) {
      Logger.error('ReadingTimeService', 'Failed to load reading goal', err);
      this.dailyGoalSeconds = 1800;
    }
  }

  setDailyGoal(seconds: number) {
    this.dailyGoalSeconds = seconds;
    try {
      localStorage.setItem('passio_reading_goal_seconds', String(seconds));
    } catch (err) {
      Logger.error('ReadingTimeService', 'Failed to persist reading goal', err);
    }
    this.notifyListeners();
  }

  getDailyGoal(): number {
    return this.dailyGoalSeconds;
  }

  private loadSessions() {
    try {
      const raw = localStorage.getItem(STORAGE_SESSIONS_KEY);
      if (raw) {
        this.sessions = JSON.parse(raw);
      }
    } catch (err) {
      Logger.error('ReadingTimeService', 'Failed to load reading sessions', err);
      this.sessions = [];
    }
  }

  private persistSessions() {
    try {
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(this.sessions));
    } catch (err) {
      Logger.error('ReadingTimeService', 'Failed to persist reading sessions', err);
    }
  }

  /**
   * Begins a new reading session when a PDF is opened
   */
  startSession(docId?: string, docTitle?: string) {
    this.activeDocInfo = { docId, docTitle };
    this.lastActivityTime = Date.now();
    this.isInactive = false;

    if (this.activeSession) {
      this.endSession();
    }

    const now = new Date();
    this.activeSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      docId,
      docTitle,
      start: now.toISOString(),
      end: now.toISOString(),
      duration: 0,
    };

    this.attachActivityListeners();
    this.startTicker();
    this.notifyListeners();
    Logger.info('ReadingTimeService', `Started reading session for [${docTitle || docId || 'PDF'}]`);
  }

  /**
   * Legacy method support for backward compatibility
   */
  startTracking(docId?: string, docTitle?: string) {
    this.startSession(docId, docTitle);
  }

  /**
   * Ends current reading session when reader is closed or inactive
   */
  endSession() {
    this.stopTicker();
    this.detachActivityListeners();

    if (this.activeSession) {
      // Only store session if duration > 0
      if (this.activeSession.duration > 0) {
        this.activeSession.end = new Date().toISOString();
        this.sessions.push({ ...this.activeSession });
        this.persistSessions();
        Logger.info(
          'ReadingTimeService',
          `Ended session [${this.activeSession.id}], duration: ${this.activeSession.duration}s`
        );
      }
      this.activeSession = null;
    }

    this.notifyListeners();
  }

  /**
   * Legacy method support
   */
  stopTracking() {
    this.endSession();
  }

  private startTicker() {
    if (this.timerId) return;
    this.timerId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  private stopTicker() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private tick() {
    const now = Date.now();

    // Inactivity check
    if (now - this.lastActivityTime > IDLE_TIMEOUT_MS || document.hidden) {
      if (!this.isInactive) {
        this.isInactive = true;
        Logger.info('ReadingTimeService', 'Session paused due to reader inactivity or tab hide');
        this.endSession();
      }
      return;
    }

    // Update active session
    if (this.activeSession) {
      this.activeSession.duration += 1;
      this.activeSession.end = new Date().toISOString();
      this.notifyListeners();
    }
  }

  private handleUserActivity() {
    this.lastActivityTime = Date.now();
    if (this.isInactive && this.activeDocInfo) {
      // Resume new session upon becoming active again
      this.isInactive = false;
      this.startSession(this.activeDocInfo.docId, this.activeDocInfo.docTitle);
    }
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      if (this.activeSession) {
        this.isInactive = true;
        this.endSession();
      }
    } else {
      this.handleUserActivity();
    }
  }

  private attachActivityListeners() {
    if (typeof window === 'undefined') return;
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach((evt) => {
      window.addEventListener(evt, this.boundActivityHandler, { passive: true });
    });
    document.addEventListener('visibilitychange', this.boundVisibilityHandler);
  }

  private detachActivityListeners() {
    if (typeof window === 'undefined') return;
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach((evt) => {
      window.removeEventListener(evt, this.boundActivityHandler);
    });
    document.removeEventListener('visibilitychange', this.boundVisibilityHandler);
  }

  /**
   * Returns stored session objects
   */
  getSessions(): IReadingSession[] {
    return [...this.sessions];
  }

  /**
   * Calculates Daily and Weekly totals
   */
  getStats(): IReadingTimeStats {
    const now = new Date();
    const todayKey = getTodayKey(now);

    // Calculate start of Monday of current week
    const dayOfWeek = now.getDay();
    const distToMon = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distToMon);
    monday.setHours(0, 0, 0, 0);

    let todaySeconds = 0;
    let thisWeekSeconds = 0;

    // Process completed stored sessions
    for (const session of this.sessions) {
      const sessionStart = new Date(session.start);
      if (isNaN(sessionStart.getTime())) continue;

      const sessionDayKey = getTodayKey(sessionStart);
      if (sessionDayKey === todayKey) {
        todaySeconds += session.duration;
      }
      if (sessionStart >= monday) {
        thisWeekSeconds += session.duration;
      }
    }

    // Include currently active session
    if (this.activeSession) {
      const activeStart = new Date(this.activeSession.start);
      if (!isNaN(activeStart.getTime())) {
        const activeDayKey = getTodayKey(activeStart);
        if (activeDayKey === todayKey) {
          todaySeconds += this.activeSession.duration;
        }
        if (activeStart >= monday) {
          thisWeekSeconds += this.activeSession.duration;
        }
      }
    }

    return {
      todaySeconds,
      thisWeekSeconds,
      dailyGoalSeconds: this.dailyGoalSeconds,
    };
  }

  subscribe(listener: TimeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const stats = this.getStats();
    this.listeners.forEach((fn) => fn(stats));
  }
}

export const ReadingTimeService = new ReadingTimeDomainService();
export default ReadingTimeService;
