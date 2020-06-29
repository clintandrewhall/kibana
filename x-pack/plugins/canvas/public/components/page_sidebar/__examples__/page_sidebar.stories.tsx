/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { storiesOf } from '@storybook/react';
import { PageSidebar } from '../';
import { withRedux } from '../../../../.storybook/redux_context';
import { getDefaultWorkpad, getDefaultPage } from '../../../state/defaults';

const workpad = getDefaultWorkpad();
const { pages } = workpad;
pages.push(getDefaultPage());
pages.push(getDefaultPage());
workpad.pages = pages;

const addPages = (fn: Function) => (
  <div>
    <div style={{ position: 'absolute', visibility: 'hidden' }}>
      {pages.map((page, index) => (
        <div
          key={'page_' + page.id}
          id={page.id}
          style={{ height: 75, width: 100, textAlign: 'center', paddingTop: 28 }}
        >
          Page {index}
        </div>
      ))}
    </div>
    {fn()}
  </div>
);

class MockLinkContext extends React.Component {
  static childContextTypes = {
    router: PropTypes.object.isRequired,
  };

  getChildContext() {
    return {
      router: {
        getFullPath: () => 'path',
        create: () => '',
        navigateTo: () => {},
      },
    };
  }
  render() {
    return <div>{this.props.children}</div>;
  }
}

const addDecorator = (fn: Function) => (
  <MockLinkContext>
    <div
      style={{
        minHeight: '300px',
        display: 'flex',
        alignItems: 'stretch',
        flexGrow: 1,
      }}
    >
      {fn()}
    </div>
  </MockLinkContext>
);

storiesOf('components/PageSidebar', module)
  .addDecorator(withRedux(workpad))
  .addDecorator(addPages)
  .addDecorator(addDecorator)
  .add('default', () => <PageSidebar />);
