/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FC, useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { EuiCallOut } from '@elastic/eui';

// @ts-ignore
import { renderFunctionMap } from '../lib/renderers';
import { ErrorMessage } from './error_message';
import { useExpressions } from '../hooks';

const NO_OP = () => {};
export const Preview: FC = () => {
  const { result } = useExpressions();
  const mountRef: React.MutableRefObject<null | HTMLDivElement> = useRef(null);
  const [renderError, setRenderError] = useState<Error | null>(null);

  useEffect(() => {
    if (mountRef.current && result) {
      try {
        if (result.type === 'render') {
          const renderer = renderFunctionMap[result.as];
          renderer.render(mountRef.current, result.value, {
            getFilter: NO_OP,
            setFilter: NO_OP,
            done: NO_OP,
            onEmbeddableInputChange: NO_OP,
            onEmbeddableDestroyed: NO_OP,
            onDestroy: NO_OP,
            getElementId: NO_OP,
            onResize: NO_OP,
          });
        } else {
          ReactDOM.render(
            <EuiCallOut title="Not renderable" color="warning" iconType="help">
              Result is not renderable, of type <code>{result.type}</code>. Try adding{' '}
              <code>| render</code> to the end of your expression.
            </EuiCallOut>,
            mountRef.current
          );
        }
      } catch (e) {
        setRenderError(e);
      }
    }
  }, [mountRef, result]);

  useEffect(
    () => () => {
      ReactDOM.unmountComponentAtNode(mountRef.current!);
    },
    []
  );

  const error = renderError ? <ErrorMessage error={renderError} /> : null;

  return (
    <div id="eePreview" style={{ height: '100%' }}>
      <div id="eePreviewMountPoint" ref={mountRef} style={{ height: '100%' }} />
      {error}
    </div>
  );
};
