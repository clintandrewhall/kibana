/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useEuiTheme } from '@elastic/eui';
import { ReportTypes } from '@kbn/exploratory-view-plugin/public';
import { i18n } from '@kbn/i18n';
import { useKibana } from '@kbn/kibana-react-plugin/public';
import React, { useMemo } from 'react';
import { ClientPluginsStart } from '../../../../../plugin';
import { useMonitorQueryFilters } from '../hooks/use_monitor_query_filters';

interface MonitorErrorsCountProps {
  from: string;
  to: string;
  id: string;
}

export const MonitorErrorsCount = ({ from, to, id }: MonitorErrorsCountProps) => {
  const {
    exploratoryView: { ExploratoryViewEmbeddable },
  } = useKibana<ClientPluginsStart>().services;
  const { euiTheme } = useEuiTheme();
  const isAmsterdam = euiTheme.flags.hasVisColorAdjustment;
  const { queryIdFilter, locationFilter } = useMonitorQueryFilters();

  const time = useMemo(() => ({ from, to }), [from, to]);

  if (!queryIdFilter) {
    return null;
  }

  return (
    <ExploratoryViewEmbeddable
      id={id}
      align="left"
      customHeight="70px"
      reportType={ReportTypes.SINGLE_METRIC}
      attributes={[
        {
          time,
          reportDefinitions: queryIdFilter,
          dataType: 'synthetics',
          selectedMetricField: 'monitor_errors',
          name: ERRORS_LABEL,
          filters: locationFilter,
          color: isAmsterdam ? euiTheme.colors.vis.euiColorVis1 : euiTheme.colors.vis.euiColorVis6,
        },
      ]}
    />
  );
};

export const ERRORS_LABEL = i18n.translate('xpack.synthetics.monitorDetails.summary.errors', {
  defaultMessage: 'Errors',
});
