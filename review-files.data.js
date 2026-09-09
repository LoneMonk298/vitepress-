import fs from 'node:fs';
import path from 'node:path';

// 扫描 docs/public/review/ 目录（支持按科目建子文件夹），构建期生成复习资料索引。
// 页面通过 `import { data } from './review-files.data.js'` 消费。
const REVIEW_DIR = path.resolve(process.cwd(), 'docs/public/review');

function walk(dir, folder) {
  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'README.md') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, folder ? folder + '/' + entry.name : entry.name));
    } else if (entry.isFile()) {
      const stat = fs.statSync(full);
      const rel = folder ? folder + '/' + entry.name : entry.name;
      out.push({
        name: entry.name,
        folder: folder || '',
        url: '/review/' + rel.split('/').map(encodeURIComponent).join('/'),
        ext: path.extname(entry.name).slice(1).toLowerCase(),
        size: stat.size,
        mtime: stat.mtime.toISOString().slice(0, 10),
      });
    }
  }
  return out;
}

export default {
  watch: ['./docs/public/review/**'],
  load() {
    return walk(REVIEW_DIR, '');
  },
}
