"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import BusinessLayout from '@/components/business/BusinessLayout';

export default function Layout({ children }) {
    const pathname = usePathname();

    // Exclude Service Add (/new) and Edit (/[id]) pages
    // List page is /business/dashboard/services, forms are deeper
    const isServiceFormPage = pathname.startsWith('/business/dashboard/services/') && pathname !== '/business/dashboard/services';
    const isCrmAddPage = pathname.startsWith('/business/dashboard/clients/add');

    if (isServiceFormPage || isCrmAddPage) {
        return <>{children}</>;
    }

    return (
        <BusinessLayout>
            {children}
        </BusinessLayout>
    );
}
