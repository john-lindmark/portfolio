import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Design' };

export default function DesignPage() {
  return (
    <article className="page-body">
      <h1 className="page-title">Design</h1>
      <p className="page-lede">Coming soon.</p>
    </article>
  );
}
