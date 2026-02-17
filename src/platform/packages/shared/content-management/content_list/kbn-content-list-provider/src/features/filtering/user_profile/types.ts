/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

/**
 * Return value from the `useContentListUserFilter` hook.
 */
export interface UseContentListUserFilterReturn {
  /** Currently selected user IDs. Empty array means no filter active. */
  selectedUsers: string[];
  /** Whether user filtering is supported (service + feature flag). */
  isSupported: boolean;
  /** Set the selected user IDs. Pass an empty array to clear. */
  setSelectedUsers: (users: string[]) => void;
  /** Whether any user filter is currently active. */
  hasActiveFilter: boolean;
}
