/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { Start, type ExtensionPointToken, type ServiceToken } from '@kbn/core-di';
import {
  ContainerModule,
  type ContainerModuleLoadOptions,
  type Newable,
  type ServiceIdentifier,
} from 'inversify';

/**
 * Internal marker for cross-plugin services.
 *
 * This mirrors the symbol used by the core runtime. The public helper package
 * intentionally stays decoupled from core internals while using the same
 * `Symbol.for(...)` marker name.
 */
const ProvidedService = Symbol.for('ProvidedService') as ServiceIdentifier<ServiceToken<unknown>>;

/**
 * Internal marker for hosted extension points.
 */
const HostedExtensionPoint = Symbol.for('HostedExtensionPoint') as ServiceIdentifier<
  ExtensionPointToken<unknown>
>;

/**
 * Internal marker for extension point contributions.
 */
const ContributedExtensionPoint = Symbol.for('ContributedExtensionPoint') as ServiceIdentifier<
  ExtensionPointToken<unknown>
>;

/**
 * Callback options passed to {@link declare}, extending the standard
 * Inversify `ContainerModuleLoadOptions` with plugin-author convenience
 * helpers.
 *
 * This is a proposed DX layer for the cross-plugin DI PoC, not a finalized
 * API. Plain `ContainerModule` usage remains valid.
 * @public
 */
export interface DeclareOptions extends ContainerModuleLoadOptions {
  /**
   * Binds a service token and marks it for cross-plugin visibility.
   */
  provide<T>(token: ServiceToken<T>): TokenBinding<T>;

  /**
   * Marks an extension point as hosted by the current plugin.
   */
  host<T>(extensionPoint: ExtensionPointToken<T>): void;

  /**
   * Binds a contribution to an extension point and marks it for cross-plugin visibility.
   */
  contribute<T>(extensionPoint: ExtensionPointToken<T>): TokenBinding<T>;
}

/**
 * Chainable binding helpers for plugin-di declarations.
 *
 * The explicit `provide(...)`, `host(...)`, and `contribute(...)` operations
 * are meant to be easy to read and safe to copy between plugins.
 * @public
 */
export interface TokenBinding<T> {
  bind(): ReturnType<ContainerModuleLoadOptions['bind']>;
  from<TDep>(dependency: ServiceIdentifier<TDep>, mapper: (dep: TDep) => T): void;
  fromStart<TStart>(mapper: (start: TStart) => T): void;
  to<TImplementation extends T>(implementation: Newable<TImplementation>): void;
  toConstantValue(value: T): void;
}

const createTokenBinding = <T>(
  options: ContainerModuleLoadOptions,
  marker: ServiceIdentifier<ServiceIdentifier<unknown>>,
  token: ServiceIdentifier<T>
): TokenBinding<T> => {
  let isMarked = false;
  const mark = () => {
    if (!isMarked) {
      options.bind(marker).toConstantValue(token);
      isMarked = true;
    }
  };

  return {
    bind() {
      mark();
      return options.bind(token);
    },
    from<TDep>(dependency: ServiceIdentifier<TDep>, mapper: (dep: TDep) => T) {
      mark();
      options.bind(token).toResolvedValue(mapper, [dependency]);
    },
    fromStart<TStart>(mapper: (start: TStart) => T) {
      mark();
      options.bind(token).toResolvedValue(mapper, [Start as ServiceIdentifier<TStart>]);
    },
    to<TImplementation extends T>(implementation: Newable<TImplementation>) {
      mark();
      options.bind(token).to(implementation);
    },
    toConstantValue(value: T) {
      mark();
      options.bind(token).toConstantValue(value);
    },
  };
};

/**
 * Declares a plugin's DI bindings.
 *
 * This helper is optional authoring sugar for the DI PoC. Plugins may always
 * fall back to plain InversifyJS `ContainerModule` definitions if they prefer.
 * @public
 */
export const declare = (callback: (options: DeclareOptions) => void): ContainerModule =>
  new ContainerModule((options) => {
    const provide = <T>(token: ServiceToken<T>): TokenBinding<T> =>
      createTokenBinding(
        options,
        ProvidedService as ServiceIdentifier<ServiceIdentifier<unknown>>,
        token
      );

    const host = <T>(extensionPoint: ExtensionPointToken<T>): void => {
      options.bind(HostedExtensionPoint).toConstantValue(extensionPoint);
    };

    const contribute = <T>(extensionPoint: ExtensionPointToken<T>): TokenBinding<T> =>
      createTokenBinding(
        options,
        ContributedExtensionPoint as ServiceIdentifier<ServiceIdentifier<unknown>>,
        extensionPoint
      );

    callback({
      ...options,
      contribute,
      host,
      provide,
    });
  });
