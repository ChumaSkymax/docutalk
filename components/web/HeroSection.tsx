import { Brain, Ear, Mic, Search, Speaker, Upload } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="flex flex-col items-center max-w-6xl mx-auto mb-10 md:mb-16">
      <div className="flex justify-center items-center mt-32 mx-auto lg:mx-0">
        <div className="flex flex-wrap items-center justify-center gap-2 pl-2.5 pr-4 py-1.5 rounded-full bg-secondary border border-border">
          <div className="relative flex size-3.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand)] opacity-75 animate-ping duration-300"></span>
            <span className="relative inline-flex size-2 rounded-full bg-[var(--color-brand)]"></span>
          </div>
          <p className="text-sm text-foreground">Over 12000+ users</p>
        </div>
      </div>
      <h1 className="text-[42px]/13 md:text-6xl/19 font-serif font-semibold text-center max-w-[940px] mt-4 bg-gradient-to-r from-[var(--color-brand)] to-foreground text-transparent bg-clip-text">
        Talk to Any Book — Literally.
      </h1>
      <p className="text-muted-foreground text-sm max-md:px-2 text-center max-w-sm mt-3">
        <span className="text-foreground font-medium">DocuTalk</span> transforms
        the way you read and learn. Instead of passively flipping through pages,
        you can now have real conversations with your books. Whether you're
        studying, researching, or just curious,{" "}
        <span className="text-foreground font-medium">DocuTalk</span> turns any
        document into a smart, interactive experience.
      </p>
      <div className="mt-8 flex items-center text-sm bg-card h-13 border border-border pl-3 pr-0.5 rounded-full w-full max-w-sm shadow-[var(--shadow-soft)]">
        <Search className="text-muted-foreground shrink-0 size-4" />
        <input
          className="px-2 w-full h-full outline-none placeholder:text-muted-foreground text-foreground bg-transparent rounded-lg"
          type="text"
          placeholder="Search for a book"
        />
        <button
          type="submit"
          className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white px-10 h-11 font-medium text-sm rounded-full transition-colors"
        >
          Search
        </button>
      </div>

      <h1 className="library-hero-title">How It Works</h1>
      <div className="relative max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-8 md:px-0 mt-14">
        <div className="bg-secondary hover:-translate-y-1 transition duration-300 border border-border rounded-[var(--radius)] p-6 space-y-4 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-soft-md)]">
          <div className="flex items-start justify-between">
            <Upload className="size-8 text-[var(--color-brand)]" />
          </div>
          <p className="text-sm font-serif font-semibold text-foreground">
            Upload Your Book
          </p>
          <p className="text-xs text-muted-foreground">
            Upload any PDF — a textbook, guide, or document.
          </p>
        </div>
        <div className="bg-secondary hover:-translate-y-1 transition duration-300 border border-border rounded-[var(--radius)] p-6 space-y-4 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-soft-md)]">
          <Brain className="size-8 text-[var(--color-brand)]" />
          <p className="text-sm font-serif font-semibold text-foreground">
            AI Understands It
          </p>
          <p className="text-xs text-muted-foreground">
            Our AI analyzes your content and builds a smart knowledge base.
          </p>
        </div>
        <div className="bg-secondary hover:-translate-y-1 transition duration-300 border border-border rounded-[var(--radius)] p-6 space-y-4 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-soft-md)]">
          <Mic className="size-8 text-[var(--color-brand)]" />
          <p className="text-sm font-serif font-semibold text-foreground">
            Start Talking
          </p>
          <p className="text-xs text-muted-foreground">
            Tap the microphone and ask anything.
          </p>
        </div>
        <div className="bg-secondary hover:-translate-y-1 transition duration-300 border border-border rounded-[var(--radius)] p-6 space-y-4 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-soft-md)]">
          <Ear className="size-8 text-[var(--color-brand)]" />
          <p className="text-sm font-serif font-semibold text-foreground">
            Get Smart Answers
          </p>
          <p className="text-xs text-muted-foreground">
            The AI responds in a natural voice, explaining concepts clearly like
            a real tutor.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
