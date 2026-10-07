import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lesson 11 — Backpropagation',
  description: 'An interactive visual lesson on backpropagation.',
  openGraph: { title: 'Lesson 11 — Backpropagation', description: 'An interactive visual lesson on backpropagation.', images: [] },
  twitter: { card: 'summary_large_image', title: 'Lesson 11 — Backpropagation', description: 'An interactive visual lesson on backpropagation.', images: [] },
};

export default function Lesson11Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
