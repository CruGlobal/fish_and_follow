import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from "./ui/card";

interface InfoCardProps {
  id: number;
  title: string;
  description: string;
  category: string;
  link: string;
  featured?: boolean;
  variant?: "featured" | "default";
}

export function InfoCard({ 
  title, 
  description, 
  category, 
  link, 
  featured = false, 
  variant = "default" 
}: InfoCardProps) {
  const categoryColor = variant === "featured" 
    ? "bg-blue-100 text-blue-800" 
    : "bg-gray-100 text-gray-800";

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardAction>
          {featured && (
            <svg
              className="w-4 h-4 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-label="Featured"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )}
        </CardAction>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
          {category}
        </span>
      </CardContent>
      <CardFooter>
        <a
          href={link}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Read more
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </CardFooter>
    </Card>
  );
}
