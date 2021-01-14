/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FC, ReactElement } from 'react';
import { EuiSpacer, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
// @ts-expect-error Untyped local
import { SidebarHeader } from '../sidebar_header';
import { ComponentStrings } from '../../../i18n';
import { MultiElementSettings } from './multi_element_settings';
import { GroupSettings } from './group_settings';
import { GlobalConfig } from './global_config';
import { ElementSettings } from './element_settings';
import { PlaceholderSettings } from './placeholder_settings';
import { CanvasElement } from '../../../types';
const { SidebarContent: strings } = ComponentStrings;

interface Props {
  selectedToplevelNodes: string[];
  selectedElement: CanvasElement | null;
}

export const SidebarContent: FC<Props> = ({ selectedToplevelNodes, selectedElement }) => {
  const nodeCount = selectedToplevelNodes.length;

  let title: string | null = null;
  let settings: ReactElement | null = null;
  let showLayerControls = false;

  const groupIsSelected = selectedToplevelNodes[0] && selectedToplevelNodes[0].includes('group');

  if (nodeCount > 1 || groupIsSelected) {
    title = strings.getMultiElementSidebarTitle();
    settings = <MultiElementSettings />;
  } else if (!selectedElement) {
    return <GlobalConfig />;
  }

  if (nodeCount === 1 && groupIsSelected) {
    title = strings.getGroupedElementSidebarTitle();
    settings = <GroupSettings />;
  } else if (nodeCount === 1 && selectedElement) {
    showLayerControls = true;
    // TODO: this is kind of weak, but I don't think we have any "what element is this?" utility at the moment.
    if (selectedElement.expression.includes('placeholder')) {
      title = strings.getPlaceholderElementSidebarTitle();
      settings = <PlaceholderSettings position={selectedElement.position} />;
    } else {
      title = strings.getSingleElementSidebarTitle();
      settings = <ElementSettings element={selectedElement} />;
    }
  }

  if (!title || !settings) {
    return <GlobalConfig />;
  }

  return (
    <EuiFlexGroup direction="column" gutterSize="none">
      <EuiFlexItem grow={false}>
        <SidebarHeader {...{ title, showLayerControls, groupIsSelected }} />
      </EuiFlexItem>
      <EuiSpacer />
      <EuiFlexItem>{settings}</EuiFlexItem>
    </EuiFlexGroup>
  );
};
