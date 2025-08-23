'use client';

import type { ComponentProps } from 'react';
import { SignIn } from '@clerk/nextjs';

type Props = ComponentProps<typeof SignIn>;

export default function ClientSignIn(props: Props) {
  return <SignIn {...props} />;
}
