'use client';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type IconProps = {
  icon: IconDefinition;
  className?: string;
  spin?: boolean;
};

export function Icon({ icon, className = '', spin = false }: IconProps) {
  return (
    <FontAwesomeIcon
      icon={icon}
      className={`fa-fw ${className}`}
      spin={spin}
      style={{
        width: '1em',
        height: '1em',
        display: 'inline-block',
      }}
    />
  );
}
