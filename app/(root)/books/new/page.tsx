import UploadForm from "@/components/web/UploadForm";

const page = () => {
  return (
    <div className="wrapper container">
      <div className="mx-auto mt-10 max-w-180 space-y-10">
        <section className="flex flex-col gap-5">
          <h1 className="page-title-xl">Add a New Book</h1>
          <p className="subtitle">Upload a book and start talking to it.</p>
        </section>
        <UploadForm />
      </div>
    </div>
  );
};

export default page;
