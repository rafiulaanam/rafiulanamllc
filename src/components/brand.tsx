import Image from 'next/image';
import Link from 'next/link';
import { companyLogo, companyMonogram, mediaUrl } from '@/lib/media';

export function Brand({ name, image, footer = false }: { name: string; image?: string | null; footer?: boolean }) {
  const logo = mediaUrl(image);
  if (footer && !logo) return <Link className="brand brand-lockup" href="/">
    <Image src={companyLogo} width={740} height={386} sizes="192px" alt={name} />
  </Link>;

  return <Link className="brand" href="/">
    <Image src={logo ?? companyMonogram} width={40} height={40} alt="" className="brand-logo brand-monogram" />
    <span>{name}</span>
  </Link>;
}
