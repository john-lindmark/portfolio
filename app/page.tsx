import { preload } from 'react-dom';
import { HomeNav } from '@/components/HomeNav';

export default function Home() {
  // Start downloading the statue with the page itself, rather than once the
  // scripts have loaded and the 3D viewer asks for it: less time on black.
  preload('/models/winged-victory.glb', { as: 'fetch', crossOrigin: 'anonymous' });
  preload('/models/key-light.hdr', { as: 'fetch', crossOrigin: 'anonymous' });

  return (
    <div className="home">
      <div className="mark">
        <h1 className="logo">
          <img src="/images/svg/lindmark-design-logo.svg" alt="Lindmark Design" />
        </h1>
        <HomeNav />
      </div>
    </div>
  );
}
