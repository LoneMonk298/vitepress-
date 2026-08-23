import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
const site = (env.VITEPRESS_SITE_URL || 'https://blog.lonemonk.xyz').replace(/\/$/, '');
const walineServerURL = (env.WALINE_SERVER_URL || '').replace(/\/$/, '');

export const metaData = {
  lang: 'zh-CN',
  locale: 'zh_CN',
  title: '陌僧人的知识库',
  description: '个人技术知识库，记录 & 分享个人碎片化、结构化、体系化的技术知识内容。',
  site,
  profileSite: 'https://www.lonemonk.xyz',
  image: `${site}/logo.png`,
  walineServerURL,
};
