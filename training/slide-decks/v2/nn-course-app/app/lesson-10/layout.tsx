import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lesson 10 — Your First Hidden Layer',
  description: 'An interactive visual lesson on your first hidden layer.',
  openGraph: { title: 'Lesson 10 — Your First Hidden Layer', description: 'An interactive visual lesson on your first hidden layer.', images: [] },
  twitter: { card: 'summary_large_image', title: 'Lesson 10 — Your First Hidden Layer', description: 'An interactive visual lesson on your first hidden layer.', images: [] },
};

export default function Lesson10Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
