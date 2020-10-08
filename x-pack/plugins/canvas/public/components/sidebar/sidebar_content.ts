/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { connect } from 'react-redux';
import { getSelectedToplevelNodes, getSelectedElement } from '../../state/selectors/workpad';
import { State } from '../../../types';
import { SidebarContent as SidebarContentComponent } from './sidebar_content.component';

const mapStateToProps = (state: State) => ({
  selectedToplevelNodes: getSelectedToplevelNodes(state),
  selectedElement: getSelectedElement(state) || null,
});

export const SidebarContent = connect(mapStateToProps)(SidebarContentComponent);
