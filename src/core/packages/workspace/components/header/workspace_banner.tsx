/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { ReactNode, useEffect, useState } from 'react';
import { useResizeObserver } from '@elastic/eui';

import { styles } from './workspace_banner.styles';

export const WorkspaceBanner = ({ children }: { children: ReactNode }) => {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  const { height } = useResizeObserver(ref, 'height');

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--kbnWorkspace-banner-content-height',
      `${height}px`
    );
    return () => {
      document.documentElement.style.removeProperty('--kbnWorkspace-banner-content-height');
    };
  }, [height]);

  return (
    <section css={styles.root}>
      <div ref={setRef}>{children}</div>
    </section>
  );
};
