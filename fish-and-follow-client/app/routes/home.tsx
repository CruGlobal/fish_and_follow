import type { Route } from "./+types/home";
import { ContactForm } from "../components/ContactForm";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Contact Form - Fish and Follow" },
    { name: "description", content: "Submit your contact information" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Get in Touch</h1>
          <p className="mt-2 text-gray-600">We'd love to hear from you</p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
