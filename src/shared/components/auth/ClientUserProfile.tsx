'use client';

import type { ComponentProps } from 'react';
import { UserProfile } from '@clerk/nextjs';

type Props = ComponentProps<typeof UserProfile>;

export default function ClientUserProfile(props: Props) {
  return <UserProfile {...props} />;
}
