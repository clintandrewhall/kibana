/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable @typescript-eslint/naming-convention */

import React, { FC, useState } from 'react';
import { EuiButtonIcon, EuiPopover, EuiPopoverTitle, EuiButton } from '@elastic/eui';
import classnames from 'classnames';
import _ from 'lodash';

import { LayerSelectorNodeItem, LayerSelectorItem } from './layer_selector_item';
import { NodeInfoTree } from '../../../types';

interface Props {
  className?: string;
  isOpen?: boolean;
  nodeInfoTree: NodeInfoTree;
  onAddItem?: () => void;
  onHoverNode?: (id: string) => void;
  onSelectNode?: (id: string) => void;
  onSelectWorkpad?: () => void;
  selectedNodes?: string[];
  workpadName: string;
}

export const LayerSelector: FC<Props> = ({
  className,
  isOpen: isOpenProp = false,
  nodeInfoTree,
  onAddItem = () => {},
  onHoverNode = () => {},
  onSelectNode = () => {},
  onSelectWorkpad = () => {},
  selectedNodes = [],
  workpadName,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenProp);

  const list = (
    <ol className="layerSelector__root">
      <LayerSelectorItem
        className="layerSelector__workpadName"
        key="workpad"
        name={workpadName}
        iconType="gear"
        onClick={() => {
          onSelectWorkpad();
          setIsOpen(false);
        }}
      />
      {nodeInfoTree.map((node) => (
        <LayerSelectorNodeItem
          key={node.id}
          {...{
            node,
            onHoverNode,
            onSelectNode: (id: string) => {
              onSelectNode(id);
              setIsOpen(id.includes('group'));
            },
            selectedNodes,
          }}
        />
      ))}
    </ol>
  );

  const button = (
    <EuiButtonIcon
      size="s"
      className={classnames({
        layerSelector__button: true,
        'layerSelector__button--closed': !isOpen,
        'layerSelector__button--open': isOpen,
      })}
      iconType={isOpen ? 'menuRight' : 'menuLeft'}
      onClick={() => setIsOpen(!isOpen)}
    />
  );

  const addItem = (
    <EuiButton
      fill
      className="layerSelector__addItem"
      onClick={() => {
        onAddItem();
        setIsOpen(false);
      }}
    >
      Add Item
    </EuiButton>
  );

  return (
    <EuiPopover
      id="workpadLayerSelector"
      className={classnames(['layerSelector', className])}
      panelClassName="layerSelector__panel"
      button={button}
      isOpen={isOpen}
      closePopover={() => setIsOpen(!isOpen)}
      panelPaddingSize="none"
      anchorPosition="leftUp"
      hasArrow={false}
    >
      <EuiPopoverTitle>Items</EuiPopoverTitle>
      {list}
      {addItem}
      {button}
    </EuiPopover>
  );
};
