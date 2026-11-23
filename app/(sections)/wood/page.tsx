import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Wood' };

export default function WoodPage() {
  return (
    <article className="page-body">
      <h1 className="page-title">Wood</h1>
      <p className="page-lede">Coming soon.</p>
    </article>
  );
}
