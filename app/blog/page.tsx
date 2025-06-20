import { Suspense } from "react";
import BlogClient from "./BlogClient";
import LoadingOverlay from "@/components/organisms/LoadingOverlay";

export default function BlogPage() {
  return (
    <Suspense fallback={<LoadingOverlay show={true} text="Carregando posts..." />}>
      <BlogClient />
    </Suspense>
  );
}
