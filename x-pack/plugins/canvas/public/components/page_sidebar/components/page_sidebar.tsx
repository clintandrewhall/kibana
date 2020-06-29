/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FC } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiDragDropContext,
  EuiDroppable,
  EuiDraggable,
  DropResult,
} from '@elastic/eui';

import { CanvasPage } from '../../../../types';
import { PageSidebarHeader } from '../header';
import { PageSidebarPreview } from '../preview';
import { PageSidebarPager } from '../pager';

interface Props {
  pages: CanvasPage[];
  selectedPageId: string;
  onMovePage: (id: string, position: number) => void;
}

export const PageSidebar: FC<Props> = ({ pages, selectedPageId, onMovePage }) => {
  const onDragEnd = ({ source, destination }: DropResult) => {
    if (!destination) {
      return;
    }

    const { index: startIndex } = source;
    const { index: endIndex } = destination;

    const page = pages[startIndex];
    onMovePage(page.id, endIndex - startIndex);
  };

  const previews = pages.map((page, index) => {
    return (
      <EuiDraggable key={page.id} index={index} draggableId={page.id + '_drag'}>
        <PageSidebarPreview
          page={page}
          pageNumber={index + 1}
          isSelected={page.id === selectedPageId}
        />
      </EuiDraggable>
    );
  });

  return (
    <EuiFlexGroup className="canvasPageSidebar" direction="column" gutterSize="none">
      <EuiFlexItem grow={false}>
        <PageSidebarHeader />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiDragDropContext onDragEnd={onDragEnd}>
          <EuiDroppable droppableId="DROPPABLE_AREA" grow={true}>
            {previews}
          </EuiDroppable>
        </EuiDragDropContext>
      </EuiFlexItem>
      <EuiFlexItem grow={false} className="canvasPageSidebar__pager">
        <PageSidebarPager />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
