'use client';

export function GlobalStyles() {
  return (
    <style jsx global>
      {`
      .active-nav-highlight::before {
        content: '';
        position: absolute;
        left: -4px; /* リンクの少し左に配置 */
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 60%; /* リンクの高さの60% */
        background-color: var(--primary);
        border-radius: 0 2px 2px 0;
      }
    `}
    </style>
  );
}
