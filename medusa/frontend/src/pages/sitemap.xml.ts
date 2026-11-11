import { getProducts, getCollections, getBlogPosts } from '../lib/medusa'
import { blogPostPath } from '../lib/blog'

export async function GET() {
  const site = 'https://magic-crochet-kit.com'

  let products: any[] = []
  let collections: any[] = []
  let blogPosts: any[] = []

  try {
    const [pData, cData, bData] = await Promise.all([
      getProducts(500),
      getCollections(),
      getBlogPosts(200),
    ])
    products = pData.products || []
    collections = cData.collections || []
    blogPosts = bData.blog_posts || []
  } catch (e) {
    console.error('Sitemap fetch error:', e)
  }

  const today = new Date().toISOString().split('T')[0]

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/collections/', priority: '0.9', changefreq: 'daily' },
    { url: '/blog/', priority: '0.8', changefreq: 'daily' },
    { url: '/contact/', priority: '0.5', changefreq: 'monthly' },
    { url: '/a-propos/', priority: '0.5', changefreq: 'monthly' },
    { url: '/faq/', priority: '0.5', changefreq: 'monthly' },
    { url: '/livraison/', priority: '0.5', changefreq: 'monthly' },
    { url: '/suivi-commande/', priority: '0.3', changefreq: 'monthly' },
    { url: '/mentions-legales/', priority: '0.2', changefreq: 'yearly' },
    { url: '/cgv/', priority: '0.2', changefreq: 'yearly' },
    { url: '/politique-de-confidentialite/', priority: '0.2', changefreq: 'yearly' },
  ]

  const urls = [
    ...staticPages.map(p => `
    <url>
      <loc>${site}${p.url}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>${p.changefreq}</changefreq>
      <priority>${p.priority}</priority>
    </url>`),
    ...collections.map((c: any) => `
    <url>
      <loc>${site}/collections/${c.handle}/</loc>
      <lastmod>${c.updated_at?.split('T')[0] || today}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`),
    ...products.map((p: any) => `
    <url>
      <loc>${site}/products/${p.handle}/</loc>
      <lastmod>${p.updated_at?.split('T')[0] || today}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`),
    ...blogPosts.map((p: any) => `
    <url>
      <loc>${site}${blogPostPath(p)}</loc>
      <lastmod>${p.published_at?.split('T')[0] || p.created_at?.split('T')[0] || today}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>`),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join('')}
</urlset>`

  return new Response(xml.trim(), {
    headers: { 'Content-Type': 'application/xml' },
  })
}
