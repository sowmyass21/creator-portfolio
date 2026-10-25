/**
 * Portfolio Renderer Service
 * Formats render props and layout metadata for the portfolio preview and public page.
 */
export function formatPortfolioRenderData(portfolio) {
  if (!portfolio) return null;

  const { title, slug, theme, customization, sections, isPublished, publishedUrl, updatedAt } = portfolio;

  return {
    meta: {
      title: title || `${slug}'s Portfolio`,
      slug,
      theme: theme || 'modern-minimal',
      isPublished: Boolean(isPublished),
      publishedUrl: publishedUrl || '',
      lastUpdated: updatedAt ? new Date(updatedAt).toISOString() : new Date().toISOString(),
    },
    customization: {
      primaryColor: customization?.primaryColor || '#6366f1',
      accentColor: customization?.accentColor || '#ec4899',
      fontStyle: customization?.fontStyle || 'Inter',
      showMetrics: customization?.showMetrics !== false,
      sectionOrder: customization?.sectionOrder || ['hero', 'about', 'experience', 'skills', 'projects', 'education', 'contact'],
      hiddenSections: customization?.hiddenSections || [],
    },
    sections: sections || {},
  };
}

export default {
  formatPortfolioRenderData,
};
