// src/app/about/page.tsx
import { Shield, Award, Users, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-sky-600 to-teal-500 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">About PharmaCare</h1>
          <p className="text-sky-100 text-lg max-w-2xl mx-auto">
            Your trusted online pharmacy, committed to making healthcare
            accessible, affordable, and safe for everyone.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              PharmaCare was founded with a simple mission: to make genuine,
              quality medicines accessible to everyone. We believe healthcare
              should not be complicated or expensive. Our platform connects
              patients with licensed pharmacists and genuine medicines, powered
              by AI technology to provide instant health guidance.
            </p>
          </div>
          <div className="bg-white rounded-2xl border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              We envision a world where every person has access to safe,
              affordable medicines and expert pharmaceutical care — regardless
              of where they live. Through technology and compassion, we are
              building the pharmacy of the future, available 24/7 at your
              fingertips.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Shield, title: "100% Genuine", desc: "All medicines sourced from verified manufacturers and distributors", color: "bg-sky-50 text-sky-600" },
            { icon: Award, title: "Licensed Pharmacists", desc: "Every prescription reviewed by a certified, licensed pharmacist", color: "bg-teal-50 text-teal-600" },
            { icon: Users, title: "10,000+ Customers", desc: "Trusted by thousands of families across the country", color: "bg-green-50 text-green-600" },
            { icon: Heart, title: "Patient First", desc: "Your health and safety is our highest priority, always", color: "bg-pink-50 text-pink-600" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-2xl border p-6 text-center">
              <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Medical Disclaimer</h2>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
            ⚕️ PharmaCare is an online pharmacy platform. We do not provide medical
            diagnoses or replace professional medical advice. Always consult a
            qualified doctor or licensed pharmacist before starting, stopping, or
            changing any medication. Prescription medicines require a valid
            prescription from a licensed medical professional.
          </p>
        </div>
      </div>
    </div>
  );
}