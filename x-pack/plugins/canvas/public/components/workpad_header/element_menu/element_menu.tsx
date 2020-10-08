/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { connect } from 'react-redux';
import { State, ElementSpec } from '../../../../types';
// @ts-expect-error untyped local
import { elementsRegistry } from '../../../lib/elements_registry';
import { ElementMenu as Component } from './element_menu.component';
// @ts-expect-error untyped local
import { addElement } from '../../../state/actions/elements';
import { getSelectedPage } from '../../../state/selectors/workpad';
import { AddEmbeddablePanel } from '../../embeddable_flyout';

export const ElementMenu = connect(
  (state: State) => ({
    pageId: getSelectedPage(state),
  }),
  (dispatch) => ({
    addElement: (pageId: string) => (element: ElementSpec) => dispatch(addElement(pageId, element)),
  }),
  (stateProps, dispatchProps) => ({
    ...stateProps,
    ...dispatchProps,
    addElement: dispatchProps.addElement(stateProps.pageId),
    // Moved this section out of the main component to enable stories
    renderEmbedPanel: (onClose: () => void) => <AddEmbeddablePanel onClose={onClose} />,
    elements: elementsRegistry.toJS(),
  })
)(Component);
