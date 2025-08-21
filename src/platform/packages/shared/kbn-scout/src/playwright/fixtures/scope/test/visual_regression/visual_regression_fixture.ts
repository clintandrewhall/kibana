/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { Locator, Page, TestInfo } from '@playwright/test';
import { SCOUT_VISUAL_REGRESSION_ENABLED } from '@kbn/scout-info';
import { waitForVisualStability } from './wait_for_visual_stability';

/**
 * Visual regression capture API.
 *
 * This API wraps the standard Playwright screenshot API to add metadata and
 * other Scout-specific checks (like waiting for network and page stability)
 * before capturing the screenshot.
 */
export interface VisualRegression {
  /**
   * Capture a default screenshot and attach it to the test result so the reporter can collect it.
   * @param name Logical name for the capture (required)
   * @param options Optional capture options
   */
  capture: (name: string) => Promise<void>;
  /**
   * Capture a full-page screenshot and attach it to the test result so the reporter can collect it.
   * @param name Logical name for the capture (required)
   * @param options Optional capture options
   */
  captureFull: (name: string) => Promise<void>;
  /**
   * Capture a screenshot of a specific locator and attach it.
   */
  captureLocator: (locator: Locator, name: string) => Promise<void>;
  /**
   * Convenience: capture the current viewport only (not full page).
   */
  captureViewport: (name: string) => Promise<void>;
}

export const createVisualRegressionApi = (page: Page, testInfo: TestInfo): VisualRegression => {
  const isEnabled = SCOUT_VISUAL_REGRESSION_ENABLED === true;

  const getFilePath = (name: string) => testInfo.outputPath(`vrt-${Date.now()}-${name}.png`);

  const captureScreenshot = async (
    name: string,
    takeScreenshot: (filePath: string) => Promise<void>
  ): Promise<void> => {
    if (!isEnabled) {
      return;
    }

    const filePath = getFilePath(name);

    await waitForVisualStability(page);
    await takeScreenshot(filePath);
    testInfo.attach(name, { path: filePath, contentType: 'image/png' });
  };

  const captureFull = async (name: string) =>
    captureScreenshot(name, async (filePath) => {
      await page.screenshot({ fullPage: true, path: filePath });
    });

  const captureViewport = async (name: string) =>
    captureScreenshot(name, async (filePath) => {
      await page.screenshot({ fullPage: false, path: filePath });
    });

  const captureLocator = async (locator: Locator, name: string) => {
    await captureScreenshot(name, async (filePath) => {
      await locator.waitFor({ state: 'visible' });
      await locator.screenshot({ path: filePath });
    });
  };

  // The default capture method captures the viewport.  This makes changing it
  // easy, without requiring test changes.
  const capture = captureViewport;

  return { capture, captureFull, captureLocator, captureViewport };
};
