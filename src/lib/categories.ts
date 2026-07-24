import fs from "fs";
import path from "path";
import { Category } from "@/types/article";

const categoriesFile = path.join(process.cwd(), "content/categories.json");

export function getCategories(): Category[] {
  if (!fs.existsSync(categoriesFile)) return [];
  const data = fs.readFileSync(categoriesFile, "utf8");
  return JSON.parse(data);
}

export function getCategoryById(id: string): Category | undefined {
  return getCategories().find((c) => c.id === id);
}

export function saveCategories(categories: Category[]): void {
  fs.writeFileSync(categoriesFile, JSON.stringify(categories, null, 2));
}

export function addCategory(category: Category): void {
  const categories = getCategories();
  categories.push(category);
  saveCategories(categories);
}

export function updateCategory(id: string, updates: Partial<Category>): boolean {
  const categories = getCategories();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return false;
  categories[index] = { ...categories[index], ...updates };
  saveCategories(categories);
  return true;
}

export function deleteCategory(id: string): boolean {
  const categories = getCategories();
  const filtered = categories.filter((c) => c.id !== id);
  if (filtered.length === categories.length) return false;
  saveCategories(filtered);
  return true;
}
