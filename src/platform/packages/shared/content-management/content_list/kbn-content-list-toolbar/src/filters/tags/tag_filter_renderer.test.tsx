/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Query } from '@elastic/eui';
import {
  ContentListProvider,
  type FindItemsResult,
  type FindItemsParams,
} from '@kbn/content-list-provider';
import type { ContentManagementTagsServices } from '@kbn/content-management-tags';
import { TagFilterRenderer } from './tag_filter_renderer';

const mockTags = [
  {
    id: 'tag-1',
    name: 'Production',
    description: 'Production items',
    color: '#FF0000',
    managed: false,
  },
  { id: 'tag-2', name: 'Development', description: 'Dev items', color: '#00FF00', managed: false },
  {
    id: 'tag-3',
    name: 'Archived',
    description: 'Archived items',
    color: '#808080',
    managed: false,
  },
];

const mockFindItems = jest.fn(
  async (_params: FindItemsParams): Promise<FindItemsResult> => ({
    items: [],
    total: 0,
  })
);

const mockTagsService: ContentManagementTagsServices = {
  getTagList: () => mockTags,
};

const createWrapper = (options?: { tagsService?: ContentManagementTagsServices }) => {
  const { tagsService } = options ?? {};
  return ({ children }: { children: React.ReactNode }) => (
    <ContentListProvider
      id="test-list"
      labels={{ entity: 'item', entityPlural: 'items' }}
      dataSource={{ findItems: mockFindItems }}
      services={tagsService ? { tags: tagsService } : undefined}
    >
      {children}
    </ContentListProvider>
  );
};

describe('TagFilterRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the tag filter button', () => {
    render(<TagFilterRenderer query={Query.parse('')} />, {
      wrapper: createWrapper({ tagsService: mockTagsService }),
    });

    expect(screen.getByText('Tags')).toBeInTheDocument();
  });

  it('renders nothing when tags service is not available', () => {
    const { container } = render(<TagFilterRenderer query={Query.parse('')} />, {
      wrapper: createWrapper(),
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('shows tag options when popover is opened', () => {
    render(<TagFilterRenderer query={Query.parse('')} />, {
      wrapper: createWrapper({ tagsService: mockTagsService }),
    });

    fireEvent.click(screen.getByText('Tags'));

    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('shows modifier hint text in the footer', () => {
    render(<TagFilterRenderer query={Query.parse('')} />, {
      wrapper: createWrapper({ tagsService: mockTagsService }),
    });

    fireEvent.click(screen.getByText('Tags'));

    // The modifier key tip displays platform-specific text.
    expect(screen.getByText(/\+ click exclude/)).toBeInTheDocument();
  });
});
