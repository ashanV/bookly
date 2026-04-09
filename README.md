# Bookly - Appointment and Reservation Management System

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)](https://stripe.com/)

**Bookly** is a modern SaaS platform aimed at service-based businesses (beauty salons, clinics, studios), offering comprehensive management of appointment calendars, employees, and client relationships.

> [!NOTE]
> The project is currently in the active development phase. Core business modules and the calendar engine are fully functional.

## 🚀 Key Features

### 📅 Smart Calendar (Core)
- **Drag & Drop**: Intuitive appointment moving between time slots and employees (using `dnd-kit` library).
- **Dynamic Scaling**: Ability to change appointment duration directly in the calendar view.
- **Optimistic UI**: Instant interface updates before server confirmation.
- **Views**: Day, 3 Days, Week, Month.
- **Filtering**: Advanced filters for employees and services.

### 💼 Business Management & Subscriptions
- **Dashboard**: Analytical panel with reservation and client data.
- **Subscription System**: Full integration with **Stripe** (currently in **Sandbox** mode) for recurring payments.
- **Employees**: Team management, availability tracking, and assignment to specific services.
- **Clients**: Customer database with appointment history.

### 🛠️ Administration Panel (Admin/Support/Developer)
Dedicated `/admin` dashboard for platform maintenance:
- **System Management**: Control over businesses, users, and roles.
- **Support**: Live chat system, issue reporting, and ban appeals using **Pusher**.
- **Developer Tools**: System log monitoring, security settings, and financial overview.

### 🔐 Security & Infrastructure
- **Custom Auth**: Authentication system based on JWT (Jose) with middleware protecting routes.
- **Real-time**: Live support (Chat), reports, and real-time updates via **Pusher**.
- **Rate Limiting & Cache**: API protection against abuse and optimization using **Redis**.
- **Media**: Fast and secure image/file uploads and storage using **Cloudinary**.

## [🔗 LIVE DEMO] https://bookly-app-kacper-k.vercel.app/
- **Business test account**: [testbiz@gmail.com] / Test123# 
- **Client test account**: [test@example.com] / Test123#

## 🛠 Tech Stack

- **Frontend**: React 19, Next.js 15, Tailwind CSS 4, Framer Motion, GSAP (animations).
- **Backend**: Next.js API Routes, Mongoose (MongoDB).
- **Cache/Storage**: Redis (Upstash), Cloudinary (images).
- **Communication**: Pusher (WebSockets), Nodemailer/Resend (Email).
- **Payments**: Stripe API.
- **Testing**: Vitest, React Testing Library.

## ⚙️ Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ashanV/bookly.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env.local` file (use `.env.example` if available).
4. Run the development server:
   ```bash
   npm run dev
   ```

## 📈 Roadmap
- [ ] Implement full analytics module (financial charts).
- [ ] Expand SMS notification system.
- [ ] Mobile app for end-clients.
- [ ] Full E2E test coverage (Playwright).

---
Author: [Kacper](https://github.com/ashanV)
