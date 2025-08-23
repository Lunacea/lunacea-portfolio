'use client';

import { FiChevronUp } from 'react-icons/fi';

export default function BackToTop() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="text-center py-8 border-t border-border/30">
      <button
        type="button"
        onClick={scrollToTop}
        className="group flex flex-col items-center gap-1 mx-auto text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-md p-2"
        aria-label="Back to top"
      >
        <FiChevronUp className="w-6 h-6 group-hover:translate-y-[-2px] transition-transform duration-200" />
        <span className="text-sm">Back to Top</span>
      </button>
    </div>
  );
}
