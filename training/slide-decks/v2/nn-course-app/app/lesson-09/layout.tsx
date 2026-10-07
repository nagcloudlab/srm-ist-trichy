import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lesson 9 — Why One Neuron Is Not Enough',
  description: 'An interactive visual lesson on why one neuron is not enough.',
  openGraph: { title: 'Lesson 9 — Why One Neuron Is Not Enough', description: 'An interactive visual lesson on why one neuron is not enough.', images: [] },
  twitter: { card: 'summary_large_image', title: 'Lesson 9 — Why One Neuron Is Not Enough', description: 'An interactive visual lesson on why one neuron is not enough.', images: [] },
};

export default function Lesson09Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
