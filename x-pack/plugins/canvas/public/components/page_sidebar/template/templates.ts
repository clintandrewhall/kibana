/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { getId } from '../../../lib/get_id';
import { getDefaultPage, getDefaultElement } from '../../../state/defaults';
import { CanvasPage, ElementPosition } from '../../../../types';

// TODO: CLINT - hack, hack, hack
const getPage = (
  elements: Array<{ id: string; position: ElementPosition; expression: string }> = []
) => {
  const page = getDefaultPage() as any;
  page.elements = elements;
  // page.id = getId('page');
  return page as CanvasPage;
};

const createElement = ({
  position,
  expression,
}: {
  position: ElementPosition;
  expression: string;
}) => {
  const element = getDefaultElement();

  if (position) {
    element.position = position;
  }

  if (expression) {
    element.expression = expression;
  }

  return { id: getId('element'), position, expression };
};

export const blank = () => ({
  page: getPage(),
  preview: `<div id="${getId(
    'page'
  )}-preview" data-test-subj="canvasWorkpadPage" class="canvasPage kbn-resetFocusState canvasInteractivePage isActive" data-shared-items-container="true" style="background: rgb(255, 255, 255); height: 720px; width: 1080px; cursor: auto;"><div id="canvasInteractionBoundary" style="top: 50%; left: 50%; position: absolute; height: 1063.33px; width: 1197.33px; margin-left: -598.665px; margin-top: -531.665px;"></div><div tabindex="-1"></div></div>`,
});

export const title = () => ({
  page: getPage([
    createElement({
      position: {
        left: 28,
        top: 204,
        width: 1024,
        height: 161,
        angle: 0,
        parent: null,
      },
      expression: 'markdown "# Title" font={font size=48 align="center"} | render',
    }),
    createElement({
      position: {
        left: 28,
        top: 379,
        width: 1024,
        height: 69,
        angle: 0,
        parent: null,
      },
      expression: 'markdown "# Subtitle" font={font size=24 align="center"} | render',
    }),
  ]),
  preview: `<div id="${getId(
    'page'
  )}" data-test-subj="canvasWorkpadPage" class="canvasPage kbn-resetFocusState canvasInteractivePage isActive" data-shared-items-container="true" style="background: rgb(255, 255, 255); height: 720px; width: 1080px; cursor: auto;"><div id="canvasInteractionBoundary" style="top: 50%; left: 50%; position: absolute; height: 1063.33px; width: 1197.33px; margin-left: -598.665px; margin-top: -531.665px;"></div><div tabindex="-1"></div><div class="canvasPositionable canvasInteractable" style="width: 1024px; height: 161px; margin-left: -512px; margin-top: -80.5px; position: absolute; transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 540, 284, 0, 1);"><div class="canvas__element canvasElement s-503541715" data-test-subj="canvasWorkpadPageElementContent" style="overflow: hidden; width: 1024px; height: 161px;"><style type="text/css">.s-503541715 .canvasRenderEl{
  }
  </style><div data-shared-item="true" data-render-complete="true" class="canvasElement__content"><div class="canvasWorkpad--element_render canvasRenderEl" style="height: 100%; width: 100%;"><div class="render_to_dom" style="height: 100%; width: 100%;"><div style="width: 100%; height: 100%;"><div class="kbnMarkdown__body canvasMarkdown" style="font-family: &quot;Open Sans&quot;, Helvetica, Arial, sans-serif; font-weight: normal; font-style: normal; text-decoration: none; text-align: center; font-size: 48px; line-height: 1; color: rgb(0, 0, 0);"><h1>Title</h1>
  </div></div></div></div></div></div></div><div class="canvasPositionable canvasInteractable" style="width: 1024px; height: 69px; margin-left: -512px; margin-top: -34.5px; position: absolute; transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 540, 414, 1, 1);"><div class="canvas__element canvasElement s1153143100" data-test-subj="canvasWorkpadPageElementContent" style="overflow: hidden; width: 1024px; height: 69px;"><style type="text/css">.s1153143100 .canvasRenderEl{
  }
  </style><div data-shared-item="true" data-render-complete="true" class="canvasElement__content"><div class="canvasWorkpad--element_render canvasRenderEl" style="height: 100%; width: 100%;"><div class="render_to_dom" style="height: 100%; width: 100%;"><div style="width: 100%; height: 100%;"><div class="kbnMarkdown__body canvasMarkdown" style="font-family: &quot;Open Sans&quot;, Helvetica, Arial, sans-serif; font-weight: normal; font-style: normal; text-decoration: none; text-align: center; font-size: 24px; line-height: 1; color: rgb(0, 0, 0);"><h2>Subtitle</h2>
  </div></div></div></div></div></div></div></div>`,
});

