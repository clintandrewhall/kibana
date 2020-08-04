/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  API_ROUTE_WORKPAD,
  API_ROUTE_WORKPAD_ASSETS,
  API_ROUTE_WORKPAD_STRUCTURES,
  DEFAULT_WORKPAD_CSS,
} from '../../common/lib/constants';
import { fetch } from '../../common/lib/fetch';
import { platformService } from '../services';
import { CanvasWorkpad, CanvasAsset } from '../../types';

/*
  Remove any top level keys from the workpad which will be rejected by validation
*/
const validKeys = [
  '@created',
  '@timestamp',
  'assets',
  'colors',
  'css',
  'variables',
  'height',
  'id',
  'isWriteable',
  'name',
  'page',
  'pages',
  'width',
  'theme',
];

const sanitizeWorkpad = function (workpad: CanvasWorkpad): Partial<CanvasWorkpad> {
  const workpadKeys = Object.keys(workpad) as Array<keyof CanvasWorkpad>;

  for (const key of workpadKeys) {
    if (!validKeys.includes(key)) {
      delete workpad[key];
    }
  }

  return workpad;
};

const getApiPath = () => {
  const basePath = platformService.getService().getBasePath();
  return `${basePath}${API_ROUTE_WORKPAD}`;
};

const getApiPathStructures = () => {
  const basePath = platformService.getService().getBasePath();
  return `${basePath}${API_ROUTE_WORKPAD_STRUCTURES}`;
};

const getApiPathAssets = () => {
  const basePath = platformService.getService().getBasePath();
  return `${basePath}${API_ROUTE_WORKPAD_ASSETS}`;
};

export const create = async (workpad: CanvasWorkpad) =>
  fetch.post(getApiPath(), {
    ...sanitizeWorkpad({ ...workpad }),
    assets: workpad.assets || {},
    variables: workpad.variables || [],
  });

export async function createFromTemplate(templateId: string) {
  return fetch.post(getApiPath(), {
    templateId,
  });
}

export const get = async (workpadId: string) =>
  fetch.get(`${getApiPath()}/${workpadId}`).then(({ data: workpad }) => {
    // shim old workpads with new properties
    return { css: DEFAULT_WORKPAD_CSS, variables: [], ...workpad };
  });

// TODO: I think this function is never used.  Look into and remove the corresponding route as well
export const update = async (id: string, workpad: CanvasWorkpad) =>
  fetch.put(`${getApiPath()}/${id}`, sanitizeWorkpad({ ...workpad }));

export const updateWorkpad = async (id: string, workpad: CanvasWorkpad) =>
  fetch.put(`${getApiPathStructures()}/${id}`, sanitizeWorkpad({ ...workpad }));

export const updateAssets = async (id: string, workpadAssets: CanvasAsset[]) =>
  fetch.put(`${getApiPathAssets()}/${id}`, workpadAssets);

export const remove = async (id: string) => fetch.delete(`${getApiPath()}/${id}`);

export const find = async (searchTerm: string) => {
  const validSearchTerm = typeof searchTerm === 'string' && searchTerm.length > 0;

  return fetch
    .get(`${getApiPath()}/find?name=${validSearchTerm ? searchTerm : ''}&perPage=10000`)
    .then(({ data: workpads }) => workpads);
};
