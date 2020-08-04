/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FC, useState } from 'react';

import {
  EuiPopover,
  EuiToolTip,
  EuiButtonIcon,
  EuiTitle,
  EuiFormRow,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiSelect,
} from '@elastic/eui';

import { PalettePicker } from '../../palette_picker';
import { FontPicker } from '../../font_picker';
import { PresetPicker } from './preset_picker';
import { ColorPalette, Font, getFontByValueString } from '../../../../common/lib';
import { CanvasWorkpadTheme } from '../../../../types';

interface Props {
  setWorkpadPalette: (palette: ColorPalette | null) => void;
  setWorkpadFontFamily: (font: Font | null) => void;
  setWorkpadFontSize: (size: number | null) => void;
  setWorkpadTheme: (theme: CanvasWorkpadTheme | null) => void;
  theme: CanvasWorkpadTheme | null;
  docked?: boolean;
}

export const fontSizes = [0, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96];

export const PageSidebarThemePopover: FC<Props> = ({
  setWorkpadPalette,
  setWorkpadFontFamily,
  setWorkpadTheme,
  setWorkpadFontSize,
  theme,
  docked = false,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const onButtonClick = () => setIsPopoverOpen(() => !isPopoverOpen);
  const closePopover = () => setIsPopoverOpen(false);

  const onFontSelect = (value: string | null) =>
    setWorkpadFontFamily(value ? getFontByValueString(value) : null);

  let button = (
    <EuiButtonIcon
      color="text"
      iconType="brush"
      onClick={onButtonClick}
      aria-label="Edit workpad theme"
    />
  );

  if (!isPopoverOpen) {
    button = (
      <EuiToolTip position="bottom" content={<span>Edit workpad theme</span>}>
        {button}
      </EuiToolTip>
    );
  }

  return (
    <EuiPopover
      button={button}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      anchorPosition={docked ? 'rightUp' : 'downLeft'}
    >
      <div style={{ minWidth: 300 }}>
        <EuiTitle size="xs">
          <h4>Theme</h4>
        </EuiTitle>
        <EuiSpacer size="m" />
        <EuiFlexGroup gutterSize="s">
          <EuiFlexItem>
            <EuiFormRow label="Preset" display="rowCompressed">
              <PresetPicker {...{ setWorkpadTheme, selectedTheme: theme }} />
            </EuiFormRow>
            <EuiFormRow label="Color Palette" display="rowCompressed">
              <PalettePicker
                palette={theme?.palette || null}
                onChange={setWorkpadPalette}
                clearable={true}
              />
            </EuiFormRow>
            <EuiFormRow label="Font" display="rowCompressed">
              <EuiFlexGroup gutterSize="s">
                <EuiFlexItem>
                  <FontPicker
                    onSelect={onFontSelect}
                    value={theme?.font?.family?.value || null}
                    clearable={true}
                  />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiSelect
                    compressed
                    value={theme?.font?.size || 14}
                    onChange={(e) => setWorkpadFontSize(Number(e.target.value))}
                    options={fontSizes.map((size) => ({ text: String(size), value: size }))}
                    prepend="Size"
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    </EuiPopover>
  );
};
