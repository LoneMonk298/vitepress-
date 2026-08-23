import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const contentRegistryPath = path.resolve(process.cwd(), 'content.registry.json');

export function loadContentRegistry() {
  const registry = JSON.parse(readFileSync(contentRegistryPath, 'utf8'));
  registry.categories = Array.isArray(registry.categories) ? registry.categories : [];
  registry.courses = Array.isArray(registry.courses) ? registry.courses : [];
  registry.tagAliases = registry.tagAliases && typeof registry.tagAliases === 'object' ? registry.tagAliases : {};
  return registry;
}

export function saveContentRegistry(registry) {
  writeFileSync(contentRegistryPath, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
}

export function findCategory(registry, value) {
  const candidate = String(value || '').trim();
  return registry.categories.find((category) => category.id === candidate || category.name === candidate) || null;
}

export function normalizeTag(registry, value) {
  const tag = String(value || '').trim().replace(/\s+/g, ' ');
  if (!tag) return '';
  return registry.tagAliases[tag.toLocaleLowerCase('en-US')] || tag;
}

export function categoryDisplayNames(registry, values) {
  const categories = Array.isArray(values) ? values : values ? [values] : [];
  return categories.map((value) => findCategory(registry, value)?.name || String(value));
}
