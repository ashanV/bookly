
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { pusherServer } = await import('@/lib/pusher');

        // Store original console methods
        const originalConsoleError = console.error;
        // const originalConsoleLog = console.log; // Uncomment if we want to stream logs too

        // Flag to prevent infinite loops if Pusher itself logs an error
        let isSending = false;

        console.error = function (...args) {
            // 1. Always write to the actual terminal/stdout
            originalConsoleError.apply(console, args);

            // 2. Broadcast to Admin Panel via Pusher
            if (!isSending) {
                isSending = true;
                try {
                    // Process args to be JSON safe and readable
                    const processedArgs = args.map(arg => {
                        if (arg instanceof Error) {
                            return {
                                message: arg.message,
                                stack: arg.stack,
                                name: arg.name
                            };
                        }
                        if (typeof arg === 'object') {
                            try {
                                return JSON.stringify(arg);
                            } catch (e) {
                                return '[Circular/Unserializable Object]';
                            }
                        }
                        return String(arg);
                    });

                    pusherServer.trigger('admin-logs', 'log-error', {
                        timestamp: new Date().toISOString(),
                        level: 'error',
                        messages: processedArgs
                    }).catch(err => {
                        // Silently fail if Pusher logic fails to avoid recursive error loop
                        // originalConsoleError.call(console, "Failed to push log:", err); 
                    });

                } catch (e) {
                    // Ignore internal errors in the logging proxy
                } finally {
                    isSending = false;
                }
            }
        };

        console.log('✅ Server-side console.error proxy enabled');
    }
}
