/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable @typescript-eslint/naming-convention */

import React, { FC, MouseEvent, useState } from 'react';
import { EuiButtonIcon, EuiButtonEmpty, EuiPopover } from '@elastic/eui';
// @ts-expect-error untyped dependency
import Style from 'style-it';
import classnames from 'classnames';

import { usePagination } from './use_pagination';
import { DomPreview } from '../../dom_preview';
import { CanvasPage } from '../../../../types';

type PageClickHandler = (pageIndex: number) => void;

interface Props {
  pages: CanvasPage[];
  selectedPageId: string;
  onPageClick?: PageClickHandler;
  workpadCSS: string;
}

const WIDTH = 200;

export const PageSidebarPager: FC<Props> = ({
  pages,
  selectedPageId,
  onPageClick = () => {},
  workpadCSS,
}) => {
  const pageCount = pages.length;

  let selectedPageNumber = 1;
  pages.forEach((page, index) => {
    if (page.id === selectedPageId) {
      selectedPageNumber = index;
    }
  });

  const Button = ({ pageIndex, inList = true }: { pageIndex: number; inList?: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isActive = pageIndex === activePage;
    const { id } = pages[pageIndex];

    const button = (
      <EuiButtonEmpty
        className="canvasPageSidebarPager__button"
        color="text"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={(e: MouseEvent) => safeClick(e, pageIndex)}
      >
        {pageIndex + 1}
      </EuiButtonEmpty>
    );

    if (inList) {
      return (
        <li
          key={id}
          className={classnames('canvasPageSidebarPager__item', {
            'canvasPageSidebarPager__item--active': isActive,
          })}
        >
          <EuiPopover
            button={button}
            isOpen={isOpen}
            anchorPosition="rightCenter"
            closePopover={() => setIsOpen(false)}
          >
            {Style.it(workpadCSS, <DomPreview elementId={id} width={WIDTH} />)}
          </EuiPopover>
        </li>
      );
    }

    return button;
  };

  const [
    { activePage, selectablePageButtons, firstPageButtons, lastPageButtons },
    { setActivePage },
  ] = usePagination(Button, {
    pageCount,
    activePage: selectedPageNumber,
    maxVisiblePages: 3,
  });

  const safeClick = (e: MouseEvent, pageIndex: number) => {
    e.preventDefault();
    setActivePage(pageIndex);
    onPageClick(pageIndex);
  };

  const prevPageButtonProps = { disabled: activePage === 0 };

  const previousButton = (
    <EuiButtonIcon
      className="canvasPageSidebarPager__previousButton"
      onClick={(e: MouseEvent) => safeClick(e, activePage - 1)}
      iconType="arrowUp"
      color="text"
      {...prevPageButtonProps}
    />
  );

  const nextPageButtonProps = { disabled: activePage === pageCount - 1 };

  const nextButton = (
    <EuiButtonIcon
      className="canvasPageSidebarPager__nextButton"
      onClick={(e: MouseEvent) => safeClick(e, activePage + 1)}
      iconType="arrowDown"
      color="text"
      {...nextPageButtonProps}
    />
  );

  return (
    <nav className="canvasPageSidebarPager">
      {previousButton}
      <ul className="canvasPageSidebarPager__list">
        {firstPageButtons}
        {selectablePageButtons}
        {lastPageButtons}
      </ul>
      {nextButton}
    </nav>
  );
};
