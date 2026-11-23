import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <article className="page-body">
      <h1 className="page-title">About</h1>
      <p className="page-lede">Coming soon.</p>
    </article>
  );
}
