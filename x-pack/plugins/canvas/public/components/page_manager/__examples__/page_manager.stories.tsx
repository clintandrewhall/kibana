/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { CanvasPage } from '../../../../types';
import { PageManager } from '../page_manager';

const pages: CanvasPage[] = [
  {
    elements: [],
    groups: [],
    id: 'abc123',
    style: {
      background: '#FFF',
    },
    transition: {},
  },
  {
    elements: [],
    groups: [],
    id: 'def456',
    style: {
      background: '#000',
    },
    transition: {},
  },
];

class MockContext extends React.Component {
  static childContextTypes = {
    router: PropTypes.object.isRequired,
  };

  getChildContext() {
    return {
      router: {
        getFullPath: () => 'path',
        create: () => '',
      },
    };
  }
  render() {
    return <div>{this.props.children}</div>;
  }
}

storiesOf('components/PageManager', module).add('default', () => (
  <MockContext>
    <PageManager
      addPage={action('addPage')}
      duplicatePage={action('duplicatePage')}
      isWriteable={true}
      movePage={action('movePage')}
      pages={pages}
      previousPage={action('previousPage')}
      removePage={action('removePage')}
      setDeleteId={action('setDeleteId')}
      workpadId="workpadId"
    />
  </MockContext>
));
