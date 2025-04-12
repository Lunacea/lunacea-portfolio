'use client';

import { animated, useSpring } from '@react-spring/web';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type SplitTextProps = {
  text?: string;
  className?: string;
  delay?: number;
  textAlign?: 'left' | 'right' | 'center' | 'justify' | 'start' | 'end';
};

type AnimatedCharProps = {
  char: string;
  delay: number;
  show: boolean;
  index: number;
  totalChars: number;
};

const AnimatedChar = ({ char, delay, show, index, totalChars }: AnimatedCharProps) => {
  const progress = index / (totalChars - 1);

  const friction = 26 + progress * 12;

  const props = useSpring({
    config: {
      mass: 1,
      tension: 180,
      friction,
      clamp: false,
    },
    from: { opacity: 0, transform: 'translateY(15px)' },
    to: show
      ? { opacity: 1, transform: 'translateY(0px)' }
      : { opacity: 0, transform: 'translateY(15px)' },
    delay,
  });

  const AnimatedSpan = animated('span');

  return (
    <AnimatedSpan
      style={props}
      className="inline-block"
    >
      {char === ' ' ? '\u00A0' : char}
    </AnimatedSpan>
  );
};

const SplitText: React.FC<SplitTextProps> = ({
  text = '',
  className = '',
  delay = 18,
  textAlign = 'center',
}) => {
  const characters = text.split('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    <span
      className={`inline-block text-align-${textAlign} ${className}`}
    >
      <Link href="/">
        {characters.map((char, index) => {
          const calculatedDelay = delay * 0.97 ** index * (index + 1);

          return (
            <AnimatedChar
              key={index}
              char={char}
              delay={calculatedDelay}
              show={show}
              index={index}
              totalChars={characters.length}
            />
          );
        })}
      </Link>
    </span>
  );
};

export default SplitText;
