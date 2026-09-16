import Link from "@/components/LocalizedLink";

export default function NotFound() {
  return (
    <section>
      <h1 className="font-heading text-3xl font-semibold">Page not found</h1>
      <p className="mt-4">
        <Link href="/" className="underline">
          Create a chord diagram
        </Link>
      </p>
    </section>
  );
}
