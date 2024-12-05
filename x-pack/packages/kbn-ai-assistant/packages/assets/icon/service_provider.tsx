/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';

import { EuiIcon, EuiIconProps, EuiText, EuiTextProps, ExclusiveUnion } from '@elastic/eui';
import {
  getServiceProvider,
  getReactComponentLogo,
  type ServiceProviderID,
  ServiceProvider,
} from '@kbn/ai-service-providers';

import { useStyles } from './service_provider.styles';

type TextSize = EuiTextProps['size'];

interface BaseServiceProviderIconProps extends Omit<EuiIconProps, 'type'> {
  id: ServiceProviderID;
  name: string;
  textSize?: TextSize;
}

type ServiceProviderByIdProps = Omit<BaseServiceProviderIconProps, 'name'>;

interface ServiceProviderByProviderProps extends Omit<BaseServiceProviderIconProps, 'id' | 'name'> {
  provider: ServiceProvider;
}

const BaseServiceProviderIcon = ({
  id,
  name,
  size = 'l',
  textSize = 's',
  ...rest
}: BaseServiceProviderIconProps) => {
  const { root } = useStyles();
  const type = getReactComponentLogo(id);

  return (
    <div css={root}>
      <EuiIcon {...{ type, size, ...rest }} />
      <EuiText size={textSize} color="subdued">
        {name}
      </EuiText>
    </div>
  );
};

export type ServiceProviderIconProps = ExclusiveUnion<
  ServiceProviderByIdProps,
  ServiceProviderByProviderProps
>;

export const ServiceProviderIcon = ({
  id: idProp,
  provider: providerProp,
  ...rest
}: ServiceProviderIconProps) => {
  const { id, name } = providerProp ?? getServiceProvider(idProp);

  return <BaseServiceProviderIcon {...{ id, name, ...rest }} />;
};
