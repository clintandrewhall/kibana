/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { createContext, useContext, type FC, type PropsWithChildren } from 'react';
import {
  useOpenContentEditor,
  type OpenContentEditorParams,
} from '@kbn/content-management-content-editor';

/**
 * The content editor action function type.
 * Opens the content editor flyout and returns a close function.
 */
export type OpenContentEditorFn = (args: OpenContentEditorParams) => () => void;

/**
 * Context for sharing the content editor opener function.
 * This allows `useContentEditorAction` to access the opener without directly
 * calling `useOpenContentEditor`, which would throw if the context is missing.
 */
const ContentEditorActionContext = createContext<OpenContentEditorFn | null>(null);

/**
 * Provider component that calls `useOpenContentEditor` and shares it via context.
 *
 * This component should ONLY be rendered when `ContentEditorKibanaProvider` is
 * in the tree. The `ContentListKibanaProvider` handles this by only wrapping
 * with this provider when `supports.contentEditor` is true.
 */
export const ContentEditorActionProvider: FC<PropsWithChildren> = ({ children }) => {
  const openContentEditor = useOpenContentEditor();

  return (
    <ContentEditorActionContext.Provider value={openContentEditor}>
      {children}
    </ContentEditorActionContext.Provider>
  );
};

/**
 * Hook to access the content editor opener function.
 * Returns `null` if the provider is not in the tree.
 */
export const useContentEditorOpener = (): OpenContentEditorFn | null => {
  return useContext(ContentEditorActionContext);
};

