/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FC } from 'react';
import { EuiTitle, EuiFormRow, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { PalettePicker } from '../../palette_picker';
import { ColorPalette, Font, getFontByValueString } from '../../../../common/lib';
import { FontPicker } from '../../font_picker';

interface Props {
  setWorkpadPalette: (palette: ColorPalette | null) => void;
  setWorkpadFontFamily: (font: Font | null) => void;
  palette: ColorPalette | null;
  fontFamily: Font | null;
}

export const WorkpadTheme: FC<Props> = ({
  setWorkpadPalette,
  palette,
  fontFamily,
  setWorkpadFontFamily,
}) => {
  const onFontSelect = (value: string | null) =>
    setWorkpadFontFamily(value ? getFontByValueString(value) : null);

  return (
    <div className="canvasWorkpadTheme">
      <EuiTitle size="xs">
        <h4>Workpad theme</h4>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiFlexGroup gutterSize="s">
        <EuiFlexItem>
          <EuiFormRow label="Color Palette" display="rowCompressed">
            <PalettePicker palette={palette} onChange={setWorkpadPalette} clearable={true} />
          </EuiFormRow>
          <EuiFormRow label="Font" display="rowCompressed">
            <FontPicker
              onSelect={onFontSelect}
              value={fontFamily?.value || null}
              clearable={true}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
};
