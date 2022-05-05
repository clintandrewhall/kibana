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

type FilterEndsWith<Set, Needle extends string> = Set extends `${infer _X}${Needle}` ? Set : never;

type ExtractAppName<AppString extends string> = AppString extends `${infer Solution}App`
  ? Solution
  : { error: 'Cannot parse app' };

type AppNameType = ExtractAppName<FilterEndsWith<EuiIconType, 'App'>>;

export type KibanaAppAvatarProps = DistributiveOmit<AvatarProps, 'iconType' | 'name'> & {
  name?: string;
  app: AppNameType;
};

export const KibanaAppAvatar = ({ app, name, ...rest }: KibanaAppAvatarProps) => {
  // @ts-expect-error I don't know why TS is complaining about imageUrl here.
  return <Avatar name={name || app} iconType={`${app}App`} {...rest} />;
};
