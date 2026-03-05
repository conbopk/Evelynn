"use client";

import {RedirectToSignIn} from "@daveyplate/better-auth-ui";

export default function DashboardPage() {
  return (
      <>
        <RedirectToSignIn />
        Dashboard
      </>
  )
}