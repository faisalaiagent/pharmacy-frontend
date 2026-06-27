// src/components/layout/Footer.tsx
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Rx</span>
              </div>
              <span className="font-bold text-white text-lg">PharmaCare</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your trusted online pharmacy. Licensed pharmacists, genuine medicines,
              and AI-powered health guidance — all in one place.
            </p>
            <div className="flex gap-3">
              {["f", "t", "in", "yt"].map((letter) => (
                <a
                  key={letter}
                  href="#"
                  className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-sky-500 transition-colors text-xs font-bold uppercase"
                >
                  {letter}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/shop", label: "Shop Medicines" },
                { href: "/categories", label: "Categories" },
                { href: "/prescriptions/upload", label: "Upload Prescription" },
                { href: "/ai-assistant", label: "AI Health Assistant" },
                { href: "/blog", label: "Health Blog" },
                { href: "/faq", label: "FAQ" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-sky-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-white mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact Us" },
                { href: "/dashboard/orders", label: "Track Order" },
                { href: "/privacy-policy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms & Conditions" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-sky-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                <span>123 Pharmacy Street, Karachi, Pakistan</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>support@pharmacare.com</span>
              </li>
            </ul>

            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400">
                ⚕️ <strong className="text-white">Medical Disclaimer:</strong> This platform
                does not replace professional medical advice. Always consult a licensed
                doctor before taking any medication.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} PharmaCare. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-gray-300">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-300">Terms</Link>
            <Link href="/faq" className="hover:text-gray-300">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
