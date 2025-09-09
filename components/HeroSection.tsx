import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className="w-full min-h-[70vh] bg-sky-900 grid grid-cols-1 md:grid-cols-2 items-center justify-center text-center px-4 py-8">
      {/* Image column */}
      <div className="relative w-full h-[50vh] md:h-full">
        <Image
          src="/jesus.webp"
          alt="Jesus"
          fill
          priority
          className="object-contain animate-slideUpAndFade"
        />
      </div>

      {/* Text content column */}
      <div className="max-w-3xl bg-secondary rounded-4xl flex flex-col items-center justify-center p-4">
        <div className="flex flex-col gap-0">
          {/* Use a smaller base font size (e.g., text-lg or text-xl) for the heading */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold leading-tight">
            ANUGRAHA CHRISTIAN WORLD
          </h1>
        </div>
        {/* Use an even smaller base font size (e.g., text-xs or text-sm) for the subheading */}
        <h1 className="text-xs sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">
          Telangana and Andhra’s Largest Christian Articles Store
        </h1>
        <p className="mt-2 text-xs sm:text-base lg:text-lg">
          Sacred articles for spiritual living — handcrafted with faith and love.
        </p>
        <div className="flex mt-4 mb-4 space-x-2 sm:space-x-4 md:space-x-8 lg:space-x-12">
          <Link
            href="/products"
            className="bg-accent hover:bg-primary py-2 px-4 rounded-full shadow-md transition text-xs sm:text-base"
          >
            Explore Catalog
          </Link>
          <Link
            href="/contact"
            className="bg-accent hover:bg-primary py-2 px-4 rounded-full shadow-md transition text-xs sm:text-base"
          >
            Lets Talk
          </Link>
        </div>
      </div>
    </section>
  );
}