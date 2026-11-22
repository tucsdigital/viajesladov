'use client';

import ProtectedRoute from '@/components/admin/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, FolderKanban, MessageSquare, Mail, Newspaper, Flag, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    categorias: 0,
    paquetes: 0,
    paquetesF1: 0,
    blog: 0,
    consultas: 0,
    newsletter: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [categoriasSnap, paquetesSnap, paquetesF1Snap, blogSnap, consultasSnap, newsletterSnap] = await Promise.all([
          getDocs(collection(db, 'categorias')),
          getDocs(collection(db, 'paquetes')),
          getDocs(collection(db, 'paquetes_f1')),
          getDocs(collection(db, 'blog')),
          getDocs(query(collection(db, 'consultas'), where('leida', '==', false))),
          getDocs(collection(db, 'newsletter')),
        ]);

        setStats({
          categorias: categoriasSnap.size,
          paquetes: paquetesSnap.size,
          paquetesF1: paquetesF1Snap.size,
          blog: blogSnap.size,
          consultas: consultasSnap.size,
          newsletter: newsletterSnap.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-600 mt-1">Bienvenido al panel de administración de Lado V</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[
              {
                label: 'Categorías',
                value: stats.categorias,
                icon: FolderKanban,
                accent: 'from-emerald-500/20 to-transparent',
                iconClass: 'bg-emerald-100 text-emerald-700',
              },
              {
                label: 'Paquetes',
                value: stats.paquetes,
                icon: Package,
                accent: 'from-sky-500/20 to-transparent',
                iconClass: 'bg-sky-100 text-sky-700',
              },
              {
                label: 'Paquetes F1',
                value: stats.paquetesF1,
                icon: Flag,
                accent: 'from-amber-500/20 to-transparent',
                iconClass: 'bg-amber-100 text-amber-700',
              },
              {
                label: 'Blog',
                value: stats.blog,
                icon: Newspaper,
                accent: 'from-violet-500/20 to-transparent',
                iconClass: 'bg-violet-100 text-violet-700',
              },
              {
                label: 'Consultas sin leer',
                value: stats.consultas,
                icon: MessageSquare,
                accent: 'from-rose-500/20 to-transparent',
                iconClass: 'bg-rose-100 text-rose-700',
              },
              {
                label: 'Newsletter',
                value: stats.newsletter,
                icon: Mail,
                accent: 'from-slate-500/20 to-transparent',
                iconClass: 'bg-slate-100 text-slate-700',
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.label}
                  className="group relative overflow-hidden border border-gray-200/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${card.accent}`} />
                  <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-semibold text-gray-700">
                      {card.label}
                    </CardTitle>
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${card.iconClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                    <p className="text-sm text-gray-500 mt-1">Actualizado al instante</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border border-gray-200/80 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Inicio rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Todo lo que podés hacer desde el panel:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Crear y editar categorías de viajes',
                  'Gestionar paquetes turísticos y F1',
                  'Publicar y ordenar entradas del blog',
                  'Responder consultas de clientes',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50/60 p-3">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

