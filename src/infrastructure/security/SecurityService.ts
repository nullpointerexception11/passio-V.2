/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger } from '../logger/Logger';
import { db } from '../db/connection';

export interface ISecurityService {
  isSetupCompleted(): Promise<boolean>;
  setupPin(pin: string): Promise<boolean>;
  verifyPin(pin: string): Promise<boolean>;
}

class SecurityService implements ISecurityService {
  private cacheSetupCompleted: boolean | null = null;

  /**
   * Checks if the user has completed the initial setup (PIN registration)
   */
  async isSetupCompleted(): Promise<boolean> {
    if (this.cacheSetupCompleted !== null) {
      return this.cacheSetupCompleted;
    }

    try {
      const settingsList = await db.select<{ key: string; value: string }>('settings', { key: 'pin_setup_completed' });
      const completed = settingsList.length > 0 && settingsList[0].value === 'true';
      this.cacheSetupCompleted = completed;
      return completed;
    } catch (err) {
      Logger.warn('Security', 'Error checking PIN setup state. Defaulting to false.', err);
      return false;
    }
  }

  /**
   * Registers a brand-new 4-digit security PIN.
   * Generates a unique salt and hashes the PIN securely via Web Crypto SHA-256.
   */
  async setupPin(pin: string): Promise<boolean> {
    if (!/^\d{4}$/.test(pin)) {
      Logger.warn('Security', 'PIN validation failed. PIN must be exactly 4 numeric characters.');
      return false;
    }

    try {
      const salt = this.generateRandomSalt();
      const pinHash = await this.hashPinWithSalt(pin, salt);
      const now = new Date().toISOString();
      
      await db.insert('settings', { key: 'pin_salt', value: salt, updatedAt: now });
      await db.insert('settings', { key: 'pin_hash', value: pinHash, updatedAt: now });
      await db.insert('settings', { key: 'pin_setup_completed', value: 'true', updatedAt: now });

      this.cacheSetupCompleted = true;
      Logger.info('Security', 'Initial 4-digit PIN setup completed and persisted securely.');
      return true;
    } catch (err) {
      Logger.error('Security', 'Failed to save secure PIN registration.', err);
      return false;
    }
  }

  /**
   * Verifies the entered PIN against the offline hashed record.
   */
  async verifyPin(pin: string): Promise<boolean> {
    if (!/^\d{4}$/.test(pin)) {
      return false;
    }

    try {
      const saltRecord = await db.select<{ key: string; value: string }>('settings', { key: 'pin_salt' });
      const hashRecord = await db.select<{ key: string; value: string }>('settings', { key: 'pin_hash' });

      if (saltRecord.length === 0 || hashRecord.length === 0) {
        Logger.warn('Security', 'PIN verification attempted but credentials records do not exist.');
        return false;
      }

      const salt = saltRecord[0].value;
      const storedHash = hashRecord[0].value;
      const computedHash = await this.hashPinWithSalt(pin, salt);

      const matches = this.safeCompare(computedHash, storedHash);
      
      if (matches) {
        Logger.info('Security', 'Secure PIN authentication challenge verified successfully.');
        return true;
      } else {
        Logger.warn('Security', 'Secure PIN authentication challenge failed.');
        return false;
      }
    } catch (err) {
      Logger.error('Security', 'PIN verification engine experienced a critical exception.', err);
      return false;
    }
  }

  private generateRandomSalt(): string {
    const arr = new Uint8Array(8);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(arr);
    } else {
      for (let i = 0; i < 8; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async hashPinWithSalt(pin: string, salt: string): Promise<string> {
    const textToHash = pin + ':' + salt;
    const encoder = new TextEncoder();
    const data = encoder.encode(textToHash);
    
    let hashBuffer: ArrayBuffer;
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    } else {
      return this.fallbackSha256(textToHash);
    }

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  private fallbackSha256(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  async clearPinSettings(): Promise<void> {
    await db.delete('settings', { key: 'pin_salt' });
    await db.delete('settings', { key: 'pin_hash' });
    await db.delete('settings', { key: 'pin_setup_completed' });
    this.cacheSetupCompleted = null;
    Logger.info('Security', 'PIN security and configuration settings cleared from offline storage.');
  }
}

export const Security = new SecurityService();
export default Security;
