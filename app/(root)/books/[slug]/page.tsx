import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Mic, MicOff } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { getBookBySlug } from "@/lib/actions/book.actions";

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

const BookPage = async ({ params }: BookPageProps) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { slug } = await params;
  const result = await getBookBySlug(slug);
  if (!result.success) redirect("/");

  const { title, author, coverURL, persona } = result.data;

  return (
    <div className="book-page-container">
      <Link href="/" aria-label="Back to library" className="back-btn-floating">
        <ArrowLeft className="size-5 text-[var(--text-primary)]" />
      </Link>

      <div className="mx-auto w-full max-w-4xl space-y-6">
        <section className="vapi-header-card">
          <div className="vapi-cover-wrapper">
            <Image
              src={coverURL}
              alt={title}
              width={120}
              height={180}
              className="w-[120px] h-auto rounded-lg object-cover shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
            />
            <div className="vapi-mic-wrapper">
              <button
                type="button"
                aria-label="Start voice session"
                className="vapi-mic-btn vapi-mic-btn-inactive"
              >
                <MicOff className="size-5 text-[#212a3b]" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:'IBM_Plex_Serif',serif] text-[#212a3b]">
                {title}
              </h1>
              <p className="text-sm sm:text-base text-[#212a3b]/70 mt-1">
                by {author}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="vapi-status-indicator">
                <span className="vapi-status-dot vapi-status-dot-ready" />
                <span className="vapi-status-text">Ready</span>
              </div>
              <div className="vapi-status-indicator">
                <span className="vapi-status-text">
                  Voice: {persona ?? "Default"}
                </span>
              </div>
              <div className="vapi-status-indicator">
                <span className="vapi-status-text">0:00/15:00</span>
              </div>
            </div>
          </div>
        </section>

        <section className="transcript-container min-h-[400px]">
          <div className="transcript-empty">
            <Mic className="size-12 text-[var(--text-muted)] mb-3" />
            <p className="transcript-empty-text">No conversation yet</p>
            <p className="transcript-empty-hint">
              Click the mic button above to start talking
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BookPage;
