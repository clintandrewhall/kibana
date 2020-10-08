/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FC } from 'react';
import PropTypes from 'prop-types';

export const SidebarSection: FC = ({ children }) => (
  <div className="canvasSidebar__panel">{children}</div>
);

SidebarSection.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  tip: PropTypes.string,
};
