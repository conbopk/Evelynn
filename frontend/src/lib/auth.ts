import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {db} from "~/server/db";
import {Polar} from "@polar-sh/sdk";
import {env} from "~/env";
import {checkout, polar, portal, webhooks} from "@polar-sh/better-auth";

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  // Use 'sandbox' if you're using the Polar Sandbox environment
  // Remember that access tokens, products, etc. are completely separated between environments.
  // Access tokens obtained in Production are for instance not usable in the Sandbox environment.
  server: env.NODE_ENV === "production" ? "production" : "sandbox",
});

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
      polar({
        client: polarClient,
        createCustomerOnSignUp: true,
        use: [
            checkout({
              products: [
                {
                  productId: "df11209a-4324-4c81-aca9-0f58712041a3",  // ID of Product from Polar Dashboard
                  slug: "small",  // Custom slug for easy reference in Checkout URL, e.g. /checkout/small
                },
                {
                  productId: "0567ce66-f232-4e8f-a4f6-2d03eed51bd6",
                  slug: "medium",
                },
                {
                  productId: "72a93e77-7753-438b-9075-0c01b407bd58",
                  slug: "large",
                },
              ],
              successUrl: "/dashboard",
              returnUrl: "/dashboard",
              authenticatedUsersOnly: true
            }),
            portal({
              returnUrl: `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/dashboard`
            }),
            webhooks({
              secret: env.POLAR_WEBHOOK_SECRET,
              onOrderPaid: async (order) => {
                const externalCustomerId = order.data.customer.externalId;

                if (!externalCustomerId) {
                  console.error("No external customer ID found.");
                  throw new Error("No external customer id found.");
                }

                const productId = order.data.productId;

                let creditsToAdd = 0;

                switch (productId) {
                  case "df11209a-4324-4c81-aca9-0f58712041a3":
                      creditsToAdd = 50;
                      break;
                  case "0567ce66-f232-4e8f-a4f6-2d03eed51bd6":
                    creditsToAdd = 200;
                    break;
                  case "72a93e77-7753-438b-9075-0c01b407bd58":
                    creditsToAdd = 400;
                    break;
                }

                await db.user.update({
                  where: { id: externalCustomerId },
                  data: {
                    credits: {
                      increment: creditsToAdd,
                    },
                  },
                });
              },
            }),
        ],
      })
    ]
});