/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { EuiSuperSelect } from '@elastic/eui';
import { fonts, FontValue } from '../../../common/lib/fonts';

interface DisplayedFont {
  label: string;
  value: string;
}

interface BaseProps {
  clearable?: boolean;
}

interface RequiredProps extends BaseProps {
  onSelect: (value: DisplayedFont['value']) => void;
  value?: FontValue;
  clearable?: false;
}

interface ClearableProps extends BaseProps {
  onSelect: (value: DisplayedFont['value'] | null) => void;
  value?: FontValue | null;
  clearable: true;
}

type Props = RequiredProps | ClearableProps;

export const FontPicker: FC<Props> = (props) => {
  const { value, onSelect } = props;

  // While fonts are strongly-typed, we also support custom fonts someone might type in.
  // So let's cast the fonts and allow for additions.
  const displayedFonts: DisplayedFont[] = fonts;

  if (value && !fonts.find((font) => font.value === value)) {
    const label = (value.indexOf(',') >= 0 ? value.split(',')[0] : value).replace(/['"]/g, '');
    displayedFonts.push({ value, label });
    displayedFonts.sort((a, b) => a.label.localeCompare(b.label));
  }

  let options = displayedFonts.map((font) => ({
    value: font.value,
    inputDisplay: <div style={{ fontFamily: font.value }}>{font.label}</div>,
  }));

  let onFontChange = (newValue: DisplayedFont['value']) => onSelect && onSelect(newValue);

  if (props.clearable) {
    options = [{ value: 'None', inputDisplay: <div>None</div> }].concat(options);
    onFontChange = (newValue: DisplayedFont['value']) =>
      props.onSelect && props.onSelect(newValue === 'None' ? null : newValue);
  }

  return (
    <EuiSuperSelect
      compressed
      options={options}
      valueOfSelected={value || 'None'}
      onChange={onFontChange}
    />
  );
};

FontPicker.propTypes = {
  /** Function to execute when a Font is selected. */
  onSelect: PropTypes.func,
  /** Initial value of the Font Picker. */
  value: PropTypes.string,
};

FontPicker.displayName = 'FontPicker';
