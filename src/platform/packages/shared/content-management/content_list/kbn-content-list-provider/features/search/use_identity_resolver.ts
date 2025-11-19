/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { useCallback, useMemo, useRef } from 'react';

/**
 * Interface for resolving between display values (usernames/emails) and canonical values (UIDs).
 * Used to deduplicate filter values when the same identity can be represented differently.
 */
export interface IdentityResolver {
  /**
   * Get the canonical form of a value (UID if known, otherwise the value itself).
   * Case-insensitive lookup for display values.
   */
  getCanonical: (value: string) => string;

  /**
   * Get a display form of a canonical value (username if known, otherwise the value itself).
   */
  getDisplay: (canonical: string) => string;

  /**
   * Check if two values refer to the same identity.
   * Returns true if both resolve to the same canonical value.
   */
  isSame: (a: string, b: string) => boolean;

  /**
   * Register a mapping from a display value to its canonical form.
   * Builds the bidirectional lookup cache.
   */
  register: (display: string, canonical: string) => void;

  /**
   * Register multiple mappings at once from a Record<display, canonical>.
   */
  registerAll: (mappings: Record<string, string>) => void;

  /**
   * Clear all registered mappings.
   */
  clear: () => void;
}

/**
 * Internal state for the identity resolver.
 * Uses Maps for efficient O(1) lookups.
 */
interface IdentityResolverState {
  /** Maps lowercase display values to canonical values. */
  displayToCanonical: Map<string, string>;
  /** Maps canonical values to their preferred display value. */
  canonicalToDisplay: Map<string, string>;
}

/**
 * Creates an identity resolver for bidirectional mapping between display and canonical values.
 *
 * This hook provides a generic way to handle identity resolution for filter values.
 * It allows multiple display forms (username, email) to map to a single canonical form (UID),
 * enabling proper deduplication when users interact with filters in different ways.
 *
 * @returns An `IdentityResolver` object with methods for registration and lookup.
 *
 * @example
 * ```tsx
 * const resolver = useIdentityResolver();
 *
 * // Register mappings from API response.
 * resolver.register('john.doe', 'u_abc123');
 * resolver.register('john@elastic.co', 'u_abc123');
 *
 * // Check if values are the same identity.
 * resolver.isSame('john.doe', 'u_abc123'); // true
 * resolver.isSame('john@elastic.co', 'John.Doe'); // true (case-insensitive)
 *
 * // Get canonical form for filtering.
 * resolver.getCanonical('john.doe'); // 'u_abc123'
 * resolver.getCanonical('unknown'); // 'unknown' (returns input if not found)
 *
 * // Get display form for UI.
 * resolver.getDisplay('u_abc123'); // 'john.doe' (first registered display value)
 * ```
 */
export const useIdentityResolver = (): IdentityResolver => {
  // Use a ref to persist state across renders without causing re-renders.
  const stateRef = useRef<IdentityResolverState>({
    displayToCanonical: new Map(),
    canonicalToDisplay: new Map(),
  });

  const getCanonical = useCallback((value: string): string => {
    const state = stateRef.current;
    const lowerValue = value.toLowerCase();

    // First, check if value is itself a canonical (UID).
    if (state.canonicalToDisplay.has(value)) {
      return value;
    }

    // Check if value is a display value that maps to a canonical.
    const canonical = state.displayToCanonical.get(lowerValue);
    if (canonical) {
      return canonical;
    }

    // Value not found in mappings - return as-is.
    return value;
  }, []);

  const getDisplay = useCallback((canonical: string): string => {
    const state = stateRef.current;

    // Look up the display value for this canonical.
    const display = state.canonicalToDisplay.get(canonical);
    if (display) {
      return display;
    }

    // Check if the canonical is actually a display value (reverse lookup).
    const lowerCanonical = canonical.toLowerCase();
    if (state.displayToCanonical.has(lowerCanonical)) {
      return canonical;
    }

    // Not found - return as-is.
    return canonical;
  }, []);

  const isSame = useCallback(
    (a: string, b: string): boolean => {
      // Quick equality check.
      if (a === b || a.toLowerCase() === b.toLowerCase()) {
        return true;
      }

      // Resolve both to canonical and compare.
      const canonicalA = getCanonical(a);
      const canonicalB = getCanonical(b);

      return canonicalA === canonicalB;
    },
    [getCanonical]
  );

  const register = useCallback((display: string, canonical: string): void => {
    const state = stateRef.current;
    const lowerDisplay = display.toLowerCase();

    // Add display -> canonical mapping.
    state.displayToCanonical.set(lowerDisplay, canonical);

    // Only set canonical -> display if not already set (preserve first display value).
    if (!state.canonicalToDisplay.has(canonical)) {
      state.canonicalToDisplay.set(canonical, display);
    }
  }, []);

  const registerAll = useCallback(
    (mappings: Record<string, string>): void => {
      for (const [display, canonical] of Object.entries(mappings)) {
        register(display, canonical);
      }
    },
    [register]
  );

  const clear = useCallback((): void => {
    stateRef.current.displayToCanonical.clear();
    stateRef.current.canonicalToDisplay.clear();
  }, []);

  // Memoize the resolver object to maintain stable reference.
  const resolver = useMemo(
    (): IdentityResolver => ({
      getCanonical,
      getDisplay,
      isSame,
      register,
      registerAll,
      clear,
    }),
    [getCanonical, getDisplay, isSame, register, registerAll, clear]
  );

  return resolver;
};

