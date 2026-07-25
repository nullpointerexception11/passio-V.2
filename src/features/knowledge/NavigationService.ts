/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger } from '../../infrastructure/logger/Logger';

export interface INavigationTarget {
  route: string;
  materialId?: string;
  pageNumber?: number;
}

export class NavigationService {
  public static navigateToSource(
    navigateFn: (path: string, options?: { state?: any }) => void,
    materialId: string,
    pageNumber: number = 1
  ): void {
    Logger.info('NavigationService', `Navigating to material [${materialId}] page [${pageNumber}] in Library`);
    
    navigateFn('/library', {
      state: {
        materialId,
        pageNumber,
        timestamp: Date.now(),
      },
    });
  }
}

export default NavigationService;
