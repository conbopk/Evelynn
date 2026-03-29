"use server";

import Link from "next/link";
import Image from "next/image";
import {Settings, User} from "lucide-react";
import {UserButton} from "@daveyplate/better-auth-ui";
import {
  Sidebar,
  SidebarContent, SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu
} from "~/components/ui/sidebar";
import MobileSidebarClose from "~/components/sidebar/mobile-sidebar-close";
import SidebarMenuItems from "~/components/sidebar/sidebar-menu-items";
import Credits from "~/components/sidebar/credits";
import Upgrade from "~/components/sidebar/upgrade";

export async function AppSidebar() {
  return (
      <Sidebar className='border-r-0 bg-sidebar'>
        <SidebarContent className='px-3'>
          <MobileSidebarClose />
          <SidebarGroup>
            <SidebarGroupLabel className='mt-6 mb-8 flex flex-col items-start justify-start px-2'>
              <Link href="/" className='mb-1 flex cursor-pointer items-center gap-2.5'>
                <Image
                    src="/evelynn-favicons/favicon-ai_eye-32x32.png"
                    alt="Evelynn logo"
                    width={28}
                    height={28}
                    className='rounded-lg'
                    style={{ filter: "drop-shadow(0 0 6px oklch(0.52 0.28 338 / 70%))" }}
                />
                <p className='bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl font-bold tracking-tight text-transparent'>
                  Evelynn
                </p>
              </Link>
              <p className='ml-9 text-sm font-medium tracking-wide text-muted-foreground'>
                AI Image Generator
              </p>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className='space-y-1'>
                <SidebarMenuItems />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className='border-t border-sidebar-border bg-sidebar/80 p-3'>
          <div className='mb-3 flex w-full items-center justify-center gap-2 text-xs'>
            <Credits />
            <Upgrade />
          </div>
          <UserButton
              variant="outline"
              size='default'
              className='w-full cursor-pointer border-border/40 transition-colors hover:border-primary/50'
              disableDefaultLinks={true}
              additionalLinks={[
                {
                  label: "Customer Portal",
                  href: "/dashboard/customer-portal",
                  icon: <User className='h-4 w-4'/>,
                },
                {
                  label: "Settings",
                  href: "/dashboard/settings",
                  icon: <Settings className='h-4 w-4'/>,
                },
              ]}
          />
        </SidebarFooter>
      </Sidebar>
  );
}