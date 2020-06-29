/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { connect } from 'react-redux';

import { getWorkpad, getSelectedPageIndex } from '../../state/selectors/workpad';
import { State } from '../../../types';

import { PageSidebarPager as Component } from './components/pager';

const mapStateToProps = (state: State) => ({
  totalPages: getWorkpad(state).pages.length,
  selectedPage: getSelectedPageIndex(state) + 1,
  workpadId: getWorkpad(state).id,
});

export const PageSidebarPager = connect(mapStateToProps)(Component);
