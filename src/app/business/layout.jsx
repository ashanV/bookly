"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import BusinessLayout from '@/components/business/BusinessLayout';

export default function Layout({ children }) {
    const pathname = usePathname();

    // Pages that should NOT have the business dashboard layout
    const isLandingPage = pathname === '/business';
    const isAuthPage = pathname.startsWith('/business/auth');
    // Exclude Service Add (/new) and Edit (/[id]) pages
    // List page is /business/dashboard/services, forms are deeper
    const isServiceFormPage = pathname.startsWith('/business/dashboard/services/') && pathname !== '/business/dashboard/services';

    if (isLandingPage || isAuthPage || isServiceFormPage) {
        return <>{children}</>;
    }

    return (
        <BusinessLayout>
            {children}
        </BusinessLayout>
    );
}
