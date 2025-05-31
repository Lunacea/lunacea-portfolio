'use client';
import type { ReactElement } from 'react';

type IconProps = {
  icon: ReactElement;
  className?: string;
  spin?: boolean;
};

export function Icon({ icon, className = '', spin = false }: IconProps) {
  const combinedClassName = `
    w-[1em] h-[1em] inline-block align-middle
    ${spin ? 'animate-spin' : ''}
    ${className}
  `.trim();

  return (
    <span className={combinedClassName}>
      {icon}
      {/* スピンアニメーションはTailwindの animate-spin を使用するため、<style jsx> は不要になる場合がありますが、
          カスタムの icon-spin を使いたい場合は残します。
          Tailwindの animate-spin で問題なければ削除も検討できます。
          ここではTailwindのものを優先し、<style jsx>はコメントアウトまたは削除の検討対象とします。
      */}
      {/* <style jsx>
        {`
        @keyframes icon-spin {
          100% { transform: rotate(360deg); }
        }
      `}
      </style> */}
    </span>
  );
}
