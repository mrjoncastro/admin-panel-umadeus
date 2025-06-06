"use client";

import Image from "next/image";

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
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-900">
          Você também pode gostar
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/post/${post.slug}`}
              className="block bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <Image
                src={post.thumbnail}
                alt={`Thumbnail de ${post.title}`}
                width={640}
                height={320}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 flex flex-col h-full">
                <span className="text-xs text-blue-600 uppercase mb-2">
                  {post.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {post.summary}
                </p>
                <span className="text-blue-600 font-semibold text-sm inline-block mt-4">
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
