'use client';
import type { ReactElement } from 'react';

type IconProps = {
  icon: ReactElement;
  className?: string;
};

export default function Icon({ icon, className }: IconProps) {
  const combinedClassName = `
    w-[1em] h-[1em] inline-block align-middle
    ${className}
  `.trim();

  return (
    <span className={combinedClassName}>
      {icon}
    </span>
  );
}
