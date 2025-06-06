import { Suspense } from "react";
import BlogClient from "./BlogClient";

export default function BlogPage() {
  return (
    <Suspense fallback={<p className="text-center py-10">Carregando posts...</p>}>
      <BlogClient />
    </Suspense>
  );
}
