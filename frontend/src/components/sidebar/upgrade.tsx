"use client";

import {Button} from "~/components/ui/button";
import {Crown, Sparkles} from "lucide-react";
import {polarCheckout} from "~/lib/auth-client";
import {toast} from "sonner";

export default function Upgrade() {

  const upgrade = async () => {
    try {
      await polarCheckout([
          "df11209a-4324-4c81-aca9-0f58712041a3",
          "0567ce66-f232-4e8f-a4f6-2d03eed51bd6",
          "72a93e77-7753-438b-9075-0c01b407bd58",
        ]);
    } catch (e) {
      console.error("Checkout failed:", e);
      toast.error("Checkout failed")
    }
  };

  return (
      <Button
        variant="outline"
        size='sm'
        onClick={upgrade}
        className='group relative cursor-pointer ml-2 overflow-hidden border-orange-400/50 bg-gradient-to-r from-orange-400/10 to-pink-500/10 text-orange-400
        transition-all duration-300 hover:border-orange-500/70 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-600 hover:text-white hover:shadow-lg hover:shadow-orange-500/25'
      >
        <div className='flex items-center gap-2'>
          <Crown className='h-4 w-4 transition-transform duration-300 group-hover:rotate-12'/>
          <span className='font-medium'>Upgrade</span>
          <Sparkles className='h-3 w-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100'/>
        </div>

        {/*Subtle glow effect*/}
        <div className='absolute inset-0 rounded-md bg-gradient-to-r from-orange-400/20 to-pink-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100'/>
      </Button>
  );
}