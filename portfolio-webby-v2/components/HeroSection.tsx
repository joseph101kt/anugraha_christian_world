import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    // The section now uses a grid layout, with a single column on small screens and two on medium screens and up.
    <section className="w-full min-h-[70vh] grid grid-cols-1 md:grid-cols-2 items-center justify-center text-center px-4 py-8">
      {/* Image column */}
      <div className="relative w-full h-[50vh] md:h-full">
        <Image
          src="/images/jesus.webp"
          alt="Jesus"
          fill
          priority
          className="object-contain opacity-80 animate-slideUpAndFade"
        />
      </div>

      {/* Text content column */}
      <div className="max-w-3xl bg-secondary rounded-4xl flex flex-col items-center justify-center p-4">
        <div className="flex flex-col gap-0">
          <h1 className="lg:text-9xl md:text-6xl sm:text-2xl text-xl font-bold leading-none ">
            ANUGRAHA CHRISTIAN WORLD
          </h1>
        </div>
        <h1 className="lg:text-8xl md:text-6xl sm:text-sm text-md font-bold ">
          Telangana and Andhra’s Largest Christian Articles Store
        </h1>
        <p className="mt-2 text-lg ">
          Sacred articles for spiritual living — handcrafted with faith and love.
        </p>
        <div className="mt-4 mb-4 space-x-10 md:p-space-x-16 lg:space-x-32 ">
          <Link
            href="/products"
            className="bg-accent hover:bg-primary py-2 px-6 rounded-full shadow-md transition "
          >
            Explore Catalog
          </Link>
          <Link
            href="/contact"
            className="bg-accent hover:bg-primary py-2 px-6 rounded-full shadow-md transition "
          >
            Lets Talk
          </Link>
        </div>
      </div>
    </section>
  );
}
