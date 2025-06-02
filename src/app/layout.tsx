import { ThemeProvider } from 'next-themes';
import { Inter, Rajdhani } from 'next/font/google';
import '@/styles/global.css'; // グローバルCSSのインポート

// Interフォントの設定（パフォーマンス最適化）
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

// Rajdhaniフォント（heading用・技術的でクリーンなフォント）
const rajdhani = Rajdhani({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-rajdhani',
  preload: true,
  weight: ['300', '400', '500', '600', '700'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // TODO: lang 属性は一旦削除し、[locale]/layout.tsx で documentElement に設定することを検討
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.variable} ${rajdhani.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="theme"
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
