import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Product' };

export default function ProductPage() {
  return (
    <article className="page-body">
      <h1 className="page-title">Product</h1>
      <p className="page-lede">Coming soon.</p>
    </article>
  );
}
