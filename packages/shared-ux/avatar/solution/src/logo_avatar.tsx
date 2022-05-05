/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { DistributiveOmit } from '@elastic/eui';
import { EuiIconType } from '@elastic/eui/src/components/icon/icon';
import { Avatar, AvatarProps } from './avatar';

type FilterStartingWith<Set, Needle extends string> = Set extends `${Needle}${infer _X}`
  ? Set
  : never;

type ExtractLogoName<LogoString extends string> = LogoString extends `logo${infer Solution}`
  ? Solution
  : { error: 'Cannot parse logo' };

type LogoNameType = ExtractLogoName<FilterStartingWith<EuiIconType, 'logo'>>;

export type KibanaLogoAvatarProps = DistributiveOmit<AvatarProps, 'iconType' | 'name'> & {
  name?: string;
  solution: LogoNameType;
};

export const KibanaLogoAvatar = ({ solution, name, ...rest }: KibanaLogoAvatarProps) => {
  // @ts-expect-error I don't know why TS is complaining about imageUrl here.
  return <Avatar name={name || solution} iconType={`logo${solution}`} {...rest} />;
};
