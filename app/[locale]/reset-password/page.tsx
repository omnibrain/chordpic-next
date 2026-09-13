import { pageMetadata } from "../../../services/page-meta";
import { ResetPasswordForm } from "../../../components/auth/ResetPasswordForm";

type PageProps = { params: Promise<{ locale: string }> };

const META = {
  title: "Reset password",
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;

  return pageMetadata(locale, "/reset-password", META);
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
