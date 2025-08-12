// components/HeroSection.tsx
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className="w-full h-[70vh] flex items-center justify-center m-10  text-center px-4">
      <div className="max-w-3xl">
        <div className="h-30"></div>
<div className="flex flex-col gap-0">
  <h1 className="lg:text-9xl md:text-6xl sm:text-2xl font-bold leading-none">
    <strong className="text-white/0">____</strong>ANUGRAHA<strong className="text-white/0">____</strong> CHRISTIAN WORLD
  </h1>
  <h1 className="lg:text-9xl md:text-6xl sm:text-2xl font-bold leading-none">
    
  </h1>
</div>
        <h1 className="lg:text-8xl md:text-6xl sm:text-2xl font-bold mt-5">
          Telangana and Andhra’s Largest Christian Articles Store
        </h1>
        <p className="mt-4 text-lg">
          Sacred articles for spiritual living — handcrafted with faith and love.
        </p>
        <div className="mt-6 space-x-10 md:p-space-x-16 lg:space-x-32 ">

          <Link
            href="/products"
            className="bg-accent hover:bg-primary  py-2 px-6 rounded-full shadow-md transition"
          >
            Explore Catalog
          </Link>
          <a
            href="/contact"
            className="  bg-accent hover:bg-primary  py-2 px-6 rounded-full shadow-md transition"
          >
            Lets Talk
          </a>
        </div>
      </div>
    </section>

  );
}
