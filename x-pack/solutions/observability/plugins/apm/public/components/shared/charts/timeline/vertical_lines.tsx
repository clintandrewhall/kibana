/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { useEuiTheme } from '@elastic/eui';
import type { Mark } from '../../../app/transaction_details/waterfall_with_summary/waterfall_container/marks';
import type { PlotValues } from './plot_utils';

interface VerticalLinesProps {
  marks?: Mark[];
  plotValues: PlotValues;
  topTraceDuration: number;
}

export function VerticalLines({ topTraceDuration, plotValues, marks = [] }: VerticalLinesProps) {
  const { width, margins, tickValues, xScale } = plotValues;

  const markTimes = marks.filter((mark) => mark.verticalLine).map(({ offset }) => offset);

  const { euiTheme } = useEuiTheme();

  const tickPositions = tickValues.reduce<number[]>((positions, tick) => {
    const position = xScale(tick);
    return Number.isFinite(position) ? [...positions, position] : positions;
  }, []);

  const markPositions = markTimes.reduce<number[]>((positions, mark) => {
    const position = xScale(mark);
    return Number.isFinite(position) ? [...positions, position] : positions;
  }, []);

  const topTraceDurationPosition = topTraceDuration > 0 ? xScale(topTraceDuration) : NaN;

  return (
    <svg
      width={width}
      height="100%"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      <g transform={`translate(0 ${margins.top})`}>
        {tickPositions.map((position, index) => (
          <line
            key={`tick-${position}-${index}`}
            x1={position}
            x2={position}
            y1={0}
            y2="100%"
            stroke={euiTheme.colors.lightestShade}
          />
        ))}
        {markPositions.map((position, index) => (
          <line
            key={`mark-${position}-${index}`}
            x1={position}
            x2={position}
            y1={0}
            y2="100%"
            stroke={euiTheme.colors.mediumShade}
          />
        ))}
        {Number.isFinite(topTraceDurationPosition) && (
          <line
            key="topTrace"
            x1={topTraceDurationPosition}
            x2={topTraceDurationPosition}
            y1={0}
            y2="100%"
            stroke={euiTheme.colors.mediumShade}
          />
        )}
      </g>
    </svg>
  );
}
