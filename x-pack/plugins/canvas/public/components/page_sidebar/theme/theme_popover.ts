/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { connect } from 'react-redux';

import {
  setWorkpadPalette,
  setWorkpadFontFamily,
  setWorkpadTheme,
  setWorkpadFontSize,
} from '../../../state/actions/workpad';
import { getWorkpadTheme } from '../../../state/selectors/workpad';
import { PageSidebarThemePopover as Component } from './theme_popover.component';
import { State } from '../../../../types';

const mapStateToProps = (state: State) => {
  return {
    theme: getWorkpadTheme(state),
  };
};

const mapDispatchToProps = {
  setWorkpadPalette,
  setWorkpadFontFamily,
  setWorkpadTheme,
  setWorkpadFontSize,
};

export const PageSidebarThemePopover = connect(mapStateToProps, mapDispatchToProps)(Component);
