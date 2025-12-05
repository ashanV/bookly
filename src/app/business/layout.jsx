"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import BusinessLayout from '@/components/business/BusinessLayout';

export default function Layout({ children }) {
    const pathname = usePathname();

    // Pages that should NOT have the business dashboard layout
    const isLandingPage = pathname === '/business';
    const isAuthPage = pathname.startsWith('/business/auth');

    if (isLandingPage || isAuthPage) {
        return <>{children}</>;
    }

    return (
        <BusinessLayout>
            {children}
        </BusinessLayout>
    );
}
