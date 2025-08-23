'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { Env } from '@/shared/libs/Env';
import { SuspendedPostHogPageView } from './PostHogPageView';

export default function PostHogProvider(props: { children: React.ReactNode }) {
  useEffect(() => {
    if (Env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(Env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: Env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false,
        capture_pageleave: true,
      });
    }
  }, []);

  if (!Env.NEXT_PUBLIC_POSTHOG_KEY) {
    return props.children;
  }

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {props.children}
    </PHProvider>
  );
}
