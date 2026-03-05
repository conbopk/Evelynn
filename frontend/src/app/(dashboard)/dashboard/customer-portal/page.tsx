import {auth} from "~/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import CustomerPortalRedirect from "~/components/sidebar/CustomerPortalRedirect";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  return <CustomerPortalRedirect />
}