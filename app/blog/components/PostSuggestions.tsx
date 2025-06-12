"use client";

import Image from "next/image";
import { isExternalUrl } from "@/utils/isExternalUrl";

interface Post {
  slug: string;
  title: string;
  summary: string;
  thumbnail: string;
  category: string;
}

interface PostSuggestionsProps {
  posts: Post[];
}

export default function PostSuggestions({ posts }: PostSuggestionsProps) {
  if (!posts.length) return null;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center text-[var(--text-primary)]">
          Você também pode gostar
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/post/${post.slug}`}
              className="block bg-[var(--background)] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
            >
              {isExternalUrl(post.thumbnail) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.thumbnail}
                  alt={`Thumbnail de ${post.title}`}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <Image
                  src={post.thumbnail}
                  alt={`Thumbnail de ${post.title}`}
                  width={640}
                  height={320}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4 flex flex-col h-full">
                <span className="text-xs text-primary-600 uppercase mb-2">
                  {post.category}
                </span>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                  {post.title}
                </h3>
                <p className="text-sm text-neutral-600 line-clamp-3">
                  {post.summary}
                </p>
                <span className="text-primary-600 font-semibold text-sm inline-block mt-4">
                  Leia mais →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
