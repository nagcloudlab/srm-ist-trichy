import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lesson 8 — A Neuron with Multiple Inputs',
  description: 'An interactive visual lesson on a neuron with multiple inputs.',
  openGraph: { title: 'Lesson 8 — A Neuron with Multiple Inputs', description: 'An interactive visual lesson on a neuron with multiple inputs.', images: [] },
  twitter: { card: 'summary_large_image', title: 'Lesson 8 — A Neuron with Multiple Inputs', description: 'An interactive visual lesson on a neuron with multiple inputs.', images: [] },
};

export default function Lesson08Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
