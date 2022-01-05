/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC } from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { keys } from '@elastic/eui';

import { ServicesProvider } from '../../services';
import { servicesFactory } from '../../services/jest';
import { ExitFullScreenButton } from './exit_full_screen_button';

const services = servicesFactory();
const Context: FC = ({ children }) => <ServicesProvider {...services}>{children}</ServicesProvider>;

describe('<ExitFullScreenButton />', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('is rendered', () => {
    const component = mount(
      <Context>
        <ExitFullScreenButton onExit={jest.fn()} />
      </Context>
    );

    expect(component).toMatchSnapshot();
  });

  test('passing `false` to toggleChrome does not toggle chrome', () => {
    const component = mount(
      <Context>
        <ExitFullScreenButton onExit={jest.fn()} toggleChrome={false} />
      </Context>
    );
    expect(services.chrome.setIsChromeVisible).toHaveBeenCalledTimes(0);
    component.unmount();
    expect(services.chrome.setIsChromeVisible).toHaveBeenCalledTimes(0);
  });

  describe('onExit', () => {
    const onExitHandler = jest.fn();
    let component: ReactWrapper;

    beforeEach(() => {
      component = mount(
        <Context>
          <ExitFullScreenButton onExit={onExitHandler} toggleChrome={true} />
        </Context>
      );
    });

    test('is called when the button is pressed', () => {
      expect(services.chrome.setIsChromeVisible).toHaveBeenLastCalledWith(false);

      component.find('button').simulate('click');

      expect(onExitHandler).toHaveBeenCalledTimes(1);
      component.unmount();
      expect(services.chrome.setIsChromeVisible).toHaveBeenLastCalledWith(true);
    });

    test('is called when the ESC key is pressed', () => {
      expect(services.chrome.setIsChromeVisible).toHaveBeenLastCalledWith(false);

      const escapeKeyEvent = new KeyboardEvent('keydown', { key: keys.ESCAPE } as any);
      document.dispatchEvent(escapeKeyEvent);

      expect(onExitHandler).toHaveBeenCalledTimes(1);
      component.unmount();
      expect(services.chrome.setIsChromeVisible).toHaveBeenLastCalledWith(true);
    });
  });
});
