import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lesson 7 — Learn Both Weight and Bias',
  description: 'An interactive visual lesson on learn both weight and bias.',
  openGraph: { title: 'Lesson 7 — Learn Both Weight and Bias', description: 'An interactive visual lesson on learn both weight and bias.', images: [] },
  twitter: { card: 'summary_large_image', title: 'Lesson 7 — Learn Both Weight and Bias', description: 'An interactive visual lesson on learn both weight and bias.', images: [] },
};

export default function Lesson07Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
