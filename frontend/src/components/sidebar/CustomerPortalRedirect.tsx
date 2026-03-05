"use client";

import {Loader2} from "lucide-react";
import {useEffect, useState} from "react";
import {authClient} from "~/lib/auth-client";

export default function CustomerPortalRedirect() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const portal = async () => {
      try {
        await authClient.customer.portal();
      } catch (e) {
        setError("We couldn't open the customer portal. Please try again.")
      }
    };
    void portal();
  }, []);

  if (error) {
    return (
        <div className='flex min-h-[400px] items-center justify-center'>
          <p className='text-sm text-destructive'>{error}</p>
        </div>
    );
  }

  return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='text-primary h-8 w-8 animate-spin mt-60'/>
          <p className='text-muted-foreground text-sm'>
            Loading your customer portal...
          </p>
        </div>
      </div>
  );
}