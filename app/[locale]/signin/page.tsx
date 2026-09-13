import { pageMetadata } from "../../../services/page-meta";
import { SignInForm } from "../../../components/auth/SignInForm";

type PageProps = { params: Promise<{ locale: string }> };

const META = {
  title: "Sign in",
  description: "Sign in to your ChordPic account.",
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;

  return pageMetadata(locale, "/signin", META);
}

export default function SignInPage() {
  return <SignInForm />;
}
