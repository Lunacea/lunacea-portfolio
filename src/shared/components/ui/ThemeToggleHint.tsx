import Image from 'next/image';

export default function ThemeToggleHint() {
  return (
    <div className="flex mx-auto pr-12 items-baseline gap-2 text-rose-600/80 dark:text-rose-500/80 justify-center rotate-[-5deg]">
      <span className="text-2xl whitespace-nowrap font-handwriting font-semibold">
        touch here!
      </span>
      <Image
        src="/assets/images/arrow_upright_rose600.png"
        alt="手書き風矢印"
        width={60}
        height={60}
        className="opacity-80 h-auto"
      />
    </div>
  );
}
