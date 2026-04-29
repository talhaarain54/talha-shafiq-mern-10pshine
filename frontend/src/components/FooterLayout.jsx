import { Outlet } from 'react-router';
import Footer from './Footer';

export default function FooterLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}