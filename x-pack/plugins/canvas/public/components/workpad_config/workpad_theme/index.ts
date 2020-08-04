/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { connect } from 'react-redux';

import { setWorkpadPalette, setWorkpadFontFamily } from '../../../state/actions/workpad';
import { getWorkpadPalette, getWorkpadFontFamily } from '../../../state/selectors/workpad';
import { WorkpadTheme as Component } from './workpad_theme';
import { State } from '../../../../types';

const mapStateToProps = (state: State) => {
  return {
    palette: getWorkpadPalette(state),
    fontFamily: getWorkpadFontFamily(state),
  };
};

const mapDispatchToProps = {
  setWorkpadPalette,
  setWorkpadFontFamily,
};

export const WorkpadTheme = connect(mapStateToProps, mapDispatchToProps)(Component);
