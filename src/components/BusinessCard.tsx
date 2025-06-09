import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { FaEnvelope, FaGithub, FaGraduationCap, FaMapMarkerAlt, FaTwitter } from 'react-icons/fa';
import Icon from '@/components/Icon';

export default function BusinessCard() {
  const t = useTranslations('BusinessCard');

  return (
    <>
      <div className="flex items-center gap-6 mb-6">
        <Image
          src="/assets/images/Lunacea-nobg.png"
          alt="Lunacea"
          width={80}
          height={80}
          className="rounded-full pointer-events-none"
          priority
        />
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Lunacea</h1>
          <p className="text-muted-foreground">Web Developer & Interaction Designer</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <Icon icon={<FaGithub className="w-4 h-4" />} className="text-muted-foreground w-4" />
          <span className="text-sm text-muted-foreground">Lunacea</span>
        </div>
        <div className="flex items-center gap-3">
          <Icon icon={<FaTwitter className="w-4 h-4" />} className="text-muted-foreground w-4" />
          <span className="text-sm text-muted-foreground">@_Lunacea</span>
        </div>
        <div className="flex items-center gap-3">
          <Icon icon={<FaEnvelope className="w-4 h-4" />} className="text-muted-foreground w-4" />
          <span className="text-sm text-muted-foreground">contact@lunacea.jp</span>
        </div>
      </div>

      {/* University Info */}
      <div className="flex justify-center items-center gap-6 text-xs text-muted-foreground pt-4 border-t border-border/30">
        <div className="flex items-center gap-2">
          <Icon icon={<FaMapMarkerAlt className="w-4 h-4" />} className="text-muted-foreground" />
          <span>{t('university_name')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon icon={<FaGraduationCap className="w-4 h-4" />} className="text-muted-foreground" />
          <span>{t('department_name')}</span>
        </div>
      </div>

      {/* ドラッグヒント */}
      <div className="absolute top-2 right-2 opacity-40 pointer-events-none">
        <div className="text-xs text-muted-foreground">📌</div>
      </div>

      {/* Drag Meテキスト */}
      <div className="absolute bottom-2 left-2 opacity-30 pointer-events-none">
        <div className="text-xs text-muted-foreground italic">drag me</div>
      </div>
    </>
  );
}
