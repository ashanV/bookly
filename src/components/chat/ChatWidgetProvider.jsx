'use client';

import React from 'react';
import ChatWidget from './ChatWidget';

/**
 * Provider for chat widget - add to main app layout
 * Widget will be available on all pages
 */
export default function ChatWidgetProvider() {
  return <ChatWidget />;
}

