/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { ReactElement, useState } from 'react';

export interface PaginationButtonProps {
  pageIndex: number;
  inList?: boolean;
}

export type PaginationButton = (props: PaginationButtonProps) => ReactElement;

interface Props {
  pageCount: number;
  activePage: number;
  maxVisiblePages?: number;
}

const MAX_VISIBLE_PAGES = 5;

type Hook = (
  Button: PaginationButton,
  { pageCount, activePage }: Props
) => [
  {
    activePage: number;
    firstPageButtons: ReactElement[];
    selectablePageButtons: ReactElement[];
    lastPageButtons: ReactElement[];
  },
  { setActivePage: (page: number) => void }
];

export const usePagination: Hook = (
  Button,
  { pageCount = 1, activePage: activePageProp = 1, maxVisiblePages = MAX_VISIBLE_PAGES }
) => {
  const NUMBER_SURROUNDING_PAGES = Math.floor(maxVisiblePages * 0.5);
  const [activePage, setActivePage] = useState(activePageProp);
  const selectablePageButtons: ReactElement[] = [];
  const firstPageInRange = Math.max(
    0,
    Math.min(activePage - NUMBER_SURROUNDING_PAGES, pageCount - maxVisiblePages)
  );
  const lastPageInRange = Math.min(pageCount, firstPageInRange + maxVisiblePages);

  for (let i = firstPageInRange, index = 0; i < lastPageInRange; i++, index++) {
    selectablePageButtons.push(<Button pageIndex={i} key={i} />);
  }

  const firstPageButtons = [];

  if (firstPageInRange > 0) {
    firstPageButtons.push(<Button pageIndex={0} key={0} />);

    if (firstPageInRange > 1 && firstPageInRange !== 2) {
      firstPageButtons.push(
        <li
          key="startingEllipses"
          className="euiPaginationButton-isPlaceholder euiPagination__item"
        >
          &hellip;
        </li>
      );
    } else if (firstPageInRange === 2) {
      firstPageButtons.push(<Button pageIndex={1} key={1} />);
    }
  }

  const lastPageButtons = [];

  if (lastPageInRange < pageCount) {
    if (lastPageInRange + 1 === pageCount - 1) {
      lastPageButtons.push(<Button pageIndex={lastPageInRange} key={lastPageInRange} />);
    } else if (lastPageInRange < pageCount - 1) {
      lastPageButtons.push(
        <li key="endingEllipses" className="euiPaginationButton-isPlaceholder euiPagination__item">
          &hellip;
        </li>
      );
    }

    lastPageButtons.push(<Button pageIndex={pageCount - 1} key={pageCount - 1} />);
  }

  return [
    { activePage, firstPageButtons, selectablePageButtons, lastPageButtons },
    { setActivePage },
  ];
};
