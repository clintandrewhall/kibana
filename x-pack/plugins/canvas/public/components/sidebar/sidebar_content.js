/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { connect } from 'react-redux';
import { compose, branch, renderComponent } from 'recompose';
import { EuiSpacer, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { getSelectedToplevelNodes, getSelectedElementId } from '../../state/selectors/workpad';
import { SidebarHeader } from '../sidebar_header';
import { ComponentStrings } from '../../../i18n';
import { MultiElementSettings } from './multi_element_settings';
import { GroupSettings } from './group_settings';
import { GlobalConfig } from './global_config';
import { ElementSettings } from './element_settings';

const { SidebarContent: strings } = ComponentStrings;

const mapStateToProps = (state) => ({
  selectedToplevelNodes: getSelectedToplevelNodes(state),
  selectedElementId: getSelectedElementId(state),
});

const MultiElementSidebar = () => (
  <EuiFlexGroup direction="column" gutterSize="none">
    <EuiFlexItem grow={false}>
      <SidebarHeader title={strings.getMultiElementSidebarTitle()} />
    </EuiFlexItem>
    <EuiSpacer />
    <EuiFlexItem>
      <MultiElementSettings />
    </EuiFlexItem>
  </EuiFlexGroup>
);

const GroupedElementSidebar = () => (
  <EuiFlexGroup direction="column" gutterSize="none">
    <EuiFlexItem grow={false}>
      <SidebarHeader title={strings.getGroupedElementSidebarTitle()} groupIsSelected />
    </EuiFlexItem>
    <EuiSpacer />
    <EuiFlexItem>
      <GroupSettings />
    </EuiFlexItem>
  </EuiFlexGroup>
);

const SingleElementSidebar = ({ selectedElementId }) => (
  <EuiFlexGroup direction="column" gutterSize="none">
    <EuiFlexItem grow={false}>
      <SidebarHeader title={strings.getSingleElementSidebarTitle()} showLayerControls />
    </EuiFlexItem>
    <EuiFlexItem>
      <ElementSettings selectedElementId={selectedElementId} />
    </EuiFlexItem>
  </EuiFlexGroup>
);

const branches = [
  // multiple elements are selected
  branch(
    ({ selectedToplevelNodes }) => selectedToplevelNodes.length > 1,
    renderComponent(MultiElementSidebar)
  ),
  // a single, grouped element is selected
  branch(
    ({ selectedToplevelNodes }) =>
      selectedToplevelNodes.length === 1 && selectedToplevelNodes[0].includes('group'),
    renderComponent(GroupedElementSidebar)
  ),
  // a single element is selected
  branch(
    ({ selectedToplevelNodes }) => selectedToplevelNodes.length === 1,
    renderComponent(SingleElementSidebar)
  ),
];

export const SidebarContent = compose(connect(mapStateToProps), ...branches)(GlobalConfig);
