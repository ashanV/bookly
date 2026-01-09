'use client';

import React from 'react';
import ChatWidget from './ChatWidget';

/**
 * Provider dla widgetu chatu - dodaj do layoutu głównego aplikacji
 * Widget będzie dostępny na wszystkich stronach
 */
export default function ChatWidgetProvider() {
  return <ChatWidget />;
}

