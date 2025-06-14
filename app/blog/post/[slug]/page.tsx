import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import { evaluate } from "xdm";
import * as runtime from "react/jsx-runtime";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import { Share2, Clock } from "lucide-react";
import { isExternalUrl } from "@/utils/isExternalUrl";
import type { Metadata } from "next";
import { getRelatedPosts } from "@/lib/posts/getRelatedPosts";
import NextPostButton from "@/app/blog/components/NextPostButton";
import PostSuggestions from "@/app/blog/components/PostSuggestions";
import Script from "next/script";

interface Params {
  slug: string;
}

export async function generateStaticParams() {
  const files = fs.readdirSync("posts").filter((f) => f.endsWith(".mdx"));
  return files.map((file) => ({ slug: file.replace(/\.mdx$/, "") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;

  const filePath = path.join("posts", `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return {
      title: "Post não encontrado",
      description: "O conteúdo solicitado não foi encontrado.",
    };
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { data } = matter(raw);

  return {
    title: data.title,
    description: data.summary || "",
    openGraph: {
      title: data.title,
      description: data.summary || "",
      images: [data.thumbnail || "/img/og-default.jpg"],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const filePath = path.join("posts", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return notFound();

  const raw = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(raw);
  const { nextPost, suggestions } = getRelatedPosts(slug, data.category);
  const evaluated = await evaluate(content, { ...runtime });
  const Content = evaluated.default;

  const words = content.split(/\s+/).length;
  const readingTime = Math.ceil(words / 200);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://m24saude.com.br";

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: data.title,
    description: data.summary || "",
    image: isExternalUrl(data.thumbnail)
      ? data.thumbnail
      : `${siteUrl}${data.thumbnail || "/img/og-default.jpg"}`,
    author: {
      "@type": "Person",
      name: "Redação M24",
    },
    publisher: {
      "@type": "Organization",
      name: "M24 Saúde",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/img/M24.webp`,
      },
    },
    datePublished: data.date || new Date().toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/post/${slug}`,
    },
  };

  return (
    <>
      <main
        className="mx-auto mt-8 max-w-[680px] px-5 py-20 text-[1.125rem] leading-[1.8] text-[var(--text-primary)] bg-white"
      >
        {data.thumbnail && (
          <figure>
            {isExternalUrl(data.thumbnail) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.thumbnail}
                alt={`Imagem de capa: ${data.title}`}
                className="w-full max-w-[640px] max-h-[360px] object-cover rounded-xl mx-auto mb-6"
              />
            ) : (
              <Image
                src={data.thumbnail}
                alt={`Imagem de capa: ${data.title}`}
                width={1200}
                height={600}
                className="w-full max-w-[640px] max-h-[360px] object-cover rounded-xl mx-auto mb-6"
              />
            )}
            {data.credit && (
              <figcaption className="text-sm text-neutral-500 text-center mt-2 italic">
                {data.credit}
              </figcaption>
            )}
          </figure>
        )}

        {data.category && (
          <span className="text-xs uppercase text-primary-600 font-semibold">
            {data.category}
          </span>
        )}

        <h1 className="text-2xl md:text-3xl font-bold leading-snug mt-2 mb-6">
          {data.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-[0.9375rem] mb-6">
          <div className="flex items-center gap-2 min-w-0">
            <Image
              src="/img/avatar_m24.webp"
              alt="Autor"
              width={40}
              height={40}
              className="flex-shrink-0 w-9 h-9 rounded-full object-cover"
            />
            <span>Redação M24</span>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{readingTime} min de leitura</span>
          </div>

          <a
            href={`https://twitter.com/intent/tweet?url=${siteUrl}/blog/post/${slug}&text=${encodeURIComponent(
              data.title
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary-600 hover:underline"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </a>
        </div>

        {data.summary && (
          <p className="mb-8 text-[1.125rem] text-neutral-700">{data.summary}</p>
        )}

        <article className="prose prose-neutral max-w-none">
          <Content />
          {nextPost && <NextPostButton slug={nextPost.slug} />}
        </article>
      </main>

      <PostSuggestions posts={suggestions} />
      <Footer />

      {/* JSON-LD Schema para SEO */}
      <Script
        id="blogpost-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
