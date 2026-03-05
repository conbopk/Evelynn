import "~/styles/globals.css";
import React from "react";
import {auth} from "~/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {Providers} from "~/components/providers";
import {Toaster} from "~/components/ui/sonner";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import {Breadcrumb, BreadcrumbItem, BreadcrumbList} from "~/components/ui/breadcrumb";
import { AppSidebar } from "~/components/sidebar/app-sidebar";
import BreadcrumbPageClient from "~/components/sidebar/breadcrumb-page-client";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return (
      <Providers>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className='flex h-screen flex-col'>
            <header className='bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border/40 sticky top-0 z-10 border-b px-6 py-3 shadow-sm backdrop-blur'>
              <div className='flex shrink-0 grow items-center gap-3'>
                <SidebarTrigger className='hover:bg-muted -ml-1 h-8 w-8 transition-colors'/>
                <Separator
                    orientation="vertical"
                    className='mr-2 h-6 data-[orientation=vertical]:h-6 bg-primary/50'
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPageClient />
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <main className='from-background to-muted/20 flex-1 overflow-y-auto bg-gradient-to-br p-6'>
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </Providers>
  );

}