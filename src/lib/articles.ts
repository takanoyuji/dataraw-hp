import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Article, ArticleMeta } from "@/types/article";

const articlesDirectory = path.join(process.cwd(), "content/articles");

export function getArticleSlugs(): string[] {
  if (!fs.existsSync(articlesDirectory)) return [];
  return fs
    .readdirSync(articlesDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getArticleBySlug(slug: string): Article | null {
  const filePath = path.join(articlesDirectory, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title || "",
    description: data.description || "",
    content,
    category: data.category || "",
    tags: data.tags || [],
    publishedAt: data.publishedAt || "",
    updatedAt: data.updatedAt,
    author: data.author || "高野 悠司",
    thumbnail: data.thumbnail,
    published: data.published !== false,
  };
}

export function getAllArticles(): Article[] {
  const slugs = getArticleSlugs();
  return slugs
    .map((slug) => getArticleBySlug(slug))
    .filter((article): article is Article => article !== null && article.published)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getAllArticleMetas(): ArticleMeta[] {
  return getAllArticles().map((article) => {
    const { content, ...meta } = article;
    void content;
    return meta;
  });
}

export function getArticlesByCategory(category: string): ArticleMeta[] {
  return getAllArticleMetas().filter((a) => a.category === category);
}

export function getArticlesByTag(tag: string): ArticleMeta[] {
  return getAllArticleMetas().filter((a) => a.tags.includes(tag));
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  getAllArticleMetas().forEach((a) => a.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

export function saveArticle(slug: string, article: Omit<Article, "slug">): void {
  const { content, ...frontmatter } = article;
  const md = matter.stringify(content, frontmatter);
  fs.writeFileSync(path.join(articlesDirectory, `${slug}.md`), md);
}

export function deleteArticle(slug: string): boolean {
  const filePath = path.join(articlesDirectory, `${slug}.md`);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}
