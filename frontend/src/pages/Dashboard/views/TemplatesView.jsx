/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Search, Plus, Copy, Trash2, Edit2, CheckCircle2, QrCode,
  X, Loader2, Star, RefreshCw
} from 'lucide-react';
import {
  fetchTemplates,
  createTemplate as createTemplateAPI,
  updateTemplate as updateTemplateAPI,
  deleteTemplate as deleteTemplateAPI,
} from '../../../api/template.api';
import useQRStore from '../../../store/qrStore';
import AnimatedPage from '../../../components/ui/AnimatedPage';
import { StaggeredGrid, StaggeredItem } from '../../../components/ui/StaggeredGrid';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { SkeletonCard } from '../../../components/ui/Skeleton';

const TemplatesView = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({ name: '', fgColor: '#000000', bgColor: '#ffffff', isDefault: false });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { setFgColor, setBgColor } = useQRStore();

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const result = await fetchTemplates();
      if (result.success) setTemplates(result.data);
    } catch (err) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTemplates(); }, []);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [templates, searchTerm]);

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormData({ name: '', fgColor: '#000000', bgColor: '#ffffff', isDefault: false });
    setModalOpen(true);
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      fgColor: template.fgColor,
      bgColor: template.bgColor,
      isDefault: template.isDefault,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      if (editingTemplate) {
        const result = await updateTemplateAPI(editingTemplate.id, formData);
        if (result.success) {
          setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? result.data : (formData.isDefault ? { ...t, isDefault: false } : t)));
          toast.success('Template updated');
        }
      } else {
        const result = await createTemplateAPI(formData);
        if (result.success) {
          if (formData.isDefault) {
            setTemplates(prev => prev.map(t => ({ ...t, isDefault: false })));
          }
          setTemplates(prev => [result.data, ...prev]);
          toast.success('Template created');
        }
      }
      setModalOpen(false);
    } catch (err) {
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteTemplateAPI(deleteTarget.id);
      setTemplates(prev => prev.filter(t => t.id !== deleteTarget.id));
      toast.success(`"${deleteTarget.name}" deleted`);
    } catch (err) {
      toast.error('Failed to delete template');
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  const handleDuplicate = async (template) => {
    try {
      const result = await createTemplateAPI({
        name: `${template.name} (Copy)`,
        fgColor: template.fgColor,
        bgColor: template.bgColor,
        isDefault: false,
      });
      if (result.success) {
        setTemplates(prev => [result.data, ...prev]);
        toast.success(`Duplicated "${template.name}"`);
      }
    } catch (err) {
      toast.error('Failed to duplicate template');
    }
  };

  const handleApplyDesign = (template) => {
    setFgColor(template.fgColor);
    setBgColor(template.bgColor);
    toast.success(`Applied "${template.name}" colors`);
  };

  return (
    <AnimatedPage className="flex-1 overflow-y-auto p-6 md:p-8 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
              Design Templates
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Save your brand colors to generate QR codes faster.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadTemplates}
              disabled={loading}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg shadow-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Template</span>
            </button>
          </div>
        </div>

        {/* Search */}
        {templates.length > 0 && (
          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && templates.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-72 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse bg-slate-50 dark:bg-slate-900 p-5 space-y-4">
                <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="flex gap-2">
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <StaggeredGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            

            {/* Template Cards */}
            {filteredTemplates.map((template) => (
              <StaggeredItem key={template.id}>
                <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
                  {/* QR Preview */}
                  <div className="h-48 flex items-center justify-center relative border-b border-slate-100 dark:border-slate-800" style={{ backgroundColor: template.bgColor }}>
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <QRCodeSVG
                        value="https://nexusqr.com"
                        size={96}
                        level="H"
                        fgColor={template.fgColor}
                        bgColor={template.bgColor}
                      />
                    </div>

                    {template.isDefault && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-[10px] font-bold uppercase rounded-md shadow-sm">
                        <Star className="w-3 h-3" /> Default
                      </div>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-sm">
                      <button
                        onClick={() => openEditModal(template)}
                        className="p-2 bg-white text-slate-900 rounded-full hover:scale-110 transition-transform shadow-md"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(template)}
                        className="p-2 bg-white text-slate-900 rounded-full hover:scale-110 transition-transform shadow-md"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(template)}
                        disabled={deletingId === template.id}
                        className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform disabled:opacity-50 shadow-md"
                        title="Delete"
                      >
                        {deletingId === template.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate pr-2">
                          {template.name}
                        </h3>
                        {template.isDefault && (
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <div className="w-3 h-3 rounded-full border border-slate-200 dark:border-slate-700" style={{ backgroundColor: template.fgColor }} />
                          {template.fgColor}
                        </div>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <div className="w-3 h-3 rounded-full border border-slate-200 dark:border-slate-700" style={{ backgroundColor: template.bgColor }} />
                          {template.bgColor}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                        Used {template.usedCount} times
                      </span>
                      <button
                        onClick={() => handleApplyDesign(template)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Apply Design
                      </button>
                    </div>
                  </div>
                </div>
              </StaggeredItem>
            ))}

            {filteredTemplates.length === 0 && templates.length > 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
                <QrCode className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 text-sm">No templates match your search.</p>
              </div>
            )}
          </StaggeredGrid>
        )}

        {/* Empty state */}
        {!loading && templates.length === 0 && (
          <div className="flex flex-col items-center justify-center p-16 text-center bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl mt-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-full mb-4 shadow-sm">
              <QrCode className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Templates Yet</h3>
            <p className="text-slate-500 max-w-sm mb-6 text-sm">
              Create your first design template to save brand colors and reuse them across QR codes.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Template</span>
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingTemplate ? 'Edit Template' : 'New Template'}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Corporate Brand"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">QR Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.fgColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, fgColor: e.target.value }))}
                        className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={formData.fgColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, fgColor: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white uppercase text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Background</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.bgColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, bgColor: e.target.value }))}
                        className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={formData.bgColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, bgColor: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white uppercase text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center p-6 rounded-xl border border-slate-100 dark:border-slate-800" style={{ backgroundColor: formData.bgColor }}>
                  <QRCodeSVG
                    value="https://nexusqr.com"
                    size={120}
                    level="H"
                    fgColor={formData.fgColor}
                    bgColor={formData.bgColor}
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Set as default template</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.name.trim()}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingTemplate ? 'Save Changes' : 'Create Template'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Template?"
        message={`"${deleteTarget?.name}" will be permanently deleted.`}
        confirmText="Delete"
        loading={!!deletingId}
        variant="danger"
      />
    </AnimatedPage>
  );
};

export default TemplatesView;
