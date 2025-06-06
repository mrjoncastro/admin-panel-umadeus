import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import { evaluate } from "xdm";
import * as runtime from "react/jsx-runtime";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Share2, Clock } from "lucide-react";
import { isExternalUrl } from "@/utils/isExternalUrl";
import styles from "./post.module.css";
import type { Metadata } from "next";
import CtaWhats from "@/app/components/CTAWhats";
import CtaWhatsButton from "@/app/components/CtaWhatsButton";
import { getRelatedPosts } from "@/lib/getRelatedPosts";
import NextPostButton from "@/app/blog/components/NextPostButton";
import PostSuggestions from "@/app/blog/components/PostSuggestions";
import MiniPrecosPost from "../../components/MiniPrecosPost";
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

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: data.title,
    description: data.summary || "",
    image: isExternalUrl(data.thumbnail)
      ? data.thumbnail
      : `https://m24saude.com.br${data.thumbnail || "/img/og-default.jpg"}`,
    author: {
      "@type": "Person",
      name: "Redação M24",
    },
    publisher: {
      "@type": "Organization",
      name: "M24 Saúde",
      logo: {
        "@type": "ImageObject",
        url: "https://m24saude.com.br/img/M24.webp",
      },
    },
    datePublished: data.date || new Date().toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://m24saude.com.br/blog/post/${slug}`,
    },
  };

  return (
    <>
      <Header />
      <main className={styles.container}>
        {data.thumbnail && (
          <figure>
            <img
              src={
                isExternalUrl(data.thumbnail) ? data.thumbnail : data.thumbnail
              }
              alt={`Imagem de capa: ${data.title}`}
              className={styles.thumbnail}
              loading="lazy"
              decoding="async"
            />
            {data.credit && <figcaption>{data.credit}</figcaption>}
          </figure>
        )}

        {data.category && (
          <span className={styles.category}>{data.category}</span>
        )}

        <h1 className={styles.title}>{data.title}</h1>

        <div className={styles.meta}>
          <div className={styles.authorBlock}>
            <img
              src="/img/avatar_m24.webp"
              alt="Autor"
              className={styles.avatar}
            />
            <span>Redação M24</span>
          </div>

          <div className={styles.readingTime}>
            <Clock className={styles.icon} />
            <span>{readingTime} min de leitura</span>
          </div>

          <a
            href={`https://twitter.com/intent/tweet?url=https://m24saude.com.br/blog/post/${slug}&text=${encodeURIComponent(
              data.title
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.share}
          >
            <Share2 className={styles.icon} />
            Compartilhar
          </a>
        </div>

        {data.summary && <p className={styles.summary}>{data.summary}</p>}

        <article>
          <Content />
          {nextPost && <NextPostButton slug={nextPost.slug} />}
          <MiniPrecosPost />
        </article>
      </main>

      <PostSuggestions posts={suggestions} />
      <CtaWhats />
      <Footer />
      <CtaWhatsButton />

      {/* JSON-LD Schema para SEO */}
      <Script
        id="blogpost-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
