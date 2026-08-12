import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { ToastProvider, useToast } from "./components/ToastProvider";
import { ApiError } from "./api/client";
import "./index.css";

// A single QueryClient instance for the whole app. The QueryCache-level
// onError hook is how we satisfy the spec's "toast notifications for
// network/API failures" for *reads* -- individual mutations still handle
// their own onError so form-specific messaging/state resets can happen too.
function buildQueryClient(showToast: (msg: string, variant?: "error" | "success" | "info") => void) {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        const message = error instanceof ApiError ? error.message : "Something went wrong loading data.";
        showToast(message, "error");
      },
    }),
    defaultOptions: {
      queries: {
        retry: 1,
        // No optimistic UI per spec -- staleTime keeps things reasonably
        // fresh without refetching on every focus change during data entry.
        staleTime: 30_000,
      },
    },
  });
}

// Thin wrapper so buildQueryClient can call useToast (needs to be inside
// ToastProvider) while still only constructing the QueryClient once.
function QueryProviderWithToasts({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  // useState initializer runs once, so the QueryClient (and its cache) is
  // created a single time per app lifetime rather than being rebuilt --
  // and therefore having its cache wiped -- on every render.
  const [client] = useState(() => buildQueryClient(showToast));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <QueryProviderWithToasts>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryProviderWithToasts>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
