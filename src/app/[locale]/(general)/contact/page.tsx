import { useTranslations } from 'next-intl';

/**
 * お問い合わせページ
 */
export default function ContactPage() {
  const t = useTranslations('Contact');

  // デフォルトテキスト
  const defaultTexts = {
    title: 'お問い合わせ',
    description: 'お問い合わせフォームは準備中です。',
    comingSoon: '近日公開',
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 font-heading">
        {t('title') || defaultTexts.title}
      </h1>
      <p className="mb-8">
        {t('description') || defaultTexts.description}
      </p>

      <div className="bg-black/20 backdrop-blur-sm p-8 rounded-lg">
        <p className="text-center text-xl">
          {t('coming_soon') || defaultTexts.comingSoon}
        </p>
      </div>
    </div>
  );
}
