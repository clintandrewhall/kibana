/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';

class TextService {
  public breadcrumbs: { [key: string]: string } = {};

  public init(): void {
    this.breadcrumbs = {
      home: i18n.translate('xpack.transform.home.breadcrumbTitle', {
        defaultMessage: 'Transforms',
      }),
      cloneTransform: i18n.translate('xpack.transform.cloneTransform.breadcrumbTitle', {
        defaultMessage: 'Clone transform',
      }),
      createTransform: i18n.translate('xpack.transform.createTransform.breadcrumbTitle', {
        defaultMessage: 'Create transform',
      }),
    };
  }

  public getSizeNotationHelpText() {
    return i18n.translate('xpack.transform.transformForm.sizeNotationPlaceholder', {
      defaultMessage: 'Examples: {example1}, {example2}, {example3}, {example4}',
      values: {
        example1: '1g',
        example2: '10mb',
        example3: '5k',
        example4: '1024B',
      },
    });
  }
}

export const textService = new TextService();
