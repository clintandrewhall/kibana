/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable @typescript-eslint/naming-convention */
import React, { FC, ReactElement, useState, MouseEvent } from 'react';
import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiIcon, IconType } from '@elastic/eui';
import classnames from 'classnames';

import { elementSpecs } from '../../../canvas_plugin_src/elements';
import { NodeInfoGroup, NodeInfoElement } from '../../../types';

const specs = elementSpecs.map((spec) => {
  const { icon, displayName, name } = spec();
  return { icon, displayName, name };
});

interface ItemProps {
  name: string;
  className?: string;
  iconType?: IconType | null;
  isSelected?: boolean;
  leftButton?: ReactElement;
  rightButton?: ReactElement;
  onClick?: () => void;
  onFocus?: () => void;
}

export const LayerSelectorItem: FC<ItemProps> = ({
  className,
  name,
  iconType,
  isSelected = false,
  leftButton,
  rightButton,
  children,
  onClick = () => {},
  onFocus = () => {},
}) => (
  <li
    className={classnames(
      {
        'layerSelector__item--selected': isSelected,
      },
      'layerSelector__item',
      className
    )}
  >
    <a
      onClick={onClick}
      className="layerSelector__anchor"
      onFocus={onFocus}
      onMouseEnter={() => onFocus()}
    >
      <EuiFlexGroup alignItems="center" gutterSize="none" component="span">
        {leftButton ? (
          <EuiFlexItem grow={false} className="layerSelector__left" component="span">
            {leftButton}
          </EuiFlexItem>
        ) : null}
        {iconType ? (
          <EuiFlexItem grow={false} className="layerSelector__icon" component="span">
            <EuiIcon color="text" type={iconType || 'empty'} />
          </EuiFlexItem>
        ) : null}
        <EuiFlexItem className="layerSelector__name" component="span">
          {name}
        </EuiFlexItem>
        <EuiFlexItem grow={false} className="layerSelector__right" component="span">
          {rightButton}
        </EuiFlexItem>
      </EuiFlexGroup>
    </a>
    {children}
  </li>
);

const isNodeInfoGroup = (node: NodeInfoGroup | NodeInfoElement): node is NodeInfoGroup =>
  (node as NodeInfoGroup).type === 'group';

interface CommonProps {
  selectedNodes?: string[];
  onSelectNode: (id: string) => void;
  onHoverNode: (id: string) => void;
}

interface GroupProps extends CommonProps {
  node: NodeInfoGroup;
}

const LayerSelectorGroup: FC<GroupProps> = ({
  node,
  onSelectNode,
  onHoverNode,
  selectedNodes = [],
  ...rest
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const iconType = null;
  const name = 'Group';

  const leftButton = (
    <EuiButtonIcon
      color="text"
      onClick={(e: MouseEvent) => {
        setIsExpanded(!isExpanded);
        e.stopPropagation();
      }}
      iconType={isExpanded ? 'arrowDown' : 'arrowRight'}
      aria-label="Expand"
    />
  );

  const onClick = () => onSelectNode(node.id);
  const onFocus = () => onHoverNode(node.id);

  return (
    <LayerSelectorItem
      className="layerSelector__group"
      isSelected={selectedNodes.includes(node.id)}
      {...{ name, iconType, leftButton, onClick, onFocus }}
    >
      {isExpanded ? (
        <ol className="layerSelector_list">
          {node.children.map((child) => (
            <LayerSelectorNodeItem
              key={child.id}
              {...{ node: child, onSelectNode, onHoverNode, selectedNodes, ...rest }}
            />
          ))}
        </ol>
      ) : null}
    </LayerSelectorItem>
  );
};

interface ElementProps extends CommonProps {
  node: NodeInfoElement;
}

const LayerSelectorElement: FC<ElementProps> = ({
  selectedNodes = [],
  node,
  onSelectNode,
  onHoverNode,
}) => {
  const { as, id } = node;
  const match = specs.find((spec) => spec.name === as);
  const iconType = match?.icon || null;
  const name = match?.displayName || as;
  const isSelected = selectedNodes.includes(node.id);

  const rightButton = isSelected ? (
    <EuiIcon color="text" type="pencil" aria-label="Editing" />
  ) : undefined;

  const onClick = () => onSelectNode(id);
  const onFocus = () => onHoverNode(id);

  return (
    <LayerSelectorItem
      className="layerSelector__element"
      {...{ name, iconType, rightButton, onClick, onFocus, isSelected }}
    />
  );
};

interface NodeItemProps extends CommonProps {
  node: NodeInfoGroup | NodeInfoElement;
}

export const LayerSelectorNodeItem: FC<NodeItemProps> = ({ node, ...rest }) =>
  isNodeInfoGroup(node) ? (
    <LayerSelectorGroup {...{ node, ...rest }} />
  ) : (
    <LayerSelectorElement {...{ node, ...rest }} />
  );
