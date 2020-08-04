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
      expression:
        'filters\n| demodata\n| pointseries x="size(cost)" y="project" color="project"\n| plot defaultStyle={seriesStyle bars=0.75 horizontalBars=true} legend=false\n| render',
    }),
  ]),
  preview: `<div id="page-e1b80889-a623-438a-a6a5-b797297e2cd8-preview" data-test-subj="canvasWorkpadPage" class="canvasPage kbn-resetFocusState canvasInteractivePage isActive" data-shared-items-container="true" style="background: rgb(255, 255, 255); height: 720px; width: 1080px; cursor: auto;"><div id="canvasInteractionBoundary" style="top: 50%; left: 50%; position: absolute; height: 999.33px; width: 1197.33px; margin-left: -598.665px; margin-top: -499.665px;"></div><div tabindex="-1"></div><div class="canvasPositionable canvasInteractable" style="width: 514px; height: 637px; margin-left: -257px; margin-top: -318.5px; position: absolute; transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 283, 347, 0, 1);"><div class="canvas__element canvasElement s1415828084" data-test-subj="canvasWorkpadPageElementContent" style="overflow: hidden; width: 514px; height: 637px;"><style type="text/css">.s1415828084 .canvasRenderEl{
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
  </div></div></div></div></div></div></div><div class="canvasPositionable canvasInteractable" style="width: 500px; height: 644.5px; margin-left: -250px; margin-top: -322.25px; position: absolute; transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 790, 342, 1, 1);"><div class="canvas__element canvasElement s-1634453886" data-test-subj="canvasWorkpadPageElementContent" style="overflow: hidden; width: 500px; height: 644.5px;"><style type="text/css">.s-1634453886 .canvasRenderEl{
  }
  </style><div data-shared-item="true" data-render-complete="true" class="canvasElement__content"><div class="canvasWorkpad--element_render canvasRenderEl" style="height: 100%; width: 100%;"><div class="render_to_dom" style="height: 100%; width: 100%;"><div style="width: 100%; height: 100%; padding: 0px; position: relative;"><canvas class="flot-base" width="750" height="966" style="direction: ltr; position: absolute; left: 0px; top: 0px; width: 500px; height: 644.5px;"></canvas><div class="flot-text" style="position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px; font-size: smaller; color: rgb(84, 84, 84);"><div class="flot-x-axis flot-x1-axis xAxis x1Axis" style="position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px;"><div style="position: absolute; max-width: 50px; top: 629px; font: 14px / 16px Baskerville; color: rgb(0, 0, 0); left: 125px; text-align: center;">0</div><div style="position: absolute; max-width: 50px; top: 629px; font: 14px / 16px Baskerville; color: rgb(0, 0, 0); left: 163px; text-align: center;">50</div><div style="position: absolute; max-width: 50px; top: 629px; font: 14px / 16px Baskerville; color: rgb(0, 0, 0); left: 202px; text-align: center;">100</div><div style="position: absolute; max-width: 50px; top: 629px; font: 14px / 16px Baskerville; color: rgb(0, 0, 0); left: 245px; text-align: center;">150</div><div style="position: absolute; max-width: 50px; top: 629px; font: 14px / 16px Baskerville; color: rgb(0, 0, 0); left: 287px; text-align: center;">200</div><div style="position: absolute; max-width: 50px; top: 629px; font: 14px / 16px Baskerville; color: rgb(0, 0, 0); left: 329px; text-align: center;">250</div><div style="position: absolute; max-width: 50px; top: 629px; font: 14px / 16px Baskerville; color: rgb(0, 0, 0); left: 372px; text-align: center;">300</div><div style="position: absolute; max-width: 50px; top: 629px; font: 14px / 16px Baskerville; color: rgb(0, 0, 0); left: 414px; text-align: center;">350</div><div style="position: absolute; max-width: 50px; top: 629px; font: 14px / 16px Baskerville; color: rgb(0, 0, 0); left: 456px; text-align: center;">400</div></div><div class="flot-y-axis flot-y1-axis yAxis y1Axis" style="position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px;"><div style="position: absolute; top: 552px; font: 14px / 16px Baskerville; color: rgb(0, 0, 0); left: 54px; text-align: right;">logstash</div><div style="position: absolute; top: 481px; font: 14px / 16px Baskerville; color: rgb(0, 0, 0); left: 53px; text-align: right;">swiftype</div><div style="position: absolute; top: 409px; font: 14px / 16px Baskerville; color: rgb(0, 0, 0); left: 61px; text-align: right;">x-pack</div><div style="position: absolute; top: 337px; font: 14px / 16px Baskerville; color: rgb(0, 0, 0); left: 60px; text-align: right;">kibana</div><div style="position: absolute; top: 265px; font: 14px / 16px Baskerville; color: rgb(0, 0, 0); left: 0px; text-align: right;">machine-learning</div><div style="position: absolute; top: 194px; font: 14px / 16px Baskerville; color: rgb(0, 0, 0); left: 73px; text-align: right;">apm</div><div style="position: absolute; top: 122px; font: 14px / 16px Baskerville; color: rgb(0, 0, 0); left: 69px; text-align: right;">beats</div><div style="position: absolute; top: 50px; font: 14px / 16px Baskerville; color: rgb(0, 0, 0); left: 29px; text-align: right;">elasticsearch</div></div></div><canvas class="flot-overlay" width="750" height="966" style="direction: ltr; position: absolute; left: 0px; top: 0px; width: 500px; height: 644.5px;"></canvas></div></div></div></div></div></div></div>`,
});

export const templates = [blank, title, imageLeft, graphRight];
