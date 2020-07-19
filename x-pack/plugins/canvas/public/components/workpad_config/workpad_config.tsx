/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { connect } from 'react-redux';

import { get } from 'lodash';
import { setName, updateWorkpadVariables } from '../../state/actions/workpad';

import { getWorkpad } from '../../state/selectors/workpad';
import { WorkpadConfig as Component } from './workpad_config.component';
import { State, CanvasVariable } from '../../../types';

export const WorkpadConfig = connect(
  (state: State) => {
    const workpad = getWorkpad(state);

    return {
      name: get(workpad, 'name'),
      variables: get(workpad, 'variables', []),
    };
  },
  {
    setName,
    setWorkpadVariables: (vars: CanvasVariable[]) => updateWorkpadVariables(vars),
  }
)(Component);
