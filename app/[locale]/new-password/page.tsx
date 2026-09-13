import { pageMetadata } from "../../../services/page-meta";
import { NewPasswordForm } from "../../../components/auth/NewPasswordForm";

type PageProps = { params: Promise<{ locale: string }> };

const META = {
  title: "Set new password",
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;

  return pageMetadata(locale, "/new-password", META);
}

export default function NewPasswordPage() {
  return <NewPasswordForm />;
}
