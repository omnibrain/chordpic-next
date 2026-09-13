import { pageMetadata } from "../../../services/page-meta";
import { SignUpForm } from "../../../components/auth/SignUpForm";

type PageProps = { params: Promise<{ locale: string }> };

const META = {
  title: "Sign up",
  description:
    "Sign up for ChordPic to create beautiful guitar chord charts.",
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;

  return pageMetadata(locale, "/signup", META);
}

export default function SignUpPage() {
  return <SignUpForm />;
}
