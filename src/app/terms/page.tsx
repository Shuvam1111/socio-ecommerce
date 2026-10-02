import type { Metadata } from 'next';

import { LegalPage } from '@/components/common/legal-page';
import { termsDocument } from '@/data/legal/terms';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Sociol Commerce',
  description: 'Read the Terms & Conditions for using Sociol Commerce.',
};
export default function TermsPage() {
  return <LegalPage document={termsDocument} />;
}
