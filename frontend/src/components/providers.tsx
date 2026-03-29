"use client";

import type {ReactNode} from "react";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {AuthUIProvider} from "@daveyplate/better-auth-ui";
import {authClient} from "~/lib/auth-client";

export function Providers({children}: { children: ReactNode }) {
  const router = useRouter();

  return (
      <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
        <AuthUIProvider
            authClient={authClient}
            navigate={(...args) => router.push(...args)}
            replace={(...args) => router.replace(...args)}
            onSessionChange={async () => {
              // Clear router cache (protected routes)
              router.refresh()

              // Check if user is authenticated and redirect to dashboard
              try {
                const session = await authClient.getSession();
                if (typeof window === "undefined") return;

                const currentPath = window.location.pathname;
                const isOnAuthPage = currentPath.startsWith("/auth/")
                const protectedPrefixes = ["/dashboard", "/account"];
                const isOnProtectedRoute = protectedPrefixes.some((prefix) =>
                    currentPath.startsWith(prefix),
                );

                if (session.data?.user) {
                  // Only redirect if we're on an auth page
                  if (isOnAuthPage) {
                    router.push("/dashboard");
                  }
                } else {
                  // If the user signs out while on a protected route, send them back to auth
                  if (isOnProtectedRoute) {
                    router.replace("/auth/sign-up");
                  }
                }
              } catch (e) {
                // Session check failed, user likely logged out
                console.log("Session check failed:", e);
              }
            }}
            social={{
              providers: ["github", "google"]
            }}
            credentials={false}
            Link={Link}
        >
          {children}
        </AuthUIProvider>
      </ThemeProvider>
  );
}