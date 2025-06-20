'use client';
import Link from 'next/link';
import React from 'react';
import FullMenu from './FullMenu';
import MobMenu from './MobMenu';

const Appbar = () => {
  return (
    <header className="relative flex items-center justify-between border-b py-8 md:py-2 px-4 h-[60px] md:h-auto">
      <div className="md:hidden z-50">
        <MobMenu />
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:transform-none md:order-1 text-2xl font-bold cursor-pointer">
        <Link href="/">
          Que<span className="text-[#512da8]">$$</span>
        </Link>
      </div>

      <div className="hidden md:block md:order-2">
        <FullMenu />
      </div>
    </header>
  );
};

export default Appbar;
