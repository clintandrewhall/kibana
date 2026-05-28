/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

// Public embed surface for Kibana Storybook static builds.
// Consumed by the Elastic docs site to embed individual stories without
// pulling Storybook's preview bundle into the host page. Each story renders
// inside an iframe pointing at this build's `iframe.html`, which sandboxes
// EUI styling/globals from the host and avoids cross-origin fetches of story
// JS — only this module itself requires CORS to be loaded by the host.

const baseUrl = new URL('.', import.meta.url);
const mounts = new WeakMap();

const resolveHost = (target) => {
  if (typeof target === 'string') {
    const el = document.querySelector(target);
    if (!el) {
      throw new Error(`@kbn/storybook registry: no element matches "${target}"`);
    }
    return el;
  }
  if (!(target instanceof Element)) {
    throw new TypeError('@kbn/storybook registry: target must be a selector or Element');
  }
  return target;
};

export const mountStory = (target, storyId, options = {}) => {
  if (!storyId || typeof storyId !== 'string') {
    throw new TypeError('@kbn/storybook registry: storyId must be a non-empty string');
  }

  const host = resolveHost(target);
  unmountStory(host);

  const params = new URLSearchParams({ id: storyId, viewMode: options.viewMode ?? 'story' });
  if (options.globals) params.set('globals', options.globals);
  if (options.args) params.set('args', options.args);

  const iframe = document.createElement('iframe');
  iframe.src = new URL(`iframe.html?${params.toString()}`, baseUrl).href;
  iframe.title = options.title ?? `Storybook: ${storyId}`;
  iframe.loading = options.loading ?? 'lazy';
  iframe.style.border = '0';
  iframe.style.width = options.width ?? '100%';
  iframe.style.height = options.height ?? '500px';
  iframe.style.display = 'block';

  host.appendChild(iframe);
  mounts.set(host, iframe);
  return iframe;
};

export const unmountStory = (target) => {
  const host = resolveHost(target);
  const iframe = mounts.get(host);
  if (iframe?.parentNode === host) {
    host.removeChild(iframe);
  }
  mounts.delete(host);
};

export default { mountStory, unmountStory };
