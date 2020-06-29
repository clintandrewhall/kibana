/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from '../../../components/sidebar';
// @ts-expect-error untyped local
import { Workpad } from '../../../components/workpad';
import { WorkpadHeader } from '../../../components/workpad_header';
import { PageSidebar } from '../../../components/page_sidebar';
import { CANVAS_LAYOUT_STAGE_CONTENT_SELECTOR } from '../../../../common/lib/constants';

export const WORKPAD_CONTAINER_ID = 'canvasWorkpadContainer';

interface Props {
  isWriteable: boolean;
  deselectElement?: () => void;
}

export class WorkpadApp extends PureComponent<Props> {
  static propTypes = {
    isWriteable: PropTypes.bool.isRequired,
    deselectElement: PropTypes.func,
  };

  public state = {
    showConfigSidebar: true,
    showPageSidebar: true,
  };

  interactivePageLayout: ((type: string, payload: any) => any) | null = null; // future versions may enable editing on multiple pages => use array then

  registerLayout(newLayout: (type: string, payload: any) => any) {
    if (this.interactivePageLayout !== newLayout) {
      this.interactivePageLayout = newLayout;
    }
  }

  unregisterLayout(oldLayout: (type: string, payload: any) => any) {
    if (this.interactivePageLayout === oldLayout) {
      this.interactivePageLayout = null;
    }
  }

  render() {
    const { isWriteable, deselectElement } = this.props;
    const commit = this.interactivePageLayout || (() => {});
    const { showPageSidebar, showConfigSidebar } = this.state;

    return (
      <div className="canvasLayout">
        <div className="canvasLayout__rows">
          <div className="canvasLayout__cols">
            {showPageSidebar ? <PageSidebar /> : null}
            <div className="canvasLayout__stage">
              <div className="canvasLayout__stageHeader">
                {/* @ts-expect-error All of this is messed up */}
                <WorkpadHeader
                  {...{ commit, showConfigSidebar, showPageSidebar }}
                  onToggleConfigSidebar={() =>
                    this.setState({ showConfigSidebar: !showConfigSidebar })
                  }
                  onTogglePageSidebar={() => this.setState({ showPageSidebar: !showPageSidebar })}
                />
              </div>
              <div
                id={CANVAS_LAYOUT_STAGE_CONTENT_SELECTOR}
                className={CANVAS_LAYOUT_STAGE_CONTENT_SELECTOR}
                onMouseDown={deselectElement}
              >
                {/* NOTE: canvasWorkpadContainer is used for exporting */}
                <div
                  id={WORKPAD_CONTAINER_ID}
                  className="canvasWorkpadContainer canvasLayout__stageContentOverflow"
                >
                  <Workpad
                    registerLayout={this.registerLayout.bind(this)}
                    unregisterLayout={this.unregisterLayout.bind(this)}
                  />
                </div>
              </div>
            </div>
            {isWriteable && showConfigSidebar ? (
              <div className="canvasLayout__sidebar hide-for-sharing">
                <Sidebar commit={commit} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