const imageLeft = () => ({
  page: getPage([
    createElement({
      position: { left: 20, top: 41.5, width: 500, height: 637, angle: 0, parent: null },
      expression: 'image mode="contain" | render',
    }),
    createElement({
      position: { left: 540, top: 41.5, width: 514, height: 637, angle: 0, parent: null },
      expression:
        'demodata | markdown "### Welcome to the Markdown element\n\nGood news! You\'re already connected to some demo data!\n\nThe data table contains\n**{{rows.length}} rows**, each containing\n the following columns:\n{{#each columns}}\n **{{name}}**\n{{/each}}"\n font={font size=18} | render',
    }),
  ]),
  preview: `<div id="${getId(
    'page'
  )}" data-test-subj="canvasWorkpadPage" class="canvasPage kbn-resetFocusState canvasInteractivePage isActive" data-shared-items-container="true" style="background: rgb(255, 255, 255); height: 720px; width: 1080px; cursor: auto;"><div id="canvasInteractionBoundary" style="top: 50%; left: 50%; position: absolute; height: 1063.33px; width: 1197.33px; margin-left: -598.665px; margin-top: -531.665px;"></div><div tabindex="-1"></div><div class="canvasPositionable canvasInteractable" style="width: 514px; height: 637px; margin-left: -257px; margin-top: -318.5px; position: absolute; transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 797, 360, 0, 1);"><div class="canvas__element canvasElement s-1485495258" data-test-subj="canvasWorkpadPageElementContent" style="overflow: hidden; width: 514px; height: 637px;"><style type="text/css">.s-1485495258 .canvasRenderEl{
  }
  </style><div data-shared-item="true" data-render-complete="true" class="canvasElement__content"><div class="canvasWorkpad--element_render canvasRenderEl" style="height: 100%; width: 100%;"><div class="render_to_dom" style="height: 100%; width: 100%;"><div style="width: 100%; height: 100%;"><div class="kbnMarkdown__body canvasMarkdown" style="font-family: Baskerville; font-weight: normal; font-style: normal; text-decoration: none; text-align: left; font-size: 14px; line-height: 1;"><h3>Welcome to the Markdown element</h3>
  <p>Good news! You're already connected to some demo data!</p>
  <p>The data table contains
  <strong>3000 rows</strong>, each containing
  the following columns:
  <strong>@timestamp</strong>
  <strong>time</strong>
  <strong>cost</strong>
  <strong>username</strong>
  <strong>price</strong>
  <strong>age</strong>
  <strong>country</strong>
  <strong>state</strong>
  <strong>project</strong>
  <strong>percent_uptime</strong></p>
  </div></div></div></div></div></div></div><div class="canvasPositionable canvasInteractable" style="width: 500px; height: 637px; margin-left: -250px; margin-top: -318.5px; position: absolute; transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 270, 360, 1, 1);"><div class="canvas__element canvasElement s1695812373" data-test-subj="canvasWorkpadPageElementContent" style="overflow: hidden; width: 500px; height: 637px;"><style type="text/css">.s1695812373 .canvasRenderEl{
  }
  </style><div data-shared-item="true" data-render-complete="true" class="canvasElement__content"><div class="canvasWorkpad--element_render canvasRenderEl" style="height: 100%; width: 100%;"><div class="render_to_dom" style="height: 100%; width: 100%;"><div style="width: 100%; height: 100%;"><div style="height: 100%; background-image: url(&quot;data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgdmlld0JveD0iMCAwIDI3MC42MDAwMSAyNjkuNTQ2NjYiCiAgIGhlaWdodD0iMjY5LjU0NjY2IgogICB3aWR0aD0iMjcwLjYwMDAxIgogICB4bWw6c3BhY2U9InByZXNlcnZlIgogICBpZD0ic3ZnMiIKICAgdmVyc2lvbj0iMS4xIj48bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE4Ij48cmRmOlJERj48Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+PGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+PGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPjwvY2M6V29yaz48L3JkZjpSREY+PC9tZXRhZGF0YT48ZGVmcwogICAgIGlkPSJkZWZzNiIgLz48ZwogICAgIHRyYW5zZm9ybT0ibWF0cml4KDEuMzMzMzMzMywwLDAsLTEuMzMzMzMzMywwLDI2OS41NDY2NykiCiAgICAgaWQ9ImcxMCI+PGcKICAgICAgIHRyYW5zZm9ybT0ic2NhbGUoMC4xKSIKICAgICAgIGlkPSJnMTIiPjxwYXRoCiAgICAgICAgIGlkPSJwYXRoMTQiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgIGQ9Im0gMjAyOS40OCw5NjIuNDQxIGMgMCwxNzAuMDk5IC0xMDUuNDYsMzE4Ljc5OSAtMjY0LjE3LDM3Ni42NTkgNi45OCwzNS44NiAxMC42Miw3MS43MSAxMC42MiwxMDkuMDUgMCwzMTYuMTkgLTI1Ny4yNCw1NzMuNDMgLTU3My40Nyw1NzMuNDMgLTE4NC43MiwwIC0zNTYuNTU4LC04OC41OSAtNDY0LjUzLC0yMzcuODUgLTUzLjA5LDQxLjE4IC0xMTguMjg1LDYzLjc1IC0xODYuMzA1LDYzLjc1IC0xNjcuODM2LDAgLTMwNC4zODMsLTEzNi41NCAtMzA0LjM4MywtMzA0LjM4IDAsLTM3LjA4IDYuNjE3LC03Mi41OCAxOS4wMzEsLTEwNi4wOCBDIDEwOC40ODgsMTM4MC4wOSAwLDEyMjcuODkgMCwxMDU4Ljg4IDAsODg3LjkxIDEwNS45NzcsNzM4LjUzOSAyNjUuMzk4LDY4MS4wOSBjIC02Ljc2OSwtMzUuNDQyIC0xMC40NiwtNzIuMDIgLTEwLjQ2LC0xMDkgQyAyNTQuOTM4LDI1Ni42MjEgNTExLjU2NiwwIDgyNy4wMjcsMCAxMDEyLjIsMCAxMTgzLjk0LDg4Ljk0MTQgMTI5MS4zLDIzOC44MzIgYyA1My40NSwtNDEuOTYxIDExOC44LC02NC45OTIgMTg2LjU2LC02NC45OTIgMTY3LjgzLDAgMzA0LjM4LDEzNi40OTIgMzA0LjM4LDMwNC4zMzIgMCwzNy4wNzggLTYuNjIsNzIuNjI5IC0xOS4wMywxMDYuMTI5IDE1Ny43OCw1Ni44NzkgMjY2LjI3LDIwOS4xMjkgMjY2LjI3LDM3OC4xNCIgLz48cGF0aAogICAgICAgICBpZD0icGF0aDE2IgogICAgICAgICBzdHlsZT0iZmlsbDojZmFjZjA5O2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICBkPSJtIDc5Ny44OTgsMTE1MC45MyA0NDQuMDcyLC0yMDIuNDUgNDQ4LjA1LDM5Mi41OCBjIDYuNDksMzIuMzkgOS42Niw2NC42NyA5LjY2LDk4LjQ2IDAsMjc2LjIzIC0yMjQuNjgsNTAwLjk1IC01MDAuOSw1MDAuOTUgLTE2NS4yNCwwIC0zMTkuMzcsLTgxLjM2IC00MTMuMDUzLC0yMTcuNzkgbCAtNzQuNTI0LC0zODYuNjQgODYuNjk1LC0xODUuMTEiIC8+PHBhdGgKICAgICAgICAgaWQ9InBhdGgxOCIKICAgICAgICAgc3R5bGU9ImZpbGw6IzQ5YzFhZTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgZD0ibSAzMzguMjIzLDY4MC42NzIgYyAtNi40ODksLTMyLjM4MyAtOS44MDksLTY1Ljk4MSAtOS44MDksLTk5Ljk3MyAwLC0yNzYuOTI5IDIyNS4zMzYsLTUwMi4yNTc2IDUwMi4zMTMsLTUwMi4yNTc2IDE2Ni41OTMsMCAzMjEuNDczLDgyLjExNzYgNDE1LjAxMywyMTkuOTQ5NiBsIDczLjk3LDM4NS4zNDcgLTk4LjcyLDE4OC42MjEgTCA3NzUuMTU2LDEwNzUuNTcgMzM4LjIyMyw2ODAuNjcyIiAvPjxwYXRoCiAgICAgICAgIGlkPSJwYXRoMjAiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNlZjI5OWI7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgIGQ9Im0gMzM1LjQxLDE0NDkuMTggMzA0LjMzMiwtNzEuODYgNjYuNjgsMzQ2LjAyIGMgLTQxLjU4NiwzMS43OCAtOTIuOTMsNDkuMTggLTE0NS43MzEsNDkuMTggLTEzMi4yNSwwIC0yMzkuODEyLC0xMDcuNjEgLTIzOS44MTIsLTIzOS44NyAwLC0yOS4yMSA0Ljg3OSwtNTcuMjIgMTQuNTMxLC04My40NyIgLz48cGF0aAogICAgICAgICBpZD0icGF0aDIyIgogICAgICAgICBzdHlsZT0iZmlsbDojNGNhYmU0O2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICBkPSJNIDMwOC45OTIsMTM3Ni43IEMgMTczLjAyLDEzMzEuNjQgNzguNDgwNSwxMjAxLjMgNzguNDgwNSwxMDU3LjkzIDc4LjQ4MDUsOTE4LjM0IDE2NC44Miw3OTMuNjggMjk0LjQwNiw3NDQuMzUyIGwgNDI2Ljk4MSwzODUuOTM4IC03OC4zOTUsMTY3LjUxIC0zMzQsNzguOSIgLz48cGF0aAogICAgICAgICBpZD0icGF0aDI0IgogICAgICAgICBzdHlsZT0iZmlsbDojODVjZTI2O2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICBkPSJtIDEzMjMuOCwyOTguNDEgYyA0MS43NCwtMzIuMDkgOTIuODMsLTQ5LjU5IDE0NC45OCwtNDkuNTkgMTMyLjI1LDAgMjM5LjgxLDEwNy41NTkgMjM5LjgxLDIzOS44MjEgMCwyOS4xNiAtNC44OCw1Ny4xNjggLTE0LjUzLDgzLjQxOCBsIC0zMDQuMDgsNzEuMTYgLTY2LjE4LC0zNDQuODA5IiAvPjxwYXRoCiAgICAgICAgIGlkPSJwYXRoMjYiCiAgICAgICAgIHN0eWxlPSJmaWxsOiMzMTc3YTc7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgIGQ9Im0gMTM4NS42Nyw3MjIuOTMgMzM0Ljc2LC03OC4zMDEgYyAxMzYuMDIsNDQuOTYxIDIzMC41NiwxNzUuMzUxIDIzMC41NiwzMTguNzYyIDAsMTM5LjMzOSAtODYuNTQsMjYzLjg1OSAtMjE2LjM4LDMxMy4wMzkgbCAtNDM3Ljg0LC0zODMuNTkgODguOSwtMTY5LjkxIiAvPjwvZz48L2c+PC9zdmc+&quot;); background-repeat: no-repeat; background-position: center center; background-size: contain;"></div></div></div></div></div></div></div></div>`,
});

