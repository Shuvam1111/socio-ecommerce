import type { Metadata } from 'next';

import { LegalPage } from '@/components/common/legal-page';
import { privacyPolicy } from '@/data/legal/privacy';

export const metadata: Metadata = {
  title: 'Privacy Policy | Socio Commerce',
  description: 'Read the Privacy Policy for Socio Commerce.',
};

export default function PrivacyPage() {
  return <LegalPage document={privacyPolicy} />;
}
