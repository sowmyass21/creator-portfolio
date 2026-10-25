/**
 * Portfolio Publisher Service
 * Handles portfolio publishing status, slug verification, and link generation.
 */
export function buildPublishedUrl(slug, baseUrl = 'http://localhost:5173') {
  const cleanSlug = String(slug || '').toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
  return `${baseUrl}/portfolio/${cleanSlug}`;
}

export async function publishPortfolioRecord(portfolioRecord, customSlug, baseUrl) {
  const targetSlug = customSlug || portfolioRecord.slug;
  const publishedUrl = buildPublishedUrl(targetSlug, baseUrl);

  portfolioRecord.isPublished = true;
  portfolioRecord.slug = targetSlug;
  portfolioRecord.publishedUrl = publishedUrl;
  
  if (portfolioRecord.save) {
    await portfolioRecord.save();
  }

  return {
    success: true,
    isPublished: true,
    slug: targetSlug,
    publishedUrl,
    publishedAt: new Date().toISOString(),
  };
}

export async function unpublishPortfolioRecord(portfolioRecord) {
  portfolioRecord.isPublished = false;

  if (portfolioRecord.save) {
    await portfolioRecord.save();
  }

  return {
    success: true,
    isPublished: false,
    unpublishedAt: new Date().toISOString(),
  };
}

export default {
  buildPublishedUrl,
  publishPortfolioRecord,
  unpublishPortfolioRecord,
};
