'use client';

import type { ComponentProps } from 'react';
import { SignUp } from '@clerk/nextjs';

type Props = ComponentProps<typeof SignUp>;

export default function ClientSignUp(props: Props) {
  return <SignUp {...props} />;
}
