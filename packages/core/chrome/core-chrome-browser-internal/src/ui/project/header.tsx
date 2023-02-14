/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import {
  EuiAvatar,
  EuiButtonIcon,
  EuiCollapsibleNav,
  EuiHeader,
  EuiHeaderLogo,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiThemeProvider,
  EuiSideNav,
  useEuiTheme,
} from '@elastic/eui';
import {
  ChromeBreadcrumb,
  ChromeGlobalHelpExtensionMenuLink,
  ChromeHelpExtension,
} from '@kbn/core-chrome-browser/src';
import { Observable } from 'rxjs';
import { MountPoint } from '@kbn/core-mount-utils-browser';
import { InternalApplicationStart } from '@kbn/core-application-browser-internal';
import { css } from '@emotion/react';
import { HeaderBreadcrumbs } from '../header/header_breadcrumbs';
import { HeaderActionMenu } from '../header/header_action_menu';
import { HeaderHelpMenu } from '../header/header_help_menu';

import { sideNav } from './demo';

interface Props {
  breadcrumbs$: Observable<ChromeBreadcrumb[]>;
  actionMenu$: Observable<MountPoint | undefined>;
  kibanaDocLink: string;
  globalHelpExtensionMenuLinks$: Observable<ChromeGlobalHelpExtensionMenuLink[]>;
  helpExtension$: Observable<ChromeHelpExtension | undefined>;
  helpSupportUrl$: Observable<string>;
  kibanaVersion: string;
  application: InternalApplicationStart;
}

export const ProjectHeader = ({
  application,
  kibanaDocLink,
  kibanaVersion,
  ...observables
}: Props) => {
  const { euiTheme, colorMode } = useEuiTheme();
  const renderLogo = () => (
    <EuiHeaderLogo
      iconType="logoElastic"
      href="#"
      onClick={(e) => e.preventDefault()}
      aria-label="Go to home page"
    />
  );

  return (
    <>
      <EuiHeader position="fixed">
        <EuiHeaderSection grow={false}>
          <EuiHeaderSectionItem border="right">{renderLogo()}</EuiHeaderSectionItem>
          <EuiHeaderSectionItem>
            <HeaderBreadcrumbs breadcrumbs$={observables.breadcrumbs$} />
          </EuiHeaderSectionItem>
        </EuiHeaderSection>
        <EuiHeaderSection side="right">
          <EuiHeaderSectionItem>
            <HeaderHelpMenu
              globalHelpExtensionMenuLinks$={observables.globalHelpExtensionMenuLinks$}
              helpExtension$={observables.helpExtension$}
              helpSupportUrl$={observables.helpSupportUrl$}
              kibanaDocLink={kibanaDocLink}
              kibanaVersion={kibanaVersion}
              navigateToUrl={application.navigateToUrl}
            />
          </EuiHeaderSectionItem>
          <EuiHeaderSectionItem border="left">
            <HeaderActionMenu actionMenu$={observables.actionMenu$} />
          </EuiHeaderSectionItem>
        </EuiHeaderSection>
      </EuiHeader>
      <EuiThemeProvider colorMode={colorMode === 'DARK' ? 'LIGHT' : 'DARK'}>
        <EuiCollapsibleNav
          css={{
            borderInlineEndWidth: 1,
            background: euiTheme.colors.darkestShade,
          }}
          isOpen={true}
          onClose={() => {}}
          closeButtonProps={{ iconType: 'menuLeft' }}
          showButtonIfDocked={true}
          isDocked={true}
          size={248}
          hideCloseButton={false}
          button={
            <span css={{ marginLeft: -40, marginTop: 16, position: 'fixed', zIndex: 1000 }}>
              <EuiButtonIcon iconType="menuLeft" aria-label="Open nav" color="text" />
            </span>
          }
        >
          <EuiSideNav
            aria-label="Force-open example"
            css={css`
              padding: 12px 20px;

              .euiSideNavItemButton {
                color: ${euiTheme.colors.ghost};
              }
            `}
            heading={
              <div>
                <EuiAvatar
                  iconType="logoObservability"
                  name="Observability"
                  color={euiTheme.colors.lightestShade}
                  size="m"
                  style={{ marginRight: 12 }}
                />
                Observability
              </div>
            }
            items={sideNav}
          />
        </EuiCollapsibleNav>
      </EuiThemeProvider>
    </>
  );
};
