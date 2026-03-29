import {Coins, Sparkles} from "lucide-react";
import {getUserCredits} from "~/actions/credits";

export default async function Credits() {
  const result = await getUserCredits();
  const credits = result.success ? result.credits : 0;

  return (
      <div className='group flex items-center gap-2'>
        <div className='flex items-center gap-1.5'>
          <div className='relative'>
            <Coins className='h-4 w-4 text-primary/80 transition-colors duration-200 group-hover:text-primary'/>
            <Sparkles className='absolute -top-1 -right-1 h-2 w-2 text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100'/>
          </div>
          <div className='flex flex-col'>
          <span className='text-sm font-bold text-foreground transition-colors duration-200 group-hover:text-primary'>
            {credits}
          </span>
            <span className='text-xs font-bold text-muted-foreground transition-colors duration-200 group-hover:text-primary'>
            Credits
          </span>
          </div>
        </div>
      </div>
  );
}