/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { expect, spaceTest } from '@kbn/scout-security';
import { CUSTOM_QUERY_RULE } from '@kbn/scout-security/src/playwright/constants/detection_rules';

const RIGHT = 'right';

spaceTest.describe('Expandable flyout state sync', { tag: ['@ess', '@svlSecurity'] }, () => {
  let ruleName: string;
  spaceTest.beforeEach(async ({ browserAuth, apiServices, scoutSpace, visualRegression }) => {
    ruleName = `${CUSTOM_QUERY_RULE.name}_${scoutSpace.id}_${Date.now()}`;
    await apiServices.detectionRule.createCustomQueryRule({ ...CUSTOM_QUERY_RULE, name: ruleName });
    await browserAuth.loginAsPlatformEngineer();
    await visualRegression.capture('start of test');
  });

  spaceTest.afterEach(async ({ apiServices }) => {
    await apiServices.detectionRule.deleteAll();
  });

  spaceTest('should test flyout url sync', async ({ pageObjects, page, visualRegression }) => {
    await pageObjects.alertsTablePage.navigate();
    await visualRegression.capture('navigate to alerts table');

    const urlBeforeAlertDetails = page.url();
    expect(urlBeforeAlertDetails).not.toContain(RIGHT);

    await pageObjects.alertsTablePage.waitForDetectionsAlertsWrapper();
    await visualRegression.capture('detections alerts wrapper');
    await pageObjects.alertsTablePage.expandAlertDetailsFlyout(ruleName);
    await visualRegression.capture('expand alert details flyout');

    const urlAfterAlertDetails = page.url();
    expect(urlAfterAlertDetails).toContain(RIGHT);

    const headerTitle = pageObjects.alertDetailsRightPanelPage.detailsFlyoutHeaderTitle;
    await expect(headerTitle).toHaveText(ruleName);

    await page.reload();
    await pageObjects.alertsTablePage.waitForDetectionsAlertsWrapper();
    await visualRegression.capture('detections alerts wrapper after reload');

    const urlAfterReload = page.url();
    expect(urlAfterReload).toContain(RIGHT);

    await pageObjects.alertDetailsRightPanelPage.closeFlyout();
    await visualRegression.capture('close flyout');

    const urlAfterClosingFlyout = page.url();
    expect(urlAfterClosingFlyout).not.toContain(RIGHT);
  });
});
