# Bookly - System Zarządzania Wizytami i Rezerwacjami

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)](https://stripe.com/)

**Bookly** to nowoczesna platforma typu SaaS skierowana do firm usługowych (salony urody, gabinety, studia), umożliwiająca kompleksowe zarządzanie kalendarzem wizyt, pracownikami oraz relacjami z klientami.

> [!NOTE]
> Projekt jest w fazie aktywnego rozwoju. Główne moduły biznesowe oraz silnik kalendarza są w pełni funkcjonalne.

## 🚀 Kluczowe Funkcjonalności

### 📅 Inteligentny Kalendarz (Core)
- **Drag & Drop**: Intuicyjne przenoszenie wizyt między godzinami i pracownikami (biblioteka `dnd-kit`).
- **Dynamiczne skalowanie**: Możliwość zmiany czasu trwania wizyty bezpośrednio w widoku kalendarza.
- **Optimistic UI**: Błyskawiczne aktualizacje interfejsu przed potwierdzeniem przez serwer.
- **Widoki**: Dzień, 3 dni, Tydzień, Miesiąc.
- **Filtrowanie**: Zaawansowane filtry pracowników i usług.

### 💼 Zarządzanie Biznesem i Subskrypcje
- **Dashboard**: Panel analityczny z danymi o rezerwacjach i klientach.
- **System Subskrypcji**: Pełna integracja ze **Stripe** (aktualnie w trybie **Sandbox**) do obsługi płatności cyklicznych.
- **Pracownicy**: Zarządzanie zespołem, ich dostępnością oraz przypisywanie do konkretnych usług.
- **Klienci**: Baza danych klientów z historią wizyt.

### 🛠️ Panel Administracyjny (Admin/Support/Developer)
Dedykowany dashboard `/admin` dla obsługi platformy:
- **Zarządzanie systemem**: Kontrola nad biznesami, użytkownikami i rolami.
- **Wsparcie (Support)**: System czatu na żywo, zgłoszenia problemów oraz odwołania od banów przy użyciu **Pusher**.
- **Developer Tools**: Monitoring logów systemowych, ustawienia bezpieczeństwa i finansów.

### 🔐 Bezpieczeństwo i Infrastruktura
- **Custom Auth**: System uwierzytelniania oparty na JWT (Jose) z middleware zabezpieczającym trasy.
- **Real-time**: Wsparcie na żywo (Chat), zgłoszenia i aktualizacje w czasie rzeczywistym dzięki **Pusher**.
- **Rate Limiting & Cache**: Ochrona API przed nadużyciami oraz optymalizacja dzięki **Redis**.
- **Media**: Szybkie i bezpieczne przesyłanie oraz przechowywanie zdjęć/plików przy użyciu **Cloudinary**.

## [🔗 LIVE DEMO] https://bookly-app-kacper-k.vercel.app/
- **Test account business**: [testbiz@gmail.com] / Test123# 
- **Test account client**: [test@example.com] / Test123#

## 🛠 Stos Technologiczny

- **Frontend**: React 19, Next.js 15, Tailwind CSS 4, Framer Motion, GSAP (animacje).
- **Backend**: Next.js API Routes, Mongoose (MongoDB).
- **Cache/Storage**: Redis (Upstash), Cloudinary (zdjęcia).
- **Komunikacja**: Pusher (WebSockets), Nodemailer/Resend (E-mail).
- **Płatności**: Stripe API.
- **Testy**: Vitest, React Testing Library.

## ⚙️ Instalacja i Uruchomienie

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/twoja-nazwa/bookly.git
   ```
2. Zainstaluj zależności:
   ```bash
   npm install
   ```
3. Skonfiguruj plik `.env.local` (skorzystaj z `.env.example` jeśli jest dostępny).
4. Uruchom serwer deweloperski:
   ```bash
   npm run dev
   ```

## 📈 Plany Rozwoju (Roadmap)
- [ ] Implementacja pełnego modułu analitycznego (wykresy finansowe).
- [ ] Rozszerzenie systemu powiadomień SMS.
- [ ] Aplikacja mobilna dla klientów końcowych.
- [ ] Pełne pokrycie testami E2E (Playwright).

---
Autor: [Kacper](https://github.com/ashanV)