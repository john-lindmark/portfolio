import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Photo' };

export default function PhotoPage() {
  return (
    <article className="page-body">
      <h1 className="page-title">Photo</h1>
      <p className="page-lede">Coming soon.</p>
    </article>
  );
}
