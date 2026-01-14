import { Inter } from "next/font/google";
import "../styles/globals.css";
import ToastWrapper from "@/components/ToastWrapper";
import AdminShortcutListener from "@/components/admin/AdminShortcutListener";
import ChatWidgetProvider from "@/components/chat/ChatWidgetProvider";
import GlobalAnnouncement from "@/components/GlobalAnnouncement";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Bookly - Zarezerwuj Usługi Online",
  description: "Znajdź i zarezerwuj najlepszych specjalistów w swojej okolicy. Szybka i prosta rezerwacja wizyt online 24/7.",
  keywords: "rezerwacja, usługi, fryzjer, kosmetyczka, masaż, barber, manicure",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 uppercase-banners`}>
        <GlobalAnnouncement />
        {children}
        <ToastWrapper />
        <AdminShortcutListener />
        <ChatWidgetProvider />
      </body>
    </html>
  );
}

