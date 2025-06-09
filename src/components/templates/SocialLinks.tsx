'use client';

import { FaEnvelope, FaGithub, FaTwitter } from 'react-icons/fa';
import Icon from '@/components/Icon';

export const SocialLinks = () => {
  const socialLinks = [
    {
      'name': 'GitHub',
      'icon': <FaGithub />,
      'url': 'https://github.com/Lunacea',
      'aria-label': 'GitHubプロフィールを開く',
    },
    {
      'name': 'X (Twitter)',
      'icon': <FaTwitter color="#1DA1F2" />,
      'url': 'https://x.com/_Lunacea',
      'aria-label': 'X (Twitter)プロフィールを開く',
    },
    {
      'name': 'Email',
      'icon': <FaEnvelope color="#FF69B4" />,
      'url': 'mailto:contact@lunacea.jp',
      'aria-label': 'メールを送信',
    },
  ];

  return (
    <>
      {socialLinks.map(link => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 hover:scale-130 transition-all duration-300 rounded-lg group"
          aria-label={link['aria-label']}
        >
          <Icon
            icon={link.icon}
            className="text-lg"
          />
        </a>
      ))}
    </>
  );
};
