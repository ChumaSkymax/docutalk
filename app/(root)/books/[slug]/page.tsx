import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { getBookBySlug } from "@/lib/actions/book.actions";
import VapiControls from "@/components/web/VapiControls";

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

const BookPage = async ({ params }: BookPageProps) => {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) redirectToSignIn();

  const { slug } = await params;
  const result = await getBookBySlug(slug);
  if (!result.success) redirect("/");

  return (
    <div className="book-page-container">
      <Link href="/" aria-label="Back to library" className="back-btn-floating">
        <ArrowLeft className="size-5 text-[var(--text-primary)]" />
      </Link>

      <div className="mx-auto w-full max-w-4xl">
        <VapiControls book={result.data} />
      </div>
    </div>
  );
};

export default BookPage;
