import { Inter } from "next/font/google";
import "../../styles/globals.css";
import ToastWrapper from "@/components/ToastWrapper";
import AdminShortcutListener from "@/components/admin/AdminShortcutListener";
import ChatWidgetProvider from "@/components/chat/ChatWidgetProvider";
import GlobalAnnouncement from "@/components/GlobalAnnouncement";
import Providers from "@/components/Providers";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Bookly - Zarezerwuj Usługi Online",
  description: "Znajdź i zarezerwuj najlepszych specjalistów w swojej okolicy. Szybka i prosta rezerwacja wizyt online 24/7.",
  keywords: "rezerwacja, usługi, fryzjer, kosmetyczka, masaż, barber, manicure",
};

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 uppercase-banners`}>
        <NextIntlClientProvider messages={messages}>
          <GlobalAnnouncement />
          <Providers>
            {children}
          </Providers>
          <ToastWrapper />
          <AdminShortcutListener />
          <ChatWidgetProvider />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
