import { useState } from "react";
import type { Route } from "./+types/resources";
import { PageHeaderCentered } from "../components/PageHeaderCentered";
import { InfoCardGrid } from "../components/InfoCardGrid";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resources - Fish and Follow" },
    { name: "description", content: "Helpful resources and information" },
  ];
}

interface InfoItem {
  id: number;
  title: string;
  description: string;
  category: string;
  link: string;
  featured: boolean;
}

const resources: InfoItem[] = [
  {
    id: 1,
    title: "Getting Started Guide",
    description: "Learn the basics of our platform and how to get the most out of our services.",
    category: "Documentation",
    link: "#",
    featured: true,
  },
  {
    id: 2,
    title: "API Documentation",
    description: "Complete reference for developers looking to integrate with our platform.",
    category: "Development",
    link: "#",
    featured: false,
  },
  {
    id: 3,
    title: "Best Practices",
    description: "Industry best practices and recommendations for contact management.",
    category: "Guidelines",
    link: "#",
    featured: true,
  },
  {
    id: 4,
    title: "Support Center",
    description: "Get help with common questions and technical issues.",
    category: "Support",
    link: "#",
    featured: false,
  },
  {
    id: 5,
    title: "Privacy Policy",
    description: "Learn about how we protect and handle your data.",
    category: "Legal",
    link: "#",
    featured: false,
  },
  {
    id: 6,
    title: "Terms of Service",
    description: "Our terms and conditions for using the platform.",
    category: "Legal",
    link: "#",
    featured: false,
  },
];

const categories = ["All", "Documentation", "Development", "Guidelines", "Support", "Legal"];

export default function Resources() {
  const featuredResources = resources;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageHeaderCentered
          title="Resources"
          description="Everything you need to know about our platform, from getting started guides to advanced documentation."
          showBackButton
          backButtonText="Back to Contact Form"
          backButtonHref="/"
        />

        {/* Show featured resources only if "All" is selected or if there are featured resources in the filtered category */}
        {featuredResources.length > 0 && (
          <InfoCardGrid
            title="Featured Resources"
            items={featuredResources}
            variant="featured"
          />
        )}
      </div>
    </div>
  );
}
