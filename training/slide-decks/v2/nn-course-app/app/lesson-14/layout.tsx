import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lesson 14 — Introduction to PyTorch',
  description: 'An interactive visual lesson on introduction to pytorch.',
  openGraph: { title: 'Lesson 14 — Introduction to PyTorch', description: 'An interactive visual lesson on introduction to pytorch.', images: [] },
  twitter: { card: 'summary_large_image', title: 'Lesson 14 — Introduction to PyTorch', description: 'An interactive visual lesson on introduction to pytorch.', images: [] },
};

export default function Lesson14Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
