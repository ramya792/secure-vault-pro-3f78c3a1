import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <Sidebar />
      <main className="lg:pl-64 min-h-screen transition-all duration-300">
        <div className="container py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pt-20 lg:pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
