import { useEffect, useState, useCallback, useRef } from 'react';
import Pusher from 'pusher-js';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const pusherRef = useRef(null);

  useEffect(() => {
    // Inicjalizacja Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    pusher.connection.bind('connected', () => {
      setIsConnected(true);
    });

    pusher.connection.bind('disconnected', () => {
      setIsConnected(false);
    });

    pusherRef.current = pusher;

    return () => {
      pusher.disconnect();
    };
  }, []);

  // Emisja zdarzenia (przez API, bo client SDK Pushera nie służy do bezpośredniego wysyłania)
  const emit = useCallback(async (event, data) => {
    try {
      const response = await fetch('/api/chat/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ event, data })
      });
      return response.ok;
    } catch (error) {
      console.error('Błąd wysyłania eventu:', error);
      return false;
    }
  }, []);

  // Subskrypcja kanału
  const subscribe = useCallback((channelName) => {
    if (!pusherRef.current) return null;
    return pusherRef.current.subscribe(channelName);
  }, []);

  const unsubscribe = useCallback((channelName) => {
    if (pusherRef.current) {
      pusherRef.current.unsubscribe(channelName);
    }
  }, []);

  const socket = {
    emit,
    subscribe,
    unsubscribe,
    disconnect: () => pusherRef.current?.disconnect()
  };

  return { socket, isConnected };
}

