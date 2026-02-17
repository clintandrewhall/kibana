/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { UserProfileService } from './user_profile';

/**
 * Services provided to the content list provider to enable additional capabilities.
 *
 * Each service follows a pattern where providing the service enables the corresponding
 * feature by default. Features can be explicitly disabled via the `features` prop
 * even when the service is present.
 */
export interface ContentListServices {
  /**
   * User profile service for resolving creator avatars and filtering by user.
   *
   * Provides `getUserProfile` for single lookups and `bulkGetUserProfiles` for
   * batch resolution. When present, enables the `createdBy` column and filter
   * automatically (unless `features.createdBy` is `false`).
   */
  userProfile?: UserProfileService;
}
