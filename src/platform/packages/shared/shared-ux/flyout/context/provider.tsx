/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { createContext, useContext, useMemo, ReactNode, useEffect } from 'react';

const KibanaFlyoutContext = createContext<KibanaFlyoutContextValue | null>(null);

export interface KibanaFlyoutContextValue {
  depth: number;
  right: number;
  size: number;
  setSize: (size: number) => void;
  isChildFlyout: boolean;
}

export const useKibanaFlyoutContext = () => {
  const context = useContext(KibanaFlyoutContext);

  if (!context) {
    throw new Error('useKibanaFlyoutContext must be used within a KibanaFlyoutProvider');
  }

  return context;
};

export const KibanaFlyoutProvider = ({
  children,
  size: sizeProp,
}: {
  children: ReactNode;
  size: number;
}) => {
  const {
    depth: parentDepth,
    right: parentRight,
    size: parentSize,
    isChildFlyout,
  } = useContext(KibanaFlyoutContext) || {
    depth: 0,
    right: 0,
    size: 0,
  };

  const depth = parentDepth + 1;
  const [size, setSize] = React.useState<number>(sizeProp);
  const [right, setRight] = React.useState<number>(parentRight + size);

  useEffect(() => {
    // Update the right position when parent size changes
    setRight(parentRight + parentSize);
  }, [parentRight, parentSize]);

  const value = useMemo(
    () => ({
      depth,
      right,
      size,
      setSize,
      isChildFlyout: isChildFlyout === undefined ? false : true,
    }),
    [depth, right, size, isChildFlyout]
  );

  return <KibanaFlyoutContext.Provider {...{ value }}>{children}</KibanaFlyoutContext.Provider>;
};
