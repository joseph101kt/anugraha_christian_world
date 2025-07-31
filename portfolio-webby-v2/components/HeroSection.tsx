import Image from "next/image";

export default function Home() {
  return (
    <section className="w-full h-[60vh] flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white text-center px-4">
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800">
          Anugraha Christian World
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Sacred articles for spiritual living — handcrafted with faith and love.
        </p>
        <div className="mt-6 space-x-10 md:p-space-x-16 lg:space-x-32 ">

          <a
            href="/products"
            className="bg-accent hover:bg-primary text-black font-semibold py-2 px-6 rounded-full shadow-md transition"
          >
            Explore Catalog
          </a>
          <a
            href="/contact"
            className="  bg-accent hover:bg-primary text-black font-semibold py-2 px-6 rounded-full shadow-md transition"
          >
            Lets Talk
          </a>
        </div>
      </div>
    </section>

  );
}
