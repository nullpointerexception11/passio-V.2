/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger } from '../logger/Logger';

export interface IWritingTimeStats {
  todaySeconds: number;
  thisWeekSeconds: number;
  totalSeconds: number;
}

type WritingTimeListener = (stats: IWritingTimeStats) => void;

function getTodayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatWritingDuration(seconds: number): string {
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

class WritingTimeDomainService {
  private dailyLogs: Record<string, number> = {};
  private listeners: Set<WritingTimeListener> = new Set();
  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    try {
      const raw = localStorage.getItem('passio_writing_time_daily');
      if (raw) {
        this.dailyLogs = JSON.parse(raw);
      } else {
        // Seed today's writing time if empty (e.g. 18 mins = 1080s)
        const todayKey = getTodayKey();
        this.dailyLogs = {
          [todayKey]: 1080,
        };
        this.persist();
      }
    } catch (err) {
      Logger.error('WritingTimeService', 'Failed to load writing time logs', err);
    }
  }

  private persist() {
    try {
      localStorage.setItem('passio_writing_time_daily', JSON.stringify(this.dailyLogs));
    } catch (err) {
      Logger.error('WritingTimeService', 'Failed to persist writing time logs', err);
    }
  }

  /**
   * Starts tracking active writing session
   */
  startTracking() {
    if (this.timerId) return;
    this.timerId = setInterval(() => {
      this.addSeconds(5);
    }, 5000);
  }

  /**
   * Stops tracking active writing session
   */
  stopTracking() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Adds seconds to current date
   */
  addSeconds(seconds: number) {
    const today = getTodayKey();
    this.dailyLogs[today] = (this.dailyLogs[today] || 0) + seconds;
    this.persist();
    this.notifyListeners();
  }

  /**
   * Calculates Today, This Week, Total statistics
   */
  getStats(): IWritingTimeStats {
    const todayKey = getTodayKey();
    const todaySeconds = this.dailyLogs[todayKey] || 0;

    const now = new Date();
    const dayOfWeek = now.getDay();
    const distToMon = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distToMon);
    monday.setHours(0, 0, 0, 0);

    let thisWeekSeconds = 0;
    let totalSeconds = 0;

    for (const [dateStr, secs] of Object.entries(this.dailyLogs)) {
      totalSeconds += secs;
      const logDate = new Date(dateStr);
      if (!isNaN(logDate.getTime()) && logDate >= monday) {
        thisWeekSeconds += secs;
      }
    }

    return {
      todaySeconds,
      thisWeekSeconds,
      totalSeconds,
    };
  }

  subscribe(listener: WritingTimeListener): () => void {
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

export const WritingTimeService = new WritingTimeDomainService();
export default WritingTimeService;
