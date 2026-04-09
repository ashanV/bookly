"use client";

import { Suspense } from "react";
import BooklyAuth from "@/components/AuthBusiness";

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-4">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600">Ładowanie...</p>
      </div>
    </div>
  );
}

function AuthPageContent() {
  return <BooklyAuth />;
}

export default function AuthPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthPageContent />
    </Suspense>
  );
}