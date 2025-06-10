import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

// This is the root layout component for the Next.js app
// Since we're using [locale] routing, this layout should be minimal
// and delegate most logic to the locale-specific layout
export default function RootLayout({ children }: Props) {
  return children;
}
