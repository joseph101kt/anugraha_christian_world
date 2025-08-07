import Image from "next/image";

const featuredCategories = [
  {
    name: "Statues",
    image: "/statue.jpg",
    size: "col-span-2 row-span-2",
  },
  {
    name: "Church Articles",
    image: "/church-articles.jpg",
    size: "col-span-2",
  },
  {
    name: "Rosaries",
    image: "/rosaries.jpg",
    size: "",
  },
  {
    name: "Photo Frames",
    image: "/photo-frames.jpg",
    size: "",
  },
];

export default function FeaturedCategory() {
  return (
    <section className="bg-gradient-to-brp-6 p-6">
      <h2 className="text-3xl font-bold text-center mb-10">Featured Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-6">
        {featuredCategories.map((cat, i) => (
          <div
            key={i}
            className={`relative p-4 bg-secondary shadow-lg rounded-lg overflow-hidden hover:scale-[1.02] transition-transform duration-200 ease-in-out ${cat.size}`}
          >
            <div className="absolute inset-0 z-0">
              <Image
                src={cat.image}
                alt={cat.name}
                layout="fill"
                objectFit="cover"
                className="rounded-lg opacity-70"
              />
            </div>
            <div className="relative z-10 flex items-end h-full">
              <h3 className="text-xl font-bold drop-shadow-md">
                {cat.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
