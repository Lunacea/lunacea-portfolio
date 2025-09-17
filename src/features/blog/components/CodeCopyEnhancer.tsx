'use client';

import { useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useTranslations } from 'next-intl';
import { FaCheck, FaRegCopy } from 'react-icons/fa';
import Icon from '@/shared/components/ui/Icon';

export default function CodeCopyEnhancer() {
  const t = useTranslations('Blog');

  useEffect(() => {
    const container = document.querySelector<HTMLElement>('.blog-content');
    if (!container) return;

    const pres = Array.from(container.querySelectorAll<HTMLPreElement>('pre'));
    const disposers: Array<() => void> = [];

    pres.forEach((pre) => {
      if (pre.dataset.copyApplied === 'true') return;
      pre.dataset.copyApplied = 'true';

      pre.classList.add('code-copy-enabled');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy-btn';
      btn.setAttribute('aria-label', t('copy'));

      // Reactアイコンをボタンに描画
      const root: Root = createRoot(btn);
      const renderCopy = () => root.render(
        <>
          <Icon icon={<FaRegCopy />} />
          <span className="sr-only">{t('copy')}</span>
        </>,
      );
      const renderChecked = () => root.render(
        <>
          <Icon icon={<FaCheck />} />
          <span className="sr-only">{t('copied')}</span>
        </>,
      );
      renderCopy();

      const onClick = async () => {
        const code = pre.querySelector('code');
        const text = code?.textContent ?? pre.textContent ?? '';
        try {
          await navigator.clipboard.writeText(text);
          renderChecked();
          btn.classList.add('code-copy-success');
          setTimeout(() => {
            renderCopy();
            btn.classList.remove('code-copy-success');
          }, 1500);
        } catch {
          const range = document.createRange();
          range.selectNodeContents(pre);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      };

      btn.addEventListener('click', onClick);
      pre.appendChild(btn);

      disposers.push(() => {
        btn.removeEventListener('click', onClick);
        // React描画中の同期unmountを避けるため非同期でunmount
        setTimeout(() => { try { root.unmount(); } catch {} }, 0);
        btn.remove();
        delete pre.dataset.copyApplied;
        pre.classList.remove('code-copy-enabled');
      });
    });

    return () => {
      disposers.forEach((d) => d());
    };
  }, [t]);

  return null;
}



