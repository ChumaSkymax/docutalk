import BookCard from "@/components/web/BookCard";
import HeroSection from "@/components/web/HeroSection";
import { getAllBooks } from "@/lib/actions/book.actions";

const HomePage = async () => {
  const bookResults = await getAllBooks();
  const books = bookResults.success ? (bookResults.books ?? []) : [];
  console.log(books);
  return (
    <main className="wrapper container">
      <HeroSection />

      <div className="library-books-grid">
        {books.map((book) => (
          <BookCard
            key={book._id}
            title={book.title}
            author={book.author}
            coverURL={book.coverURL}
            slug={book.slug}
          />
        ))}
      </div>
    </main>
  );
};

export default HomePage;
