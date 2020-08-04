/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {
  getNodeInfoTree,
  getWorkpadName,
  getSelectedToplevelNodes,
} from '../../state/selectors/workpad';
// @ts-expect-error untyped local
import { selectToplevelNodes } from '../../state/actions/transient';
import { State } from '../../../types';
import { LayerSelector as Component } from './layer_selector.component';

interface Props {
  onSelectNode: (elementId: string) => void;
}

const mapStateToProps = (state: State, ownProps: Props) => ({
  nodeInfoTree: getNodeInfoTree(state),
  workpadName: getWorkpadName(state),
  selectedNodes: getSelectedToplevelNodes(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onSelectNode: (elementId: string) => dispatch(selectToplevelNodes([elementId])),
  onDeselectNode: () => dispatch(selectToplevelNodes([])),
});

export const LayerSelector = connect(
  mapStateToProps,
  mapDispatchToProps,
  (stateProps, dispatchProps, ownProps) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    onSelectNode: (elementId: string) => {
      ownProps.onSelectNode(elementId);
      dispatchProps.onSelectNode(elementId);
    },
  })
)(Component);
