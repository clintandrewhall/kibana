/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// @ts-nocheck
// All of this is not right.  This is a pull from our Redux store, and it's not matching up
// to our actual state type.  I've disabled it to get around it, for now.

import { State } from '../../../../../types';

export const state: State = {
  assets: {},
  app: {
    basePath: '/fzi',
    serverFunctions: [
      // This was populated-- and invalid-- as well
    ],
    ready: true,
  },
  transient: {
    canUserWrite: true,
    zoomScale: 1,
    elementStats: {
      total: 7,
      ready: 7,
      pending: 0,
      error: 0,
    },
    fullscreen: false,
    selectedToplevelNodes: [],
    resolvedArgs: {
      'element-df4db068-8dbf-4093-a47b-8eba5f144878': {
        expressionRenderable: {
          state: 'ready',
          value: {
            type: 'render',
            as: 'markdown',
            value: {
              content: '# Title',
              font: {
                type: 'style',
                spec: {
                  fontFamily: 'Open Sans',
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontSize: '48px',
                  lineHeight: '1',
                },
                css:
                  'font-family:Open Sans;font-weight:normal;font-style:normal;text-decoration:none;text-align:center;font-size:48px;line-height:1',
              },
              openLinksInNewTab: false,
            },
            css: '.canvasRenderEl{\n\n}',
            containerStyle: {
              type: 'containerStyle',
              overflow: 'hidden',
            },
          },
          error: null,
        },
      },
      'element-427b17f1-5543-464b-adcf-468d046511e0': {
        expressionRenderable: {
          state: 'ready',
          value: {
            type: 'render',
            as: 'markdown',
            value: {
              content: '# Subtitle',
              font: {
                type: 'style',
                spec: {
                  fontFamily: 'Open Sans',
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontSize: '24px',
                  lineHeight: '1',
                },
                css:
                  'font-family:Open Sans;font-weight:normal;font-style:normal;text-decoration:none;text-align:center;font-size:24px;line-height:1',
              },
              openLinksInNewTab: false,
            },
            css: '.canvasRenderEl{\n\n}',
            containerStyle: {
              type: 'containerStyle',
              overflow: 'hidden',
            },
          },
          error: null,
        },
      },
      'element-40324c34-7a3e-454b-ab61-efd3c263d1e2': {
        expressionRenderable: {
          state: 'ready',
          value: {
            type: 'render',
            as: 'image',
            value: {
              type: 'image',
              mode: 'contain',
              dataurl:
                'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgdmlld0JveD0iMCAwIDI3MC42MDAwMSAyNjkuNTQ2NjYiCiAgIGhlaWdodD0iMjY5LjU0NjY2IgogICB3aWR0aD0iMjcwLjYwMDAxIgogICB4bWw6c3BhY2U9InByZXNlcnZlIgogICBpZD0ic3ZnMiIKICAgdmVyc2lvbj0iMS4xIj48bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE4Ij48cmRmOlJERj48Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+PGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+PGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPjwvY2M6V29yaz48L3JkZjpSREY+PC9tZXRhZGF0YT48ZGVmcwogICAgIGlkPSJkZWZzNiIgLz48ZwogICAgIHRyYW5zZm9ybT0ibWF0cml4KDEuMzMzMzMzMywwLDAsLTEuMzMzMzMzMywwLDI2OS41NDY2NykiCiAgICAgaWQ9ImcxMCI+PGcKICAgICAgIHRyYW5zZm9ybT0ic2NhbGUoMC4xKSIKICAgICAgIGlkPSJnMTIiPjxwYXRoCiAgICAgICAgIGlkPSJwYXRoMTQiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgIGQ9Im0gMjAyOS40OCw5NjIuNDQxIGMgMCwxNzAuMDk5IC0xMDUuNDYsMzE4Ljc5OSAtMjY0LjE3LDM3Ni42NTkgNi45OCwzNS44NiAxMC42Miw3MS43MSAxMC42MiwxMDkuMDUgMCwzMTYuMTkgLTI1Ny4yNCw1NzMuNDMgLTU3My40Nyw1NzMuNDMgLTE4NC43MiwwIC0zNTYuNTU4LC04OC41OSAtNDY0LjUzLC0yMzcuODUgLTUzLjA5LDQxLjE4IC0xMTguMjg1LDYzLjc1IC0xODYuMzA1LDYzLjc1IC0xNjcuODM2LDAgLTMwNC4zODMsLTEzNi41NCAtMzA0LjM4MywtMzA0LjM4IDAsLTM3LjA4IDYuNjE3LC03Mi41OCAxOS4wMzEsLTEwNi4wOCBDIDEwOC40ODgsMTM4MC4wOSAwLDEyMjcuODkgMCwxMDU4Ljg4IDAsODg3LjkxIDEwNS45NzcsNzM4LjUzOSAyNjUuMzk4LDY4MS4wOSBjIC02Ljc2OSwtMzUuNDQyIC0xMC40NiwtNzIuMDIgLTEwLjQ2LC0xMDkgQyAyNTQuOTM4LDI1Ni42MjEgNTExLjU2NiwwIDgyNy4wMjcsMCAxMDEyLjIsMCAxMTgzLjk0LDg4Ljk0MTQgMTI5MS4zLDIzOC44MzIgYyA1My40NSwtNDEuOTYxIDExOC44LC02NC45OTIgMTg2LjU2LC02NC45OTIgMTY3LjgzLDAgMzA0LjM4LDEzNi40OTIgMzA0LjM4LDMwNC4zMzIgMCwzNy4wNzggLTYuNjIsNzIuNjI5IC0xOS4wMywxMDYuMTI5IDE1Ny43OCw1Ni44NzkgMjY2LjI3LDIwOS4xMjkgMjY2LjI3LDM3OC4xNCIgLz48cGF0aAogICAgICAgICBpZD0icGF0aDE2IgogICAgICAgICBzdHlsZT0iZmlsbDojZmFjZjA5O2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICBkPSJtIDc5Ny44OTgsMTE1MC45MyA0NDQuMDcyLC0yMDIuNDUgNDQ4LjA1LDM5Mi41OCBjIDYuNDksMzIuMzkgOS42Niw2NC42NyA5LjY2LDk4LjQ2IDAsMjc2LjIzIC0yMjQuNjgsNTAwLjk1IC01MDAuOSw1MDAuOTUgLTE2NS4yNCwwIC0zMTkuMzcsLTgxLjM2IC00MTMuMDUzLC0yMTcuNzkgbCAtNzQuNTI0LC0zODYuNjQgODYuNjk1LC0xODUuMTEiIC8+PHBhdGgKICAgICAgICAgaWQ9InBhdGgxOCIKICAgICAgICAgc3R5bGU9ImZpbGw6IzQ5YzFhZTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgZD0ibSAzMzguMjIzLDY4MC42NzIgYyAtNi40ODksLTMyLjM4MyAtOS44MDksLTY1Ljk4MSAtOS44MDksLTk5Ljk3MyAwLC0yNzYuOTI5IDIyNS4zMzYsLTUwMi4yNTc2IDUwMi4zMTMsLTUwMi4yNTc2IDE2Ni41OTMsMCAzMjEuNDczLDgyLjExNzYgNDE1LjAxMywyMTkuOTQ5NiBsIDczLjk3LDM4NS4zNDcgLTk4LjcyLDE4OC42MjEgTCA3NzUuMTU2LDEwNzUuNTcgMzM4LjIyMyw2ODAuNjcyIiAvPjxwYXRoCiAgICAgICAgIGlkPSJwYXRoMjAiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNlZjI5OWI7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgIGQ9Im0gMzM1LjQxLDE0NDkuMTggMzA0LjMzMiwtNzEuODYgNjYuNjgsMzQ2LjAyIGMgLTQxLjU4NiwzMS43OCAtOTIuOTMsNDkuMTggLTE0NS43MzEsNDkuMTggLTEzMi4yNSwwIC0yMzkuODEyLC0xMDcuNjEgLTIzOS44MTIsLTIzOS44NyAwLC0yOS4yMSA0Ljg3OSwtNTcuMjIgMTQuNTMxLC04My40NyIgLz48cGF0aAogICAgICAgICBpZD0icGF0aDIyIgogICAgICAgICBzdHlsZT0iZmlsbDojNGNhYmU0O2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICBkPSJNIDMwOC45OTIsMTM3Ni43IEMgMTczLjAyLDEzMzEuNjQgNzguNDgwNSwxMjAxLjMgNzguNDgwNSwxMDU3LjkzIDc4LjQ4MDUsOTE4LjM0IDE2NC44Miw3OTMuNjggMjk0LjQwNiw3NDQuMzUyIGwgNDI2Ljk4MSwzODUuOTM4IC03OC4zOTUsMTY3LjUxIC0zMzQsNzguOSIgLz48cGF0aAogICAgICAgICBpZD0icGF0aDI0IgogICAgICAgICBzdHlsZT0iZmlsbDojODVjZTI2O2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICBkPSJtIDEzMjMuOCwyOTguNDEgYyA0MS43NCwtMzIuMDkgOTIuODMsLTQ5LjU5IDE0NC45OCwtNDkuNTkgMTMyLjI1LDAgMjM5LjgxLDEwNy41NTkgMjM5LjgxLDIzOS44MjEgMCwyOS4xNiAtNC44OCw1Ny4xNjggLTE0LjUzLDgzLjQxOCBsIC0zMDQuMDgsNzEuMTYgLTY2LjE4LC0zNDQuODA5IiAvPjxwYXRoCiAgICAgICAgIGlkPSJwYXRoMjYiCiAgICAgICAgIHN0eWxlPSJmaWxsOiMzMTc3YTc7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgIGQ9Im0gMTM4NS42Nyw3MjIuOTMgMzM0Ljc2LC03OC4zMDEgYyAxMzYuMDIsNDQuOTYxIDIzMC41NiwxNzUuMzUxIDIzMC41NiwzMTguNzYyIDAsMTM5LjMzOSAtODYuNTQsMjYzLjg1OSAtMjE2LjM4LDMxMy4wMzkgbCAtNDM3Ljg0LC0zODMuNTkgODguOSwtMTY5LjkxIiAvPjwvZz48L2c+PC9zdmc+',
            },
            css: '.canvasRenderEl{\n\n}',
            containerStyle: {
              type: 'containerStyle',
              overflow: 'hidden',
            },
          },
          error: null,
        },
      },
      'element-444c0f28-cbc1-46ff-b6df-a385d2fa3138': {
        expressionRenderable: {
          state: 'ready',
          value: {
            type: 'render',
            as: 'markdown',
            value: {
              content: '# Part of a group',
              font: {
                type: 'style',
                spec: {
                  fontFamily: 'Open Sans',
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  textDecoration: 'none',
                  textAlign: 'left',
                  fontSize: '14px',
                  lineHeight: '1',
                },
                css:
                  'font-family:Open Sans;font-weight:normal;font-style:normal;text-decoration:none;text-align:left;font-size:14px;line-height:1',
              },
              openLinksInNewTab: false,
            },
            css: '.canvasRenderEl{\n\n}',
            containerStyle: {
              type: 'containerStyle',
              overflow: 'hidden',
            },
          },
          error: null,
        },
      },
      'element-e59fafae-a622-4ec2-acee-afe2d9c99e2b': {
        expressionRenderable: {
          state: 'ready',
          value: {
            type: 'render',
            as: 'shape',
            value: {
              type: 'shape',
              shape: 'star',
              fill: '#4cbce4',
              border: 'rgba(255,255,255,0)',
              borderWidth: 0,
              maintainAspect: false,
            },
            css: '.canvasRenderEl{\n\n}',
            containerStyle: {
              type: 'containerStyle',
              overflow: 'hidden',
            },
          },
          error: null,
        },
      },
      'element-40eecd30-52ef-4580-8c4e-8d521268961f': {
        expressionRenderable: {
          state: 'ready',
          value: {
            type: 'render',
            as: 'shape',
            value: {
              type: 'shape',
              shape: 'square',
              fill: '#4cbce4',
              border: 'rgba(255,255,255,0)',
              borderWidth: 0,
              maintainAspect: false,
            },
            css: '.canvasRenderEl{\n\n}',
            containerStyle: {
              type: 'containerStyle',
              overflow: 'hidden',
            },
          },
          error: null,
        },
      },
      'element-f832c893-5380-4ae2-bf88-16d4d0253a7d': {
        expressionRenderable: {
          state: 'ready',
          value: {
            type: 'render',
            as: 'shape',
            value: {
              type: 'shape',
              shape: 'circle',
              fill: '#4cbce4',
              border: 'rgba(255,255,255,0)',
              borderWidth: 0,
              maintainAspect: false,
            },
            css: '.canvasRenderEl{\n\n}',
            containerStyle: {
              type: 'containerStyle',
              overflow: 'hidden',
            },
          },
          error: null,
        },
      },
    },
    refresh: {
      interval: 0,
    },
    autoplay: {
      enabled: false,
      interval: 10000,
    },
    inFlight: false,
  },
  persistent: {
    workpad: {
      css: '.canvasPage {\n\n}',
      variables: [],
      id: 'workpad-60a785ad-2ccb-44cd-a332-ea605a4dcbe2',
      name: 'My Canvas Workpad',
      width: 1080,
      height: 720,
      page: 0,
      pages: [
        {
          id: 'page-15db662a-022b-49da-aba7-e30e98f0a628',
          style: {
            background: '#FFF',
          },
          transition: {},
          elements: [
            {
              id: 'element-df4db068-8dbf-4093-a47b-8eba5f144878',
              position: {
                left: 28,
                top: 204,
                width: 1024,
                height: 161,
                angle: 0,
                parent: null,
              },
              expression: 'markdown "# Title" font={font size=48 align="center"} | render',
            },
            {
              id: 'element-427b17f1-5543-464b-adcf-468d046511e0',
              position: {
                left: 28,
                top: 379,
                width: 1024,
                height: 69,
                angle: 0,
                parent: null,
              },
              expression: 'markdown "# Subtitle" font={font size=24 align="center"} | render',
            },
            {
              id: 'element-40324c34-7a3e-454b-ab61-efd3c263d1e2',
              position: {
                left: 48,
                top: 448,
                width: 287,
                height: 240,
                angle: 0,
                parent: 'group-e4385a15-1c16-4d90-8574-a3fc087f1fad',
              },
              expression: 'image dataurl=null mode="contain"\n| render',
            },
            {
              id: 'element-444c0f28-cbc1-46ff-b6df-a385d2fa3138',
              position: {
                left: 369,
                top: 533,
                width: 500,
                height: 70,
                angle: 0,
                parent: 'group-e4385a15-1c16-4d90-8574-a3fc087f1fad',
              },
              expression: 'filters\n| demodata\n| markdown "# Part of a group"\n| render',
            },
            {
              id: 'element-e59fafae-a622-4ec2-acee-afe2d9c99e2b',
              position: {
                left: 20,
                top: 20,
                width: 200,
                height: 200,
                angle: 0,
                parent: 'group-1513e187-b722-4202-a83c-3a4e3afc911a',
              },
              expression:
                'shape "star" fill="#4cbce4" border="rgba(255,255,255,0)" borderWidth=0 maintainAspect=false\n| render',
            },
            {
              id: 'element-40eecd30-52ef-4580-8c4e-8d521268961f',
              position: {
                left: 248,
                top: 63,
                width: 112,
                height: 104,
                angle: 0,
                parent: 'group-e00e4e96-42b5-4c09-adfe-0ffe06e68864',
              },
              expression:
                'shape "square" fill="#4cbce4" border="rgba(255,255,255,0)" borderWidth=0 maintainAspect=false | render',
            },
            {
              id: 'element-f832c893-5380-4ae2-bf88-16d4d0253a7d',
              position: {
                left: 431,
                top: 49,
                width: 135,
                height: 132,
                angle: 0,
                parent: 'group-e00e4e96-42b5-4c09-adfe-0ffe06e68864',
              },
              expression:
                'shape "circle" fill="#4cbce4" border="rgba(255,255,255,0)" borderWidth=0 maintainAspect=false\n| render',
            },
          ],
          groups: [
            {
              id: 'group-e4385a15-1c16-4d90-8574-a3fc087f1fad',
              position: {
                left: 48,
                top: 448,
                width: 821,
                height: 240,
                angle: 0,
                parent: null,
              },
            },
            {
              id: 'group-e00e4e96-42b5-4c09-adfe-0ffe06e68864',
              position: {
                left: 248,
                top: 49,
                width: 318,
                height: 132,
                angle: 0,
                parent: 'group-1513e187-b722-4202-a83c-3a4e3afc911a',
              },
            },
            {
              id: 'group-1513e187-b722-4202-a83c-3a4e3afc911a',
              position: {
                left: 20,
                top: 20,
                width: 546,
                height: 200,
                angle: 0,
                parent: null,
              },
            },
          ],
        },
      ],
      colors: [
        '#37988d',
        '#c19628',
        '#b83c6f',
        '#3f9939',
        '#1785b0',
        '#ca5f35',
        '#45bdb0',
        '#f2bc33',
        '#e74b8b',
        '#4fbf48',
        '#1ea6dc',
        '#fd7643',
        '#72cec3',
        '#f5cc5d',
        '#ec77a8',
        '#7acf74',
        '#4cbce4',
        '#fd986f',
        '#a1ded7',
        '#f8dd91',
        '#f2a4c5',
        '#a6dfa2',
        '#86d2ed',
        '#fdba9f',
        '#000000',
        '#444444',
        '#777777',
        '#BBBBBB',
        '#FFFFFF',
        'rgba(255,255,255,0)',
      ],
      isWriteable: true,
      '@timestamp': '2020-08-11T03:49:15.638Z',
      '@created': '2020-07-30T19:24:29.588Z',
      theme: {
        palette: {
          id: 'paul_tor_14',
          label: 'Paul Tor 14',
          colors: [
            '#882E72',
            '#B178A6',
            '#D6C1DE',
            '#1965B0',
            '#5289C7',
            '#7BAFDE',
            '#4EB265',
            '#90C987',
            '#CAE0AB',
            '#F7EE55',
            '#F6C141',
            '#F1932D',
            '#E8601C',
            '#DC050C',
          ],
          gradient: false,
        },
        font: {
          family: {
            label: 'Open Sans',
            value: "'Open Sans', Helvetica, Arial, sans-serif",
          },
          size: 12,
        },
      },
    },
    schemaVersion: 2,
  },
};
