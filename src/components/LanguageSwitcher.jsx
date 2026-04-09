'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(e) {
    const nextLocale = e.target.value;
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <select
      className="bg-transparent text-gray-700 hover:text-blue-600 transition-colors cursor-pointer border-none outline-none font-medium text-sm"
      defaultValue={locale}
      onChange={onSelectChange}
    >
      <option value="pl">PL</option>
      <option value="en">EN</option>
    </select>
  );
}
