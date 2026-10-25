import { useEffect } from 'react';

/**
 * Reusable SEO, OpenGraph, Twitter Card & JSON-LD Structured Data manager
 */
export const SeoHead = ({
  title = 'Elena Vance — Creator Portfolio & Social Metric Aggregator',
  description = 'Building scalable web systems and educating developers worldwide. Real-time creator social metrics and verified projects.',
  image = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200',
  url = window.location.href,
  creatorName = 'Elena Vance',
  handle = '@elenacodes',
  type = 'profile',
  structuredData = null
}) => {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper to set or create meta tag
    const setMetaTag = (selector, attribute, value, content) => {
      let element = document.querySelector(`meta[${attribute}="${selector}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, selector);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('description', 'name', null, description);
    setMetaTag('author', 'name', null, creatorName);
    setMetaTag('robots', 'name', null, 'index, follow');

    // 3. Open Graph (Facebook / LinkedIn / Slack)
    setMetaTag('og:title', 'property', null, title);
    setMetaTag('og:description', 'property', null, description);
    setMetaTag('og:image', 'property', null, image);
    setMetaTag('og:url', 'property', null, url);
    setMetaTag('og:type', 'property', null, type === 'profile' ? 'profile' : 'website');
    setMetaTag('og:site_name', 'property', null, 'CreatorPulse Studio');

    // 4. Twitter / X Cards
    setMetaTag('twitter:card', 'name', null, 'summary_large_image');
    setMetaTag('twitter:site', 'name', null, handle);
    setMetaTag('twitter:creator', 'name', null, handle);
    setMetaTag('twitter:title', 'name', null, title);
    setMetaTag('twitter:description', 'name', null, description);
    setMetaTag('twitter:image', 'name', null, image);

    // 5. Inject JSON-LD Schema
    const schemaId = 'seo-structured-data';
    let scriptTag = document.getElementById(schemaId);
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const defaultJsonLd = structuredData || {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      'mainEntity': {
        '@type': 'Person',
        'name': creatorName,
        'alternateName': handle,
        'jobTitle': title.split('—')[1]?.trim() || 'Full-Stack Creator & Technical Architect',
        'description': description,
        'image': image,
        'url': url,
        'sameAs': [
          'https://github.com/elenacodes',
          'https://youtube.com/@elenacodes',
          'https://x.com/elenacodes',
          'https://linkedin.com/in/elenacodes'
        ]
      }
    };

    scriptTag.textContent = JSON.stringify(defaultJsonLd);

  }, [title, description, image, url, creatorName, handle, type, structuredData]);

  return null;
};

export default SeoHead;
