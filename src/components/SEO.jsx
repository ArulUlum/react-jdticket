import { useEffect } from 'react';

function upsertMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    el.setAttribute('data-seo-managed', 'true');
    document.head.appendChild(el);
  }
  el.setAttribute('content', value || '');
}

function removeManaged() {
  document.head
    .querySelectorAll('[data-seo-managed="true"]')
    .forEach((n) => n.parentNode.removeChild(n));
}

function upsertLink(rel, href, extra = {}) {
  let sel = `link[rel="${rel}"]`;
  if (extra.hreflang) sel += `[hreflang="${extra.hreflang}"]`;
  let el = document.head.querySelector(sel);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (extra.hreflang) el.setAttribute('hreflang', extra.hreflang);
    el.setAttribute('data-seo-managed', 'true');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export default function SEO({
  title,
  description,
  canonical,
  keywords,
  robots, // e.g. "index,follow"
  alternates = [], // [{ href:'https://kebbu.id/id/about', hreflang:'id' }, ...]
  openGraph = {}, // { title, description, url, image, type }
  jsonLd = null, // object → will be stringified
}) {
  useEffect(() => {
    // bersihin tag yang dikelola sebelumnya (biar ga numpuk pas route switch)
    removeManaged();

    if (title) document.title = title;
    if (description) upsertMeta('name', 'description', description);
    if (keywords) upsertMeta('name', 'keywords', keywords);
    if (robots) upsertMeta('name', 'robots', robots);

    if (canonical) upsertLink('canonical', canonical);

    alternates.forEach(({ href, hreflang }) => upsertLink('alternate', href, { hreflang }));

    // Open Graph
    const og = {
      title: openGraph.title || title,
      description: openGraph.description || description,
      url: openGraph.url || canonical,
      image: openGraph.image,
      type: openGraph.type || 'website',
    };
    Object.entries(og).forEach(([key, val]) => {
      if (!val) return;
      let el = document.head.querySelector(`meta[property="og:${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', `og:${key}`);
        el.setAttribute('data-seo-managed', 'true');
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    });

    // JSON-LD
    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(jsonLd);
      script.setAttribute('data-seo-managed', 'true');
      document.head.appendChild(script);
    }
  }, [title, description, canonical, keywords, robots, alternates, openGraph, jsonLd]);

  return null;
}
