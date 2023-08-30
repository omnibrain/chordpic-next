import { headers } from "next/headers";

export default function Index() {
  const lang = headers().get("Content-Language");

  return <div>This page is in: {lang}</div>;
}
