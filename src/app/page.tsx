'use client';
import { useAppStore } from '@/lib/store';
import { Hero } from '@/components/Hero';
import { AppShell } from '@/components/AppShell';

export default function Home() {
  const { data } = useAppStore();

  return (
    <div className="h-screen flex flex-col bg-black">
      {data.length === 0 ? <Hero /> : <AppShell />}
    </div>
  );
}
