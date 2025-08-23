'use client';

import type { PropsWithChildren } from 'react';
import { ClerkProvider } from '@clerk/nextjs';

type Props = PropsWithChildren<{
  localization: any;
  signInUrl: string;
  signUpUrl: string;
  dashboardUrl: string;
  afterSignOutUrl: string;
}>;

export default function ClientClerkProvider({
  children,
  localization,
  signInUrl,
  signUpUrl,
  dashboardUrl,
  afterSignOutUrl,
}: Props) {
  return (
    <ClerkProvider
      localization={localization}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      signInFallbackRedirectUrl={dashboardUrl}
      signUpFallbackRedirectUrl={dashboardUrl}
      afterSignOutUrl={afterSignOutUrl}
    >
      {children}
    </ClerkProvider>
  );
}
