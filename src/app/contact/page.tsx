"use client";
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setName(""); setEmail(""); setSubject(""); setMessage("");
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-sky-600 to-teal-500 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-sky-100 text-lg">
            We&apos;re here to help. Reach out anytime.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Get in Touch</h2>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "Email", value: "support@pharmacare.com", color: "bg-sky-50 text-sky-600" },
                  { icon: Phone, label: "Phone", value: "+92 300 1234567", color: "bg-teal-50 text-teal-600" },
                  { icon: MapPin, label: "Address", value: "123 Pharmacy Street, Karachi, Pakistan", color: "bg-green-50 text-green-600" },
                  { icon: Clock, label: "Hours", value: "24/7 Online Support", color: "bg-violet-50 text-violet-600" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{label}</p>
                      <p className="text-gray-500 text-sm mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6">
              <h3 className="font-bold text-sky-800 mb-2">⚕️ Medical Emergency?</h3>
              <p className="text-sky-700 text-sm">
                For medical emergencies, please call your local emergency services
                immediately. PharmaCare is not a substitute for emergency medical care.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we help?" />
              </div>
              <div className="space-y-1.5">
                <Label>Message *</Label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  rows={5}
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white" disabled={sending}>
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Send Message</>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}