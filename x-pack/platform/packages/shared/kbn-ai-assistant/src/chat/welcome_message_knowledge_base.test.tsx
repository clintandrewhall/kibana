/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { act, render, screen } from '@testing-library/react';

import { WelcomeMessageKnowledgeBase } from './welcome_message_knowledge_base';
import type { UseKnowledgeBaseResult } from '../hooks/use_knowledge_base';
import { KibanaRenderContextProvider } from '@kbn/react-kibana-context-render';
import { coreMock } from '@kbn/core/public/mocks';

const corePluginMock = coreMock.createStart();

describe('WelcomeMessageKnowledgeBase', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  function createMockKnowledgeBase(
    partial: Partial<UseKnowledgeBaseResult> = {}
  ): UseKnowledgeBaseResult {
    return {
      isInstalling: partial.isInstalling ?? false,
      install: partial.install ?? jest.fn(),
      installError: partial.installError,
      status: partial.status ?? {
        value: {
          ready: false,
          enabled: true,
        },
        loading: false,
        error: undefined,
        refresh: jest.fn(),
      },
    };
  }

  function renderComponent(kb: UseKnowledgeBaseResult) {
    return render(
      <KibanaRenderContextProvider {...corePluginMock}>
        <WelcomeMessageKnowledgeBase knowledgeBase={kb} />
      </KibanaRenderContextProvider>
    );
  }

  it('renders install message if isInstalling', () => {
    const kb = createMockKnowledgeBase({ isInstalling: true });
    renderComponent(kb);

    expect(screen.getByText(/Installing Knowledge Base/i)).toBeInTheDocument();
  });

  it('renders the success banner after a transition from installing to not installing with no error', async () => {
    // 1) Start in an installing state
    let kb = createMockKnowledgeBase({
      isInstalling: true,
    });
    const { rerender, container } = renderComponent(kb);

    // Should not see success banner initially
    expect(container).not.toBeEmptyDOMElement();

    // 2) Transition to isInstalling = false, no installError
    kb = {
      ...kb,
      isInstalling: false,
      status: {
        ...kb.status,
        value: {
          ...kb.status.value,
          ready: true,
          enabled: true,
        },
      },
    };

    await act(async () => {
      rerender(<WelcomeMessageKnowledgeBase knowledgeBase={kb} />);
    });

    // Now we should see success banner
    expect(container).toBeEmptyDOMElement();
  });

  it('renders "not set up" if installError is present', () => {
    const kb = createMockKnowledgeBase({
      installError: new Error('model deployment failed'),
    });
    renderComponent(kb);

    expect(screen.getByText(/You have not set up a Knowledge Base yet./i)).toBeInTheDocument();
    expect(screen.getByText(/Install Knowledge base/i)).toBeInTheDocument();
    // Because we have an installError, we also see "Inspect issues" button
    expect(screen.getByText(/Inspect issues/i)).toBeInTheDocument();
  });

  it('renders "not set up" if server returns errorMessage (no endpoint exists) but user hasnt started installing', () => {
    // this happens when no endpoint exists because user has never installed
    // which can happen for on prem users with preconfigured connector where /setup is not
    // automatically called
    const kb = createMockKnowledgeBase({
      isInstalling: false,
      installError: undefined,
      status: {
        value: {
          ready: false,
          enabled: true,
          errorMessage: 'no endpoint',
        },
        loading: false,
        refresh: jest.fn(),
      },
    });
    renderComponent(kb);

    expect(screen.getByText(/You have not set up a Knowledge Base yet./i)).toBeInTheDocument();
    expect(screen.getByText(/Install Knowledge base/i)).toBeInTheDocument();
    expect(screen.queryByText(/Inspect issues/i)).toBeNull();
  });

  it('renders "not set up" if model is not ready (but no errorMessage because endpoint exists)', () => {
    // This could happen if the user manually stopped the model in ML,
    // so we have no install error, but ready = false
    const kb = createMockKnowledgeBase({
      isInstalling: false,
      status: {
        value: {
          endpoint: {},
          ready: false,
          enabled: true,
        },
        loading: false,
        error: undefined,
        refresh: jest.fn(),
      },
    });
    renderComponent(kb);

    expect(screen.getByText(/You have not set up a Knowledge Base yet./i)).toBeInTheDocument();
    expect(screen.getByText(/Install Knowledge base/i)).toBeInTheDocument();
    expect(screen.getByText(/Inspect issues/i)).toBeInTheDocument();
  });

  it('renders nothing if the knowledge base is already installed', () => {
    const kb = createMockKnowledgeBase({
      status: {
        value: {
          ready: true,
          enabled: true,
          errorMessage: undefined,
        },
        loading: false,
        error: undefined,
        refresh: jest.fn(),
      },
    });
    renderComponent(kb);

    expect(screen.queryByText(/We are setting up your knowledge base/i)).toBeNull();
    expect(screen.queryByText(/You have not set up a Knowledge Base yet./i)).toBeNull();
    expect(screen.queryByText(/Knowledge base successfully installed/i)).toBeNull();
  });
});
