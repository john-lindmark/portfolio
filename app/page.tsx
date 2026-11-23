import { HomeNav } from '@/components/HomeNav';

export default function Home() {
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
