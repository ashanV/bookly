import { useEffect, useState, useCallback, useRef } from 'react';
import Pusher from 'pusher-js';

// Singleton instance outside the hook to prevent multiple connections
let pusherInstance = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const pusherRef = useRef(null);

  useEffect(() => {
    // Use singleton instance
    if (!pusherInstance) {
      pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      });
    }

    pusherRef.current = pusherInstance;

    // Update initial state
    if (pusherInstance.connection.state === 'connected') {
      setIsConnected(true);
    }

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    pusherInstance.connection.bind('connected', handleConnected);
    pusherInstance.connection.bind('disconnected', handleDisconnected);

    // No strict disconnect on unmount to keep connection alive across navigations
    // or implement a ref counting mechanism if needed. 
    // For now, keeping it alive is better for SPA.

    return () => {
      pusherInstance.connection.unbind('connected', handleConnected);
      pusherInstance.connection.unbind('disconnected', handleDisconnected);
    };
  }, []);

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
    disconnect: () => {
      // Optional: explicit disconnect if really needed
      // pusherRef.current?.disconnect(); 
    }
  };

  return { socket, isConnected };
}

