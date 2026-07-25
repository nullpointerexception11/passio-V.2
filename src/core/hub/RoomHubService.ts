/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IRoom {
  id: string;
  title: string;
  iconName: 'pen' | 'book' | 'archive' | 'settings';
  path: string;
  description: string;
  angle: number; // Angle in degrees on the ring layout
}

export const PASSIO_ROOMS: IRoom[] = [
  {
    id: 'focus',
    title: 'Yazıhane',
    iconName: 'pen',
    path: '/focus',
    description: 'Zihnin kağıtla buluştuğu pürüzsüz çalışma alanı.',
    angle: 270, // Top
  },
  {
    id: 'library',
    title: 'Kütüphane',
    iconName: 'book',
    path: '/library',
    description: 'Sessiz ve derin okuma seansları için kişisel arşiv.',
    angle: 0, // Right
  },
  {
    id: 'archive',
    title: 'Arşiv',
    iconName: 'archive',
    path: '/archive',
    description: 'Geçmiş çalışmaların ve dökümanların güvenli odası.',
    angle: 90, // Bottom
  },
  {
    id: 'settings',
    title: 'Ayarlar',
    iconName: 'settings',
    path: '/settings',
    description: 'Sistem tercihlerinin ve yerel veritabanının yönetimi.',
    angle: 180, // Left
  },
];

export class RoomHubService {
  /**
   * Calculates the X and Y coordinate offsets for a room icon based on radius and angle.
   */
  static getCoordinates(angleInDegrees: number, radius: number): { x: number; y: number } {
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    return {
      x: Math.round(radius * Math.cos(angleInRadians)),
      y: Math.round(radius * Math.sin(angleInRadians)),
    };
  }

  /**
   * Validates if a route is a registered room path
   */
  static isValidRoomPath(path: string): boolean {
    return PASSIO_ROOMS.some(room => room.path === path);
  }
}
