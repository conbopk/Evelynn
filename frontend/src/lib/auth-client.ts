import { createAuthClient } from "better-auth/react";
import { env } from "~/env";
import { polarClient } from "@polar-sh/better-auth";

const baseClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [polarClient()],
});

export const authClient = baseClient;

export async function polarCheckout(products: string[]): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  await (baseClient as any).checkout({ products });
}

export async function polarCustomerPortal(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  await (baseClient as any).customer.portal();
}