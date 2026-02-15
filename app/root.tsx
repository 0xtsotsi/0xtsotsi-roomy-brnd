import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import {useEffect, useState} from "react";
import {
    getCurrentUser,
    signIn as puterSignIn,
    signOut as puterSignOut,
} from "../lib/puter.action";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script src="https://js.puter.com/v2/"></script>
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const DEFAULT_AUTH_STATE: AuthState = {
    isSignedIn: false,
    userName: null,
    userId: null,
}

export default function App() {
    const [authState, setAuthState] = useState<AuthState>(DEFAULT_AUTH_STATE);
    const [puterReady, setPuterReady] = useState(false);

    const refreshAuth = async () => {
        try {
            const user = await getCurrentUser();

            setAuthState({
                isSignedIn: !!user,
                userName: user?.username || null,
                userId: user?.id || null,
            });

            return !!user;
        } catch {
            setAuthState(DEFAULT_AUTH_STATE);
            return false;
        }
    }

    useEffect(() => {
        // Wait for Puter.js to load
        const checkPuter = () => {
            if (typeof window !== 'undefined' && window.puter) {
                setPuterReady(true);
                refreshAuth();
            } else {
                setTimeout(checkPuter, 100);
            }
        };
        checkPuter();
    }, []);

    const signIn = async () => {
        await puterSignIn();
        return await refreshAuth();
    }

    const signOut = async () => {
        puterSignOut();
        return await refreshAuth();
    }

    // Show loading while Puter is initializing
    if (!puterReady) {
        return (
            <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Laden...</p>
                </div>
            </main>
        );
    }

  return (
      <main className="min-h-screen bg-background text-foreground relative z-10">
        <Outlet
            context={{ ...authState, refreshAuth, signIn, signOut, puterReady }}
        />;
      </main>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  } else if (error) {
    details = String(error);
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
