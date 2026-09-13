import { redirect } from "next/navigation";
import { AccountView } from "../../../components/auth/AccountView";
import { pageMetadata } from "../../../services/page-meta";
import { getUser } from "../../../utils/supabase/server";

type PageProps = { params: Promise<{ locale: string }> };

const META = {
  title: "Account",
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;

  return pageMetadata(locale, "/account", META);
}

export default async function AccountPage() {
  // What `withAuthRequired({ redirectTo: "/signin" })` did in getServerSideProps.
  const user = await getUser();

  if (!user) {
    redirect("/signin");
  }

  return <AccountView email={user.email} />;
}
