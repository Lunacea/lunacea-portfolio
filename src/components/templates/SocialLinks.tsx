'use client';

import { faGithub, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { Icon } from '@/components/Icon';

export const SocialLinks = () => {
  const socialLinks = [
    {
      'name': 'GitHub',
      'icon': faGithub,
      'url': 'https://github.com/Lunacea', // 実際のURLに変更してください
      'aria-label': 'GitHubプロフィールを開く',
    },
    {
      'name': 'X (Twitter)',
      'icon': faXTwitter,
      'url': 'https://x.com/_Lunacea', // 実際のURLに変更してください
      'aria-label': 'X (Twitter)プロフィールを開く',
    },
  ];

  return (
    <div className="flex fixed bottom-6 left-6 z-99 flex-row gap-2">
      {socialLinks.map(link => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 hover:bg-white/5 transition-all duration-200 rounded-lg group"
          aria-label={link['aria-label']}
        >
          <Icon
            icon={link.icon}
            className="text-white/70 group-hover:text-white transition-colors duration-200 text-lg"
          />
        </a>
      ))}
    </div>
  );
};
