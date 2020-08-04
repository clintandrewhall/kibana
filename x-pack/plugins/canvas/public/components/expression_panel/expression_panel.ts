/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { connect } from 'react-redux';
import { canUserWrite } from '../../state/selectors/app';
import { getSelectedToplevelNodes, isWriteable } from '../../state/selectors/workpad';
import { State } from '../../../types';

import { ExpressionPanel as Component } from './expression_panel.component';

const mapStateToProps = (state: State) => {
  return {
    isWriteable: isWriteable(state) && canUserWrite(state),
    isNodeSelected: getSelectedToplevelNodes(state).length > 0,
  };
};

export const ExpressionPanel = connect(mapStateToProps)(Component);
