import Link from "next/link";


export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-neutral-800 dark:to-neutral-700 text-neutral-900 dark:text-neutral-200 py-10 px-6 mt-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Logo + Mission */}
        <div>
          <h3 className="text-2xl font-bold mb-2">Anugraha Christian World</h3>
          <p className="text-sm leading-relaxed">
            Serving the Christian community with devotional articles and gifts.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-1 text-sm">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li><Link href="/about" className="hover:underline">About Us</Link></li>
            <li><Link href="/products" className="hover:underline">Products</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-2">Other Links</h4>
          <ul className="space-y-1 text-sm">
            <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
            <li><Link href="/terms" className="hover:underline">Terms of Services</Link></li>
            <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
          </ul>
        </div>


        {/* Contact */}
        <div>
          <h4 className="text-lg font-semibold mb-2">Contact</h4>
          <ul className="space-y-1 text-sm">
            <li>📍12-7-295,shop No: 1, Beside St. Antonys Shrine, Mettuguda, Secundrabad, Hyderabad, Telangana, India</li>
            <li>Pin code: 500017</li>
            <li>Opens: Monday - Saturday, 9:30 AM to 8:00 PM</li>
          
            <li>Call And WhatsApp</li>
<li>
  {/* Content for the outer list item */}
  <div className="flex flex-col">
    <div>
      📞{" "}
      <a href="tel:+91-9912888606" className="hover:underline">9912888606</a>
    </div>
    <div>
      📞{" "}
      <a href="tel:+91-9848587301" className="hover:underline">9848587301</a>
    </div>
  </div>
</li>
            
            <li>
              📧{" "}
              <a href="mailto:anugrahachristianworld@email.com" className="hover:underline">
                anugrahachristianworld@gmail.com
              </a>
            </li>
          </ul>
        </div>


      </div>

      <div className=" border-t border-neutral-300 dark:border-neutral-600 mt-8 pt-4 text-center text-sm">
            &copy; {new Date().getFullYear()} Anugraha Christian World. All rights reserved.
      </div>
      <div className="text-center">
        Developed by <a href="https://josephkakkassery.netlify.app/">Joseph Kakkassery</a>
      </div>

    </footer>
  );
}
