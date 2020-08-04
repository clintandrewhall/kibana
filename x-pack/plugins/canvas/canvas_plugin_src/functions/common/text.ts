/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  Datatable,
  Render,
  Style,
  ExpressionFunctionDefinition,
} from 'src/plugins/expressions/common';
// @ts-expect-error untyped local
import { Handlebars } from '../../../common/lib/handlebars';
import { getFunctionHelp } from '../../../i18n';

type Context = Datatable | null;

export type TextType =
  | 'title'
  | 'subtitle'
  | 'heading_1'
  | 'heading_2'
  | 'heading_3'
  | 'body'
  | 'quote';

interface Arguments {
  content: string[];
  font: Style;
  type: TextType;
}

export interface Return {
  content: string;
  font: Style;
  type: TextType;
}

export function text(): ExpressionFunctionDefinition<'text', Context, Arguments, Render<Return>> {
  const { help, args: argHelp } = getFunctionHelp().text;

  return {
    name: 'text',
    aliases: [],
    type: 'render',
    help,
    inputTypes: ['datatable', 'null'],
    args: {
      content: {
        aliases: ['_', 'expression'],
        types: ['string'],
        help: argHelp.content,
        default: '""',
        multi: true,
      },
      font: {
        types: ['style'],
        help: argHelp.font,
        default: '{font}',
      },
      type: {
        types: ['string'],
        help: argHelp.type,
        options: ['title', 'subtitle', 'heading_1', 'heading_2', 'heading_3', 'body', 'quote'],
        default: 'body',
      },
    },
    fn: (input, args) => {
      const compileFunctions = args.content.map((str) =>
        Handlebars.compile(String(str), { knownHelpersOnly: true })
      );

      const ctx = {
        columns: [],
        rows: [],
        type: null,
        ...input,
      };

      return {
        type: 'render',
        as: 'text',
        value: {
          content: compileFunctions.map((fn) => fn(ctx)).join(''),
          font: args.font,
          type: args.type,
        },
      };
    },
  };
}
