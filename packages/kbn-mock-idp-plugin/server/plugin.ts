/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { resolve } from 'path';

import type { CloudSetup } from '@kbn/cloud-plugin/server';
import { schema } from '@kbn/config-schema';
import type { TypeOf } from '@kbn/config-schema';
import type { Plugin, PluginInitializer } from '@kbn/core-plugins-server';
import {
  readRolesFromResource,
  SERVERLESS_ROLES_ROOT_PATH,
  STATEFUL_ROLES_ROOT_PATH,
} from '@kbn/es';
import { createSAMLResponse, MOCK_IDP_LOGIN_PATH, MOCK_IDP_LOGOUT_PATH } from '@kbn/mock-idp-utils';

export interface PluginSetupDependencies {
  cloud: CloudSetup;
}

const createSAMLResponseSchema = schema.object({
  username: schema.string(),
  full_name: schema.maybe(schema.nullable(schema.string())),
  email: schema.maybe(schema.nullable(schema.string())),
  roles: schema.arrayOf(schema.string()),
});

// BOOKMARK - List of Kibana project types
const projectToAlias = new Map<string, string>([
  ['observability', 'oblt'],
  ['security', 'security'],
  ['search', 'es'],
  // TODO add new 'chat' solution
  // https://elastic.slack.com/archives/C04HT4P1YS3/p1741690997400059
  // https://github.com/elastic/kibana/issues/213469
  // requires update of config/serverless.chat.yml (currently uses projectType 'search')
]);

const readServerlessRoles = (projectType: string) => {
  if (projectToAlias.has(projectType)) {
    const alias = projectToAlias.get(projectType)!;
    const rolesResourcePath = resolve(SERVERLESS_ROLES_ROOT_PATH, alias, 'roles.yml');
    return readRolesFromResource(rolesResourcePath);
  } else {
    throw new Error(`Unsupported projectType: ${projectType}`);
  }
};

const readStatefulRoles = () => {
  const rolesResourcePath = resolve(STATEFUL_ROLES_ROOT_PATH, 'roles.yml');
  return readRolesFromResource(rolesResourcePath);
};

export type CreateSAMLResponseParams = TypeOf<typeof createSAMLResponseSchema>;

export const plugin: PluginInitializer<
  void,
  void,
  PluginSetupDependencies
> = async (): Promise<Plugin> => ({
  setup(core, plugins: PluginSetupDependencies) {
    const router = core.http.createRouter();

    core.http.resources.register(
      {
        path: MOCK_IDP_LOGIN_PATH,
        validate: false,
        options: { authRequired: false },
        security: { authz: { enabled: false, reason: '' } },
      },
      async (context, request, response) => {
        return response.renderAnonymousCoreApp();
      }
    );

    // caching roles on the first call
    const roles: string[] = [];

    router.get(
      {
        path: '/mock_idp/supported_roles',
        validate: false,
        options: { authRequired: false },
        security: { authz: { enabled: false, reason: '' } },
      },
      (context, request, response) => {
        try {
          if (roles.length === 0) {
            const projectType = plugins.cloud?.serverless?.projectType;
            roles.push(...(projectType ? readServerlessRoles(projectType) : readStatefulRoles()));
          }
          return response.ok({
            body: {
              roles,
            },
          });
        } catch (err) {
          return response.customError({ statusCode: 500, body: err.message });
        }
      }
    );

    router.post(
      {
        path: '/mock_idp/saml_response',
        validate: {
          body: createSAMLResponseSchema,
        },
        options: { authRequired: false },
        security: { authz: { enabled: false, reason: '' } },
      },
      async (context, request, response) => {
        const { protocol, hostname, port } = core.http.getServerInfo();
        const pathname = core.http.basePath.prepend('/api/security/saml/callback');

        return response.ok({
          body: {
            SAMLResponse: await createSAMLResponse({
              kibanaUrl: `${protocol}://${hostname}:${port}${pathname}`,
              username: request.body.username,
              full_name: request.body.full_name ?? undefined,
              email: request.body.email ?? undefined,
              roles: request.body.roles,
            }),
          },
        });
      }
    );

    core.http.resources.register(
      {
        path: MOCK_IDP_LOGOUT_PATH,
        validate: false,
        options: { authRequired: false },
        security: { authz: { enabled: false, reason: '' } },
      },
      async (context, request, response) => {
        return response.redirected({ headers: { location: '/' } });
      }
    );
  },
  start() {},
  stop() {},
});
