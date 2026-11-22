'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  Newspaper,
  ListOrdered,
  FolderKanban, 
  Image as ImageIcon,
  Flag,
  LogOut, 
  Menu, 
  X,
  MessageSquare,
  Mail,
  Loader2,
  Users,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Clientes', href: '/admin/clientes', icon: Users },
  { name: 'Categorías', href: '/admin/categorias', icon: FolderKanban },
  { name: 'Paquetes', href: '/admin/paquetes', icon: Package },
  { name: 'F1', href: '/admin/paquetes-f1', icon: Flag },
  { name: 'Blog', href: '/admin/blog', icon: Newspaper },
  { name: 'Banners', href: '/admin/banners', icon: ImageIcon },
  { name: 'Consultas', href: '/admin/consultas', icon: MessageSquare },
  { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
  { name: 'Club Lado V', href: '/admin/club', icon: Crown },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    if (loggingOut) return;
    
    setLoggingOut(true);
    try {
      await logout();
      router.replace('/admin/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className={cn('min-h-screen bg-gray-100')}>
      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out z-50',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b">
            <Link href="/admin" className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <Image
                  src="/ladov_secundary.png"
                  alt="Lado V Isotipo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-heading font-bold text-base">Admin</span>
            </Link>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            {user && (
              <div className="mb-3 px-3 py-2 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Conectado como:</p>
                <p className="text-base font-medium text-gray-900 truncate">
                  {user.email}
                </p>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full justify-start disabled:opacity-50"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Cerrando...
                </>
              ) : (
                <>
                  <LogOut className="mr-3 h-5 w-5" />
                  Cerrar sesión
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/" target="_blank">
                Ver sitio
              </Link>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