const graphRight = () => ({
  page: getPage([
    createElement({
      position: { left: 26, top: 28, width: 514, height: 637, angle: 0, parent: null },
      expression:
        'demodata | markdown "### Welcome to the Markdown element\n\nGood news! You\'re already connected to some demo data!\n\nThe data table contains\n**{{rows.length}} rows**, each containing\n the following columns:\n{{#each columns}}\n **{{name}}**\n{{/each}}"\n| render',
    }),
    createElement({
      position: { left: 540, top: 20, width: 500, height: 644.5, angle: 0, parent: null },
      expression: 'placeholder',
    }),
  ]),
  preview: `<div id="${getId(
    'page'
  )}" data-test-subj="canvasWorkpadPage" class="canvasPage kbn-resetFocusState canvasInteractivePage isActive" data-shared-items-container="true" style="background: rgb(255, 255, 255); height: 720px; width: 1080px; cursor: auto;"><div id="canvasInteractionBoundary" style="top: 50%; left: 50%; position: absolute; height: 696px; width: 1056px; margin-left: -528px; margin-top: -348px;"></div><div tabindex="-1"></div><div class="canvasPositionable canvasInteractable" style="width: 514px; height: 637px; margin-left: -257px; margin-top: -318.5px; position: absolute; transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 283, 347, 0, 1);"><div class="canvas__element canvasElement s-1718890470" data-test-subj="canvasWorkpadPageElementContent" style="overflow: hidden; width: 514px; height: 637px;"><style type="text/css">.s-1718890470 .canvasRenderEl{
  }
  </style><div data-shared-item="true" data-render-complete="true" class="canvasElement__content"><div class="canvasWorkpad--element_render canvasRenderEl" style="height: 100%; width: 100%;"><div class="render_to_dom" style="height: 100%; width: 100%;"><div style="width: 100%; height: 100%;"><div class="kbnMarkdown__body canvasMarkdown" style="font-family: &quot;Open Sans&quot;; font-weight: normal; font-style: normal; text-decoration: none; text-align: left; font-size: 14px; line-height: 1;"><h3>Welcome to the Markdown element</h3>
  <p>Good news! You're already connected to some demo data!</p>
  <p>The data table contains
  <strong>3000 rows</strong>, each containing
  the following columns:
  <strong>@timestamp</strong>
  <strong>time</strong>
  <strong>cost</strong>
  <strong>username</strong>
  <strong>price</strong>
  <strong>age</strong>
  <strong>country</strong>
  <strong>state</strong>
  <strong>project</strong>
  <strong>percent_uptime</strong></p>
  </div></div></div></div></div></div></div><div class="canvasPositionable canvasInteractable" style="width: 500px; height: 644.5px; margin-left: -250px; margin-top: -322.25px; position: absolute; transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 790, 342, 1, 1);"><div data-shared-item="true" data-render-complete="true" class="canvasElement__content"><div class="canvasWorkpad--element_render canvasRenderEl" style="height: 100%; width: 100%;"><div class="render_to_dom" style="height: 100%; width: 100%;"><div style="width: 100%; height: 100%;"><div class="canvasPlaceholder"><svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" class="euiIcon euiIcon--xLarge euiIcon--ghost euiIcon--app canvasPlaceholder__icon" focusable="false" role="img" aria-hidden="true"><path class="euiIcon__fillSecondary" d="M7 17h2v7H7zM12 14h2v10h-2zM17 16h2v8h-2zM22 14h3v2h-3zM22 18h3v2h-3zM22 22h3v2h-3z"></path><path d="M30.73 24a6.47 6.47 0 01.45-2.19c.337-.9.52-1.85.54-2.81a8.55 8.55 0 00-.54-2.81 6.47 6.47 0 01-.45-2.19 9.2 9.2 0 01.62-2.49c.53-1.57 1.08-3.19.08-4.2-1-1.01-2.41-.44-3.52.05a5.59 5.59 0 01-2.09.64 5.3 5.3 0 01-.59 0L16 .28 6.77 8a5.3 5.3 0 01-.59 0 5.59 5.59 0 01-2.09-.65C3 6.87 1.6 6.25.57 7.31c-1.03 1.06-.45 2.63.08 4.2A9.2 9.2 0 011.27 14a6.47 6.47 0 01-.45 2.19A8.55 8.55 0 00.28 19c.02.96.203 1.91.54 2.81A6.47 6.47 0 011.27 24a9.2 9.2 0 01-.62 2.49c-.53 1.57-1.08 3.19-.08 4.2.353.38.852.59 1.37.58a5.67 5.67 0 002.15-.63A5.59 5.59 0 016.18 30a7.13 7.13 0 012.29.47 8 8 0 002.62.53 7.37 7.37 0 002.47-.51A7.14 7.14 0 0116 30a6.24 6.24 0 012.14.45 8 8 0 002.77.55 8.08 8.08 0 002.77-.55 6.24 6.24 0 012.14-.45 5.59 5.59 0 012.09.65c1.11.49 2.49 1.11 3.52.05 1.03-1.06.45-2.63-.08-4.2a9.2 9.2 0 01-.62-2.5zM21.17 7h-.26a8 8 0 00-2.77.55A6.24 6.24 0 0116 8a6.24 6.24 0 01-2.14-.45A8 8 0 0011.09 7h-.26L16 2.72 21.17 7zm8.89 22.27a4.42 4.42 0 01-1.34-.46 7.08 7.08 0 00-2.9-.82 8.14 8.14 0 00-2.78.55 6.13 6.13 0 01-2.13.45 6.24 6.24 0 01-2.14-.45A8 8 0 0016 28a9 9 0 00-3.08.6 5.74 5.74 0 01-1.83.4 6.36 6.36 0 01-2-.43A8.72 8.72 0 006.18 28a7.08 7.08 0 00-2.9.82 9.65 9.65 0 01-1.28.52 6.08 6.08 0 01.52-2.21c.403-1 .65-2.055.73-3.13a8.55 8.55 0 00-.54-2.81A6.47 6.47 0 012.27 19a6.47 6.47 0 01.44-2.19c.337-.9.52-1.85.54-2.81a10.48 10.48 0 00-.72-3.13 9 9 0 01-.59-2.16H2c.447.1.88.255 1.29.46a7.08 7.08 0 002.9.82A8.14 8.14 0 009 9.44 6.13 6.13 0 0111.09 9a6.13 6.13 0 012.13.45A8.14 8.14 0 0016 10a8.14 8.14 0 002.78-.55A6.13 6.13 0 0120.91 9a6.13 6.13 0 012.09.44 8.14 8.14 0 002.78.55 7.08 7.08 0 002.9-.82A9.65 9.65 0 0130 8.66a6.08 6.08 0 01-.52 2.21c-.403 1-.65 2.055-.73 3.13.02.96.203 1.91.54 2.81a6.47 6.47 0 01.44 2.19 6.47 6.47 0 01-.44 2.19 8.55 8.55 0 00-.54 2.81c.078 1.074.32 2.13.72 3.13a9 9 0 01.59 2.16v-.02z"></path></svg></div></div></div></div></div></div></div>`,
});

export const templates = [blank, title, graphRight, imageLeft];
