import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lesson 5 — Make the Neuron Learn Repeatedly',
  description: 'An interactive visual lesson on make the neuron learn repeatedly.',
  openGraph: { title: 'Lesson 5 — Make the Neuron Learn Repeatedly', description: 'An interactive visual lesson on make the neuron learn repeatedly.', images: [] },
  twitter: { card: 'summary_large_image', title: 'Lesson 5 — Make the Neuron Learn Repeatedly', description: 'An interactive visual lesson on make the neuron learn repeatedly.', images: [] },
};

export default function Lesson05Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
