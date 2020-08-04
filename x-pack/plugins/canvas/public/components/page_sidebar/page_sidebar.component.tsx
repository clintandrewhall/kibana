/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FC, useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiDragDropContext,
  EuiDroppable,
  EuiDraggable,
  DropResult,
} from '@elastic/eui';
import classnames from 'classnames';

import { CanvasPage } from '../../../types';
import { PageSidebarHeader } from './header';
import { PageSidebarPreview } from './preview';
import { PageSidebarPager } from './pager';

interface Props {
  pages: CanvasPage[];
  selectedPageId: string;
  onMovePage: (id: string, position: number) => void;
  isExpanded: boolean;
  onToggle: (isExpanded: boolean) => void;
  onSetPage: (pageIndex: number) => void;
}

export const PageSidebar: FC<Props> = ({
  pages,
  selectedPageId,
  onMovePage,
  isExpanded: isExpandedProp,
  onToggle: onToggleProp,
  onSetPage,
}) => {
  const [isExpanded, setIsExpanded] = useState(isExpandedProp);

  let content = null;

  const onToggle = (isExpandedArg: boolean) => {
    setIsExpanded(isExpandedArg);
    onToggleProp(isExpandedArg);
  };

  if (isExpanded) {
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

    content = (
      <EuiDragDropContext onDragEnd={onDragEnd}>
        <EuiDroppable droppableId="DROPPABLE_AREA" grow={true}>
          {previews}
        </EuiDroppable>
      </EuiDragDropContext>
    );
  } else {
    content = <PageSidebarPager onPageClick={onSetPage} />;
  }

  return (
    <EuiFlexGroup
      className={classnames('canvasPageSidebar', { 'canvasPageSidebar--expanded': isExpanded })}
      direction="column"
      gutterSize="none"
    >
      <EuiFlexItem grow={false}>
        <PageSidebarHeader {...{ onToggle, isExpanded }} />
      </EuiFlexItem>
      <EuiFlexItem className={isExpanded ? 'canvasPageSidebar__pageList' : ''}>
        {content}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
