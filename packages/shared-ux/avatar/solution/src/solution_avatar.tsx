/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
import './solution_avatar.scss';

import React from 'react';

import { Avatar, AvatarProps } from './avatar';
import { KibanaAppAvatar, KibanaAppAvatarProps } from './app_avatar';
import { KibanaLogoAvatar, KibanaLogoAvatarProps } from './logo_avatar';

const isLogo = (props: any): props is KibanaLogoAvatarProps => {
  return typeof props.logo !== 'undefined';
};

const isApp = (props: any): props is KibanaAppAvatarProps => {
  return typeof props.app !== 'undefined';
};

export type KibanaSolutionAvatarProps = KibanaLogoAvatarProps | KibanaAppAvatarProps | AvatarProps;

export const KibanaSolutionAvatar = (props: KibanaSolutionAvatarProps) => {
  if (isLogo(props)) {
    return <KibanaLogoAvatar {...props} />;
  }

  if (isApp(props)) {
    return <KibanaAppAvatar {...props} />;
  }

  return <Avatar {...props} />;
};
