import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import apiService from '../../services/api';
import { 
  FolderGit2, Plus, ExternalLink, Github, Star, Trash2, Edit3, CheckCircle2, 
  AlertCircle, Sparkles, Filter, Code2, Tag, Layers
} from 'lucide-react';

export const DashboardProjects = () => {
  const { projects, refetchProjects } = usePortfolio();
  const [feedback, setFeedback] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // null for Add, object for Edit

  const emptyForm = {
    title: '',
    slug: '',
    summary: '',
    description: '',
    category: 'Web Application',
    tags: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    demoUrl: '',
    githubUrl: '',
    articleUrl: '',
    featured: false,
    status: 'completed'
  };

  const [formData, setFormData] = useState(emptyForm);

  const openAddModal = () => {
    setEditingProject(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (proj) => {
    setEditingProject(proj);
    setFormData({
      title: proj.title || '',
      slug: proj.slug || '',
      summary: proj.summary || '',
      description: proj.description || '',
      category: proj.category || 'Web Application',
      tags: Array.isArray(proj.tags) ? proj.tags.join(', ') : (proj.tags || ''),
      thumbnailUrl: proj.thumbnailUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
      demoUrl: proj.demoUrl || '',
      githubUrl: proj.githubUrl || '',
      articleUrl: proj.articleUrl || '',
      featured: proj.featured || false,
      status: proj.status || 'completed'
    });
    setModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.summary || !formData.description) {
      setFeedback({ type: 'error', text: 'Title, Summary, and Description are required' });
      return;
    }

    setLoadingAction(true);
    setFeedback(null);

    const payload = {
      ...formData,
      tags: typeof formData.tags === 'string' 
        ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : formData.tags
    };

    try {
      if (editingProject) {
        const idToUpdate = editingProject._id || editingProject.slug;
        await apiService.updateProject(idToUpdate, payload);
        setFeedback({ type: 'success', text: `Project '${formData.title}' updated successfully!` });
      } else {
        await apiService.createProject(payload);
        setFeedback({ type: 'success', text: `Project '${formData.title}' created successfully!` });
      }

      await refetchProjects();
      setModalOpen(false);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setFeedback({ type: 'error', text: `Save error: ${err.message}` });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleFeature = async (proj) => {
    const idToToggle = proj._id || proj.slug;
    const newFeaturedStatus = !proj.featured;
    try {
      await apiService.toggleFeatureProject(idToToggle, newFeaturedStatus);
      await refetchProjects();
      setFeedback({
        type: 'success',
        text: `'${proj.title}' is now ${newFeaturedStatus ? 'FEATURED on top showcase' : 'UNFEATURED'}`
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: `Toggle error: ${err.message}` });
    }
  };

  const handleDelete = async (proj) => {
    if (!window.confirm(`Are you sure you want to delete project '${proj.title}'?`)) return;
    const idToDelete = proj._id || proj.slug;
    try {
      await apiService.deleteProject(idToDelete);
      await refetchProjects();
      setFeedback({ type: 'success', text: `Project '${proj.title}' deleted` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: `Delete error: ${err.message}` });
    }
  };

  const categories = ['All', 'Web Application', 'AI & Data Science', 'Content Platform', 'Open Source', 'UI/UX Design', 'Mobile App'];

  const filteredProjects = (projects || []).filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172033] dark:text-white tracking-tight">
            Portfolio Project Management
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] dark:text-slate-400 mt-1">
            Add, edit, delete, and feature your engineering applications and repositories.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-lg font-semibold text-xs text-white bg-[#6D5EF7] hover:bg-[#5B4CE6] shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Project
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
          feedback.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-[#D92D20] dark:text-rose-400'
            : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-[#16803D] dark:text-emerald-400'
        }`}>
          {feedback.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl p-4 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#6D5EF7] text-white shadow-xs'
                  : 'text-[#667085] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white hover:bg-[#F8F9FC] dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 px-3.5 py-1.5 rounded-lg bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-700 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7]"
        />
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((proj, idx) => (
          <div key={idx} className={`bg-white dark:bg-[#0F172A] rounded-2xl p-6 border transition-all space-y-4 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] ${
            proj.featured ? 'border-[#6D5EF7]/40 ring-1 ring-[#6D5EF7]/20' : 'border-[#E4E7EC] dark:border-slate-800'
          }`}>
            
            {/* Header badges */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md bg-[#6D5EF7]/10 text-[#6D5EF7] text-[10px] font-mono font-semibold">
                {proj.category}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleFeature(proj)}
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                    proj.featured
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      : 'bg-[#F8F9FC] dark:bg-slate-800 text-[#667085] hover:text-amber-600 border border-[#E4E7EC] dark:border-slate-700'
                  }`}
                  title="Toggle Featured status"
                >
                  <Star className={`w-3 h-3 ${proj.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>{proj.featured ? 'Featured' : 'Unfeatured'}</span>
                </button>
              </div>
            </div>

            {/* Thumbnail preview & info */}
            <div className="flex gap-4">
              <img
                src={proj.thumbnailUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800'}
                alt={proj.title}
                className="w-24 h-24 rounded-xl object-cover shrink-0 border border-[#E4E7EC] dark:border-slate-800"
              />
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="font-bold text-[#172033] dark:text-white text-base truncate">{proj.title}</h3>
                <p className="text-xs text-[#667085] dark:text-slate-400 line-clamp-2">{proj.summary}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(proj.tags || []).slice(0, 4).map((tag, tIdx) => (
                    <span key={tIdx} className="px-2 py-0.5 rounded bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 text-[10px] font-mono text-[#667085] dark:text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Links & Action buttons footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E4E7EC] dark:border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                {proj.githubUrl && (
                  <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="text-[#667085] hover:text-[#172033] dark:hover:text-white flex items-center gap-1 font-mono text-[11px]">
                    <Github className="w-3.5 h-3.5" /> Code
                  </a>
                )}
                {proj.demoUrl && (
                  <a href={proj.demoUrl} target="_blank" rel="noopener noreferrer" className="text-[#6D5EF7] hover:underline flex items-center gap-1 font-mono text-[11px] font-semibold">
                    <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(proj)}
                  className="px-3 py-1.5 rounded-lg bg-[#F8F9FC] dark:bg-slate-800 border border-[#E4E7EC] dark:border-slate-700 text-[#172033] dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(proj)}
                  className="p-1.5 rounded-lg text-[#D92D20] hover:bg-[#FEF3F2] dark:hover:bg-rose-950/30 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add / Edit Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-7 border border-[#E4E7EC] dark:border-slate-800 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] dark:border-slate-800 pb-3">
              <h3 className="font-bold text-[#172033] dark:text-white text-base flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-[#6D5EF7]" />
                {editingProject ? 'Edit Project' : 'Add New Portfolio Project'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-md text-[#667085] hover:text-[#172033] dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#172033] dark:text-slate-200">Project Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="PulseAnalytics Dashboard"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-700 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#172033] dark:text-slate-200">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-700 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7]"
                  >
                    <option value="Web Application">Web Application</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                    <option value="Content Platform">Content Platform</option>
                    <option value="Open Source">Open Source</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Mobile App">Mobile App</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#172033] dark:text-slate-200">Short Summary *</label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Real-time creator revenue analytics..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-700 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#172033] dark:text-slate-200">Detailed Description *</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Engineered with React, Express, MongoDB..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-700 text-xs text-[#172033] dark:text-white resize-none focus:outline-none focus:border-[#6D5EF7]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#172033] dark:text-slate-200">GitHub Repository URL</label>
                  <input
                    type="text"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/username/repo"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-700 text-xs text-[#172033] dark:text-white font-mono focus:outline-none focus:border-[#6D5EF7]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#172033] dark:text-slate-200">Live Demo URL</label>
                  <input
                    type="text"
                    value={formData.demoUrl}
                    onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                    placeholder="https://demo-app.dev"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-700 text-xs text-[#172033] dark:text-white font-mono focus:outline-none focus:border-[#6D5EF7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#172033] dark:text-slate-200">Technologies (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="React, Node.js, Express, MongoDB, Tailwind"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-700 text-xs text-[#172033] dark:text-white font-mono focus:outline-none focus:border-[#6D5EF7]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#172033] dark:text-slate-200">Thumbnail Image URL</label>
                  <input
                    type="text"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-lg bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-700 text-xs text-[#172033] dark:text-white font-mono focus:outline-none focus:border-[#6D5EF7]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-[#E4E7EC] accent-[#6D5EF7]"
                />
                <label htmlFor="featuredCheck" className="text-xs text-[#172033] dark:text-slate-300 font-medium">Feature this project prominently on portfolio header</label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E4E7EC] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#F8F9FC] dark:bg-slate-800 text-xs text-[#475467] dark:text-slate-300 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-5 py-2 rounded-lg bg-[#6D5EF7] hover:bg-[#5B4CE6] text-xs text-white font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  {loadingAction ? 'Saving...' : editingProject ? 'Update Project' : 'Add Project'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardProjects;
