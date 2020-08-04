/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable @typescript-eslint/naming-convention */

import React, { FC, useRef, useState, useEffect } from 'react';
import { EuiButton, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import classnames from 'classnames';

import { ExpressionPanel } from '../../../components/expression_panel';
import { PageSidebar } from '../../../components/page_sidebar';
import { Sidebar } from '../../../components/sidebar';
// @ts-expect-error Untyped local
import { Workpad } from '../../../components/workpad';
import { WorkpadHeader } from '../../../components/workpad_header';
import { CANVAS_LAYOUT_STAGE_CONTENT_SELECTOR } from '../../../../common/lib/constants';
import { CommitFn } from '../../../../types';
import { LayerSelector } from '../../../components/layer_selector/layer_selector';

interface Props {
  deselectElement?: () => void;
  selectedNodes: string[];
  isWriteable: boolean;
}

export const WorkpadApp: FC<Props> = ({
  deselectElement = () => {},
  isWriteable,
  selectedNodes,
}) => {
  const interactivePageLayout = useRef<CommitFn | null>(null); // future versions may enable editing on multiple pages => use array then
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPageManager, setShowPageManager] = useState(false);
  const [showExpressionPanel, setShowExpressionPanel] = useState(false);
  const [showWorkpadSettings, setShowWorkpadSettings] = useState(false);
  const isElementSelected = selectedNodes.length === 1 && !selectedNodes[0].includes('group');

  useEffect(() => {
    if (!isElementSelected) {
      setShowExpressionPanel(false);
    }

    if (isElementSelected || showWorkpadSettings) {
      setShowSidebar(true);
      return;
    }

    if (!isWriteable || selectedNodes.length === 0) {
      setShowSidebar(false);
      return;
    }
  }, [isWriteable, selectedNodes, isElementSelected, showWorkpadSettings]);

  useEffect(() => {
    if (selectedNodes.length > 0) {
      setShowWorkpadSettings(false);
      return;
    }
  }, [selectedNodes]);

  const registerLayout = (newLayout: CommitFn) => {
    if (interactivePageLayout.current !== newLayout) {
      interactivePageLayout.current = newLayout;
    }
  };

  const unregisterLayout = (oldLayout: CommitFn) => {
    if (interactivePageLayout.current === oldLayout) {
      interactivePageLayout.current = null;
    }
  };

  const commit = interactivePageLayout.current || (() => {});

  return (
    <EuiFlexGroup
      className={classnames({
        workpadApp: true,
        'workpadApp--showSidebar': showSidebar,
        'workpadApp--showPageManager': showPageManager,
        'workpadApp--showExpressionPanel': showExpressionPanel,
      })}
      gutterSize="none"
      direction="column"
    >
      <EuiFlexItem className="workpadApp__header" grow={false}>
        <WorkpadHeader commit={commit} />
      </EuiFlexItem>
      <EuiFlexItem className="workpadApp__body">
        <div className="workpadApp__actions">
          <EuiButton
            className={classnames({
              workpadApp__actionButton: true,
              workpadApp__expressionPanelButton: true,
            })}
            style={{
              display: isElementSelected && showExpressionPanel === false ? 'block' : 'none',
            }}
            iconType="visVega"
            onClick={() => {
              setShowExpressionPanel(true);
            }}
          >
            Expression
          </EuiButton>
          <LayerSelector
            className="workpadApp__layerSelector"
            onSelectNode={(id: string) => {
              if (!showSidebar && !id.includes('group')) {
                setShowSidebar(true);
              }
            }}
            onSelectWorkpad={() => {
              deselectElement();
              setShowWorkpadSettings(true);
            }}
          />
        </div>
        <EuiFlexGroup gutterSize="none" direction="row" alignItems="stretch">
          <EuiFlexItem className="workpadApp__pageManager" grow={false}>
            <PageSidebar
              onToggle={(isExpanded) => setShowPageManager(isExpanded)}
              isExpanded={showPageManager}
            />
          </EuiFlexItem>
          <EuiFlexItem className="workpadApp__stage">
            <EuiFlexGroup gutterSize="none" direction="column">
              <EuiFlexItem
                id={CANVAS_LAYOUT_STAGE_CONTENT_SELECTOR}
                className="workpadApp__stageContent"
                onMouseDown={deselectElement}
              >
                {/* NOTE: canvasWorkpadContainer is used for exporting */}
                <div className="workpadApp__stageOverflow canvasWorkpadContainer">
                  <Workpad registerLayout={registerLayout} unregisterLayout={unregisterLayout} />
                </div>
              </EuiFlexItem>
              <EuiFlexItem className="workpadApp__expressionPanel" grow={false}>
                <ExpressionPanel
                  isVisible={showExpressionPanel}
                  onClose={() => setShowExpressionPanel(false)}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem className="workpadApp__sidebar" grow={false}>
            <Sidebar
              commit={commit}
              isVisible={showSidebar}
              onClose={() => setShowSidebar(false)}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
