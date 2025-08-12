// components/AboutSection.tsx
import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="w-full mt-5 px-6 py-12 flex flex-col lg:flex-row  justify-between ">
        <div className="max-w-3xl  text-center lg:text-left">
        <h2 className="text-4xl font-extrabold mb-6 tracking-tight">
            About <span className="text-primary">Anugraha</span>
        </h2>
        <div className="space-y-6 text-xl leading-relaxed">
            <p>
            <strong className="font-bold">Our Mission:</strong> To bring sacredness into every Christian home by offering devotional items that nurture faith, uplift the spirit, and support daily worship.
            </p>
            <p>
            <strong className="font-bold">Our Vision:</strong> To be India’s most trusted Christian resource — where timeless tradition, thoughtful craftsmanship, and spiritual devotion come together in every product.
            </p>
            <p>
            At Anugraha, we believe that every symbol of faith has the power to inspire, protect, and bless. Our handpicked collection reflects the beauty of Christian heritage and serves as a bridge between the divine and the everyday.
            </p>
        </div>
        </div>



      <div className=" p-2 rounded-xl shadow-lg">
        <Image
          src="/images/biju.jpg"
          alt="Founder standing"
          width={400}
          height={600}
          className="object-cover rounded-lg"
        />
      </div>
    </section>
  );
}
