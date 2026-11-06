/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createIsomerRuntime } from '@elastic/isomer-runtime';
import { buildJsxShim } from '@elastic/isomer-sdk/author';
import { componentsPack, componentsPrimitives } from '../../pack';
import type { ComponentsRenderContext } from '../../lib';
import { APP_PATH_MAX_CHARS, LINK_LABEL_MAX_CHARS } from '../link/link_target';
import type { ActionsNode } from '.';

const { surfaces, validate } = createIsomerRuntime({ packs: [componentsPack] });
const { Actions, Composition, Context, Divider, Header, Markdown, Quote, toComposition } =
  buildJsxShim(componentsPrimitives);

const URL = 'https://kibana.example.com/app/investigations/1';

const links = (...buttons: ActionsNode['buttons']): ActionsNode => ({ type: 'actions', buttons });

describe('actions', () => {
  it('takes 1 to 5 buttons with navigable URLs', () => {
    const view = (node: ActionsNode) => validate({ type: 'view', body: [node] });

    expect(view(links()).valid).toBe(false);
    expect(view(links(...Array(6).fill({ label: 'a', url: URL }))).valid).toBe(false);
    expect(view(links({ label: 'Run', url: 'data:text/html,<b>hi</b>' })).valid).toBe(false);
    expect(view(links({ label: ' ', url: URL })).valid).toBe(false);
    expect(view(links({ label: 'Open', url: '/app/discover' })).valid).toBe(true);
  });

  it('renders a Slack actions block of link buttons', () => {
    expect(
      surfaces.slack.renderNode(
        links(
          { label: 'View Full Investigation', url: URL, primary: true },
          { label: 'Docs', url: URL }
        )
      ).blocks
    ).toEqual([
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View Full Investigation', emoji: true },
            url: URL,
            style: 'primary',
          },
          { type: 'button', text: { type: 'plain_text', text: 'Docs', emoji: true }, url: URL },
        ],
      },
    ]);
  });

  it('drops buttons Slack cannot open, and the block when none are left', () => {
    const relative = { label: 'Open', url: '/app/discover' };

    expect(surfaces.slack.renderNode(links(relative, { label: 'Docs', url: URL })).blocks).toEqual([
      {
        type: 'actions',
        elements: [
          { type: 'button', text: { type: 'plain_text', text: 'Docs', emoji: true }, url: URL },
        ],
      },
    ]);
    expect(surfaces.slack.renderNode(links(relative)).blocks).toEqual([]);
  });

  it('renders links on the other surfaces', () => {
    const node = links({ label: 'Open', url: '/app/discover' }, { label: 'Docs', url: URL });

    expect(renderToStaticMarkup(surfaces.react.renderNode(node))).toBe(
      `<p class="componentsActions-root"><a href="/app/discover" class="componentsActions-button">Open</a><a href="${URL}" class="componentsActions-button">Docs</a></p>`
    );
    expect(surfaces.markdown.renderNode(node)).toBe(`[Open](/app/discover) · [Docs](${URL})`);
    expect(surfaces.text.renderNode(node)).toBe(`Open: /app/discover\nDocs: ${URL}`);
  });

  describe('buttons to a Kibana app', () => {
    const skills = { label: 'Manage skills', app: 'agent_builder', path: '/manage/skills' };

    it('take an app and path instead of a URL, but not both', () => {
      const view = (node: ActionsNode) => validate({ type: 'view', body: [node] });

      expect(view(links(skills)).valid).toBe(true);
      expect(view(links({ label: 'Open', app: 'discover' })).valid).toBe(true);
      expect(view(links({ ...skills, url: URL })).valid).toBe(false);
      expect(view(links({ label: 'Open' })).valid).toBe(false);
      expect(view(links({ label: 'Open', path: '/manage/skills' })).valid).toBe(false);
      expect(view(links({ label: 'Open', app: 'agent_builder', path: '/../../x' })).valid).toBe(
        false
      );
    });

    it('resolve against the Slack render’s base URL, and are dropped without one', () => {
      const node = links(skills);

      expect(
        surfaces.slack.renderNode(node, { baseUrl: 'https://kibana.example.com/base/s/ops' }).blocks
      ).toEqual([
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Manage skills', emoji: true },
              url: 'https://kibana.example.com/base/s/ops/app/agent_builder/manage/skills',
            },
          ],
        },
      ]);
      expect(surfaces.slack.renderNode(node).blocks).toEqual([]);
    });

    describe('with long paths', () => {
      const baseUrl = 'https://kibana.example.com';
      const view = (node: ActionsNode) => validate({ type: 'view', body: [node] }).valid;
      const discover = (length: number) => `#/${'a'.repeat(length - 2)}`;
      const unicode = `/${'é'.repeat(501)}`;

      it('accept a 2,126-character Discover path and refuse one past the bound', () => {
        expect(view(links({ label: 'Open', app: 'discover', path: discover(2126) }))).toBe(true);
        expect(
          view(links({ label: 'Open', app: 'discover', path: discover(APP_PATH_MAX_CHARS) }))
        ).toBe(true);
        expect(
          view(links({ label: 'Open', app: 'discover', path: discover(APP_PATH_MAX_CHARS + 1) }))
        ).toBe(false);
      });

      it('link in Slack while the resolved URL fits', () => {
        const { blocks } = surfaces.slack.renderNode(
          links({ label: 'Open', app: 'discover', path: discover(2126) }),
          { baseUrl }
        );

        expect(blocks).toHaveLength(1);
        expect(JSON.stringify(blocks)).toContain(`${baseUrl}/app/discover${discover(2126)}`);
      });

      it('are omitted in Slack when encoding pushes the URL past its limit, with the block if none remain', () => {
        const node = links({ label: 'Open', app: 'discover', path: unicode });

        expect(view(node)).toBe(true);
        expect(surfaces.slack.renderNode(node, { baseUrl }).blocks).toEqual([]);
      });

      it('keep the buttons that fit beside an omitted one', () => {
        const { blocks } = surfaces.slack.renderNode(
          links(
            { label: 'Too long', app: 'discover', path: unicode },
            { label: 'Skills', app: 'agent_builder', path: '/manage/skills' }
          ),
          { baseUrl }
        );

        expect(blocks).toEqual([
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: { type: 'plain_text', text: 'Skills', emoji: true },
                url: `${baseUrl}/app/agent_builder/manage/skills`,
              },
            ],
          },
        ]);
      });

      it('keep the longer link on the other surfaces', () => {
        const path = unicode;
        const markup = renderToStaticMarkup(
          <>
            {surfaces.react.renderNode(links({ label: 'Open', app: 'discover', path }), {
              context: { resolveKibanaPath: (resolved) => resolved },
            })}
          </>
        );

        expect(markup).toContain(`/app/discover${path}`);
      });
    });

    it('resolve through the React host, and are left out of text and Markdown', () => {
      const node = links(skills, { label: 'Docs', url: URL });
      const context: ComponentsRenderContext = {
        resolveKibanaPath: (path) => `/base/s/ops${path}`,
      };

      expect(renderToStaticMarkup(<>{surfaces.react.renderNode(node, { context })}</>)).toContain(
        'href="/base/s/ops/app/agent_builder/manage/skills"'
      );
      expect(surfaces.markdown.renderNode(node)).toBe(`[Docs](${URL})`);
      expect(surfaces.text.renderNode(node)).toBe(`Docs: ${URL}`);
      expect(surfaces.markdown.renderNode(links(skills))).toBe('');
    });
  });

  describe('with long labels and URLs', () => {
    const view = (node: ActionsNode) => validate({ type: 'view', body: [node] }).valid;
    const longUrl = `https://kibana.example.com/app/discover?q=${'a'.repeat(3500)}`;

    it('take a label past Slack’s button limit, which Slack clamps', () => {
      const label = 'word '.repeat(LINK_LABEL_MAX_CHARS / 5).trim();
      const node = links({ label, url: URL });
      const [block] = surfaces.slack.renderNode(node).blocks as Array<{
        elements: Array<{ text: { text: string } }>;
      }>;

      expect(view(node)).toBe(true);
      expect(view(links({ label: 'a'.repeat(LINK_LABEL_MAX_CHARS + 1), url: URL }))).toBe(false);
      expect(block.elements[0].text.text.length).toBeLessThanOrEqual(75);
    });

    it('take a URL past Slack’s limit, omit it in Slack and keep it elsewhere', () => {
      const node = links({ label: 'Open', url: longUrl });

      expect(view(node)).toBe(true);
      expect(surfaces.slack.renderNode(node).blocks).toEqual([]);
      expect(renderToStaticMarkup(surfaces.react.renderNode(node))).toContain(longUrl);
      expect(surfaces.text.renderNode(node)).toBe(`Open: ${longUrl}`);
    });
  });

  it('fills the primary button in React', () => {
    const markup = renderToStaticMarkup(
      surfaces.react.renderNode(links({ label: 'Investigate', url: URL, primary: true }))
    );

    expect(markup).toContain('class="componentsActions-button componentsActions-primary"');
  });

  it('is authored from Actions.Button children', () => {
    expect(
      toComposition(
        <Composition>
          <Actions>
            <Actions.Button url={URL} primary>
              View Full Investigation
            </Actions.Button>
          </Actions>
        </Composition>
      ).body
    ).toEqual([links({ label: 'View Full Investigation', url: URL, primary: true })]);
  });

  // The envelope's section rhythm adds a divider before each later header and before actions.
  it('lays out a completed investigation in the blocks a Slack notification uses', () => {
    const { blocks } = surfaces.slack.render(
      toComposition(
        <Composition>
          <Header>Checkout latency doubled</Header>
          <Context>
            <Context.Item>Investigation completed</Context.Item>
            <Context.Item>Automation: Checkout errors</Context.Item>
          </Context>
          <Header level={3}>Impact</Header>
          <Markdown text="Checkout p95 rose from 400 ms to 900 ms." />
          <Divider />
          <Header level={3}>Conclusion</Header>
          <Quote>The 14:05 deploy of payments-api caused the regression.</Quote>
          <Actions>
            <Actions.Button url={URL} primary>
              View Full Investigation
            </Actions.Button>
          </Actions>
        </Composition>
      )
    );

    expect(blocks.map(({ type }) => type)).toEqual([
      'header',
      'context',
      'divider',
      'header',
      'rich_text',
      'divider',
      'header',
      'rich_text',
      'section',
      'divider',
      'actions',
    ]);
    expect(blocks.filter(({ type }) => type === 'header')).toMatchObject([
      { text: { text: 'Checkout latency doubled' } },
      { text: { text: 'Impact' }, level: 3 },
      { text: { text: 'Conclusion' }, level: 3 },
    ]);
  });
});
