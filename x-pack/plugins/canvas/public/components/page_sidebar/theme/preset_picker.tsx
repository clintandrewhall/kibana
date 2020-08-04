/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FC } from 'react';
import { find, isEqual } from 'lodash';

import { EuiSuperSelect, EuiText, EuiTitle } from '@elastic/eui';
import { getFixedLinearGradient, getLinearGradient } from '../utils';

import {
  paulTor14,
  elasticPurple,
  helveticaNeue,
  baskerville,
  canvas,
  openSans,
  ColorPalette,
  Font,
} from '../../../../common/lib';
import { CanvasWorkpadTheme } from '../../../../types';

interface ThemePreset {
  name: string;
  description: string;
  theme: {
    palette: ColorPalette;
    font: {
      family: Font;
      size: number;
    };
  };
}

const presets: ThemePreset[] = [
  {
    name: 'Canvas',
    description: 'A theme for Canvas.',
    theme: {
      palette: paulTor14,
      font: {
        family: openSans,
        size: 12,
      },
    },
  },
  {
    name: 'Classic',
    description: 'A class theme; works well with presentations.',
    theme: {
      palette: canvas,
      font: {
        family: baskerville,
        size: 14,
      },
    },
  },
  {
    name: 'Modern',
    description: 'A modern theme; works well with reports.',
    theme: {
      palette: elasticPurple,
      font: {
        family: helveticaNeue,
        size: 12,
      },
    },
  },
];

interface Props {
  selectedTheme: CanvasWorkpadTheme | null;
  setWorkpadTheme: (theme: CanvasWorkpadTheme | null) => void;
}

export const PresetPicker: FC<Props> = ({ selectedTheme, setWorkpadTheme }) => {
  const options = presets.map((preset) => {
    const { name, description, theme } = preset;
    const { palette, font } = theme;

    const { colors, gradient } = palette;
    const background = gradient ? getLinearGradient(colors) : getFixedLinearGradient(colors);

    const { family } = font;

    return {
      value: name,
      inputDisplay: name,
      dropdownDisplay: (
        <div style={{ fontFamily: family.value, margin: '0 8px 0 0' }}>
          <EuiTitle size="xs">
            <strong>{name}</strong>
          </EuiTitle>
          <EuiText color="subdued">{description}</EuiText>
          <div style={{ margin: '8px 0 4px 0', background, height: 8 }} />
        </div>
      ),
    };
  });

  const match = find(presets, (preset) => isEqual(preset.theme, selectedTheme)) || null;

  return (
    <EuiSuperSelect
      compressed
      options={options}
      valueOfSelected={match?.name}
      onChange={(name) => {
        const selected = find(presets, { name });
        setWorkpadTheme(selected?.theme || null);
      }}
      itemLayoutAlign="top"
      hasDividers
    />
  );
};
