import React, { useState, useEffect, useMemo, useRef } from 'react';
import { fetchMyQRCodes, deleteQRCode, duplicateQRCode, toggleFavorite, batchDeleteQRCodes, updateQRCode } from '../../../api/qrcode.api';
import { fetchFolders, createFolder, deleteFolder as deleteFolderApi } from '../../../api/folder.api';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Link as LinkIcon, BarChart2, Calendar,
  CheckCircle2, QrCode, Trash2, Search, Download, Filter, RefreshCw,
  ChevronDown, FileImage, FileText, Image, Copy, Star, CheckSquare, Square,
  Pencil, X, Power, FolderOpen, FolderPlus, Archive, CalendarRange, SortAsc,
  MoreHorizontal
} from 'lucide-react';
import AnimatedPage from '../../../components/ui/AnimatedPage';
import { StaggeredGrid, StaggeredItem } from '../../../components/ui/StaggeredGrid';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const MyQRCodesView = ({ onViewAnalytics }) => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interaction States
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [togglingFavId, setTogglingFavId] = useState(null);

  // Edit Modal
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', targetUrl: '', description: '', expiresAt: '', maxScans: '' });
  const [editSaving, setEditSaving] = useState(false);

  // Batch Selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [bulkExporting, setBulkExporting] = useState(false);

  // Folders
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState('all'); // 'all' | 'uncategorized' | folder.id
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderInput, setShowFolderInput] = useState(false);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, most-scans, least-scans
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const loadQRCodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const [qrResult, folderResult] = await Promise.all([
        fetchMyQRCodes(),
        fetchFolders().catch(() => ({ success: true, data: [] })),
      ]);
      if (qrResult.success) setQrCodes(qrResult.data);
      if (folderResult.success) setFolders(folderResult.data);
    } catch (err) {
      setError(err.message || "Failed to load QR codes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQRCodes();
  }, []);

  // ── Edit Handlers ──
  const openEditModal = (qr) => {
    setEditTarget(qr);
    setEditForm({
      title: qr.title || '',
      targetUrl: qr.targetUrl || '',
      description: qr.description || '',
      expiresAt: qr.expiresAt ? new Date(qr.expiresAt).toISOString().slice(0, 16) : '',
      maxScans: qr.maxScans ?? '',
    });
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    setEditSaving(true);
    try {
      const payload = {
        title: editForm.title,
        targetUrl: editForm.targetUrl || undefined,
        description: editForm.description || '',
        expiresAt: editForm.expiresAt || null,
        maxScans: editForm.maxScans ? parseInt(editForm.maxScans, 10) : null,
      };
      const result = await updateQRCode(editTarget.id, payload);
      if (result.success) {
        setQrCodes(prev => prev.map(qr => qr.id === editTarget.id ? { ...qr, ...result.data } : qr));
        toast.success('QR code updated');
        setEditTarget(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Status Toggle ──
  const handleToggleActive = async (qr) => {
    try {
      const result = await updateQRCode(qr.id, { isActive: !qr.isActive });
      if (result.success) {
        setQrCodes(prev => prev.map(q => q.id === qr.id ? { ...q, isActive: result.data.isActive } : q));
        toast.success(result.data.isActive ? 'QR code activated' : 'QR code paused');
      }
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  // ── Folder Handlers ──
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const result = await createFolder({ name: newFolderName.trim() });
      if (result.success) {
        setFolders(prev => [...prev, result.data]);
        setNewFolderName('');
        setShowFolderInput(false);
        toast.success('Folder created');
      }
    } catch (err) {
      toast.error('Failed to create folder');
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await deleteFolderApi(folderId);
      setFolders(prev => prev.filter(f => f.id !== folderId));
      setQrCodes(prev => prev.map(qr => qr.folderId === folderId ? { ...qr, folderId: null } : qr));
      if (activeFolder === folderId) setActiveFolder('all');
      toast.success('Folder deleted');
    } catch (err) {
      toast.error('Failed to delete folder');
    }
  };

  const handleMoveToFolder = async (qrId, folderId) => {
    try {
      const result = await updateQRCode(qrId, { folderId: folderId || null });
      if (result.success) {
        setQrCodes(prev => prev.map(qr => qr.id === qrId ? { ...qr, folderId: folderId || null } : qr));
        toast.success(folderId ? 'Moved to folder' : 'Removed from folder');
      }
    } catch (err) {
      toast.error('Failed to move QR code');
    }
  };

  const handleCopyLink = (shortId) => {
    const baseUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'http://localhost:5000';
    navigator.clipboard.writeText(`${baseUrl}/q/${shortId}`);
    setCopiedId(shortId);
    toast.success('Tracking link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteQRCode(deleteTarget.id);
      setQrCodes(prev => prev.filter(qr => qr.id !== deleteTarget.id));
      toast.success(`"${deleteTarget.title}" deleted successfully`);
    } catch (err) {
      toast.error("Failed to delete QR Code: " + (err.message || "Unknown error"));
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  const handleDuplicate = async (qr) => {
    setDuplicatingId(qr.id);
    try {
      const result = await duplicateQRCode(qr.id);
      if (result.success) {
        setQrCodes(prev => [result.data, ...prev]);
        toast.success(`"${qr.title}" duplicated`);
      }
    } catch (err) {
      toast.error('Failed to duplicate QR code');
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleToggleFavorite = async (qr) => {
    setTogglingFavId(qr.id);
    try {
      const result = await toggleFavorite(qr.id);
      if (result.success) {
        setQrCodes(prev => prev.map(q => q.id === qr.id ? { ...q, isFavorite: result.data.isFavorite } : q));
        toast.success(result.data.isFavorite ? 'Added to favorites' : 'Removed from favorites');
      }
    } catch (err) {
      toast.error('Failed to update favorite');
    } finally {
      setTogglingFavId(null);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredQRCodes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQRCodes.map(qr => qr.id)));
    }
  };

  const handleBatchDelete = async () => {
    setBatchDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      const result = await batchDeleteQRCodes(ids);
      if (result.success) {
        setQrCodes(prev => prev.filter(qr => !selectedIds.has(qr.id)));
        toast.success(`${result.count} QR code(s) deleted`);
        setSelectedIds(new Set());
      }
    } catch (err) {
      toast.error('Failed to batch delete');
    } finally {
      setBatchDeleting(false);
      setBatchDeleteOpen(false);
    }
  };

  // ── Bulk Export as ZIP ──
  const handleBulkExport = async () => {
    const ids = selectedIds.size > 0 ? selectedIds : new Set(filteredQRCodes.map(qr => qr.id));
    if (ids.size === 0) return;
    setBulkExporting(true);
    const zip = new JSZip();
    const toExport = qrCodes.filter(qr => ids.has(qr.id));

    try {
      for (const qr of toExport) {
        const canvas = await svgToCanvas(qr.id, 1024);
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        zip.file(`${slugify(qr.title)}-qr.png`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nexusqr-export-${toExport.length}-codes.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${toExport.length} QR codes as ZIP`);
    } catch (err) {
      toast.error('Failed to export ZIP');
    } finally {
      setBulkExporting(false);
    }
  };

  // Export dropdown state
  const [exportMenuId, setExportMenuId] = useState(null);
  const exportMenuRef = useRef(null);

  // More actions dropdown state
  const [moreMenuId, setMoreMenuId] = useState(null);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportMenuId(null);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setMoreMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const svgToCanvas = (qrId, size = 1024) => {
    return new Promise((resolve, reject) => {
      const svgElement = document.getElementById(`qr-${qrId}`);
      if (!svgElement) return reject(new Error('SVG not found'));

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
      img.src = url;
    });
  };

  const slugify = (title) => title.replace(/\s+/g, '-').toLowerCase();

  const handleDownload = async (qrId, title, format) => {
    setExportMenuId(null);
    const filename = slugify(title);

    if (format === 'svg') {
      const svgElement = document.getElementById(`qr-${qrId}`);
      if (!svgElement) return;
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}-qr.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported as SVG`);
      return;
    }

    try {
      const canvas = await svgToCanvas(qrId, 1024);

      if (format === 'png') {
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}-qr.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 'image/png');
      } else if (format === 'jpeg') {
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}-qr.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.95);
      } else if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const qrSize = 120;
        const x = (pageWidth - qrSize) / 2;
        const y = 40;
        pdf.setFontSize(18);
        pdf.text(title, pageWidth / 2, 25, { align: 'center' });
        pdf.addImage(imgData, 'PNG', x, y, qrSize, qrSize);
        pdf.setFontSize(10);
        pdf.setTextColor(120);
        pdf.text('Generated by NexusQR', pageWidth / 2, y + qrSize + 12, { align: 'center' });
        pdf.save(`${filename}-qr.pdf`);
      }
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error(`Failed to export as ${format}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filteredQRCodes = useMemo(() => {
    return qrCodes
      .filter(qr => {
        const matchesSearch = qr.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || qr.qrType === filterType;

        // Folder filter
        let matchesFolder = true;
        if (activeFolder === 'uncategorized') matchesFolder = !qr.folderId;
        else if (activeFolder !== 'all') matchesFolder = qr.folderId === activeFolder;

        // Date range filter
        let matchesDate = true;
        if (dateFrom) matchesDate = new Date(qr.createdAt) >= new Date(dateFrom);
        if (dateTo && matchesDate) matchesDate = new Date(qr.createdAt) <= new Date(dateTo + 'T23:59:59');

        return matchesSearch && matchesType && matchesFolder && matchesDate;
      })
      .sort((a, b) => {
        // Favorites always first
        const favDiff = (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
        if (favDiff !== 0) return favDiff;

        switch (sortBy) {
          case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
          case 'most-scans': return (b.scanCount || 0) - (a.scanCount || 0);
          case 'least-scans': return (a.scanCount || 0) - (b.scanCount || 0);
          default: return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
  }, [qrCodes, searchTerm, filterType, activeFolder, dateFrom, dateTo, sortBy]);

  const uniqueTypes = ['All', ...new Set(qrCodes.map(qr => qr.qrType))];

  // Folder move dropdown
  const [folderMenuId, setFolderMenuId] = useState(null);
  const folderMenuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (folderMenuRef.current && !folderMenuRef.current.contains(e.target)) {
        setFolderMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (error) {
    return (
      <AnimatedPage className="flex-1 flex flex-col items-center justify-center h-full gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl max-w-md text-center border border-red-100 dark:border-red-800">
          <p className="font-medium">{error}</p>
        </div>
        <button
          onClick={loadQRCodes}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">My QR Codes</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage, track, and download your generated campaigns.</p>
          </div>

          <div className="flex items-center gap-3 w-max">
            <button
              onClick={loadQRCodes}
              disabled={loading}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            </button>

            <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {loading && qrCodes.length === 0 ? '-' : qrCodes.length} Total
              </span>
            </div>
          </div>
        </div>

        {/* Main Content: Sidebar + Grid */}
        <div className="flex gap-6">

          {/* Folder Sidebar */}
          {qrCodes.length > 0 && (
            <div className="hidden lg:block w-52 shrink-0 space-y-1">
              <button
                onClick={() => setActiveFolder('all')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFolder === 'all' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <QrCode className="w-4 h-4" /> All QR Codes
                <span className="ml-auto text-xs opacity-60">{qrCodes.length}</span>
              </button>
              <button
                onClick={() => setActiveFolder('uncategorized')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFolder === 'uncategorized' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Archive className="w-4 h-4" /> Uncategorized
                <span className="ml-auto text-xs opacity-60">{qrCodes.filter(q => !q.folderId).length}</span>
              </button>

              <div className="border-t border-slate-200 dark:border-slate-800 my-2" />

              {folders.map(folder => (
                <div key={folder.id} className="group flex items-center">
                  <button
                    onClick={() => setActiveFolder(folder.id)}
                    className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFolder === folder.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FolderOpen className="w-4 h-4" style={{ color: folder.color }} />
                    <span className="truncate">{folder.name}</span>
                    <span className="ml-auto text-xs opacity-60">{folder.qrCount || qrCodes.filter(q => q.folderId === folder.id).length}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(folder.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                    title="Delete folder"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {showFolderInput ? (
                <div className="flex items-center gap-1 px-1">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                    placeholder="Folder name..."
                    className="flex-1 px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <button onClick={handleCreateFolder} className="p-1 text-blue-500 hover:text-blue-700">
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setShowFolderInput(false); setNewFolderName(''); }} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowFolderInput(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FolderPlus className="w-4 h-4" /> New Folder
                </button>
              )}
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">

            {/* Toolbar: Search and Filter */}
            {(!loading || qrCodes.length > 0) && qrCodes.length > 0 && (
              <div className="mb-6 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    />
                  </div>
                  <div className="relative min-w-[140px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    >
                      {uniqueTypes.map(type => (
                        <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative min-w-[140px]">
                    <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="most-scans">Most Scans</option>
                      <option value="least-scans">Least Scans</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 border rounded-xl text-sm font-medium transition-colors shadow-sm ${
                      showAdvancedFilters || dateFrom || dateTo
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CalendarRange className="w-4 h-4" />
                    Date
                  </button>
                </div>

                {/* Advanced Filters: Date Range */}
                <AnimatePresence>
                  {showAdvancedFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <span className="text-xs font-medium text-slate-500">Created between:</span>
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-xs text-slate-400">to</span>
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {(dateFrom || dateTo) && (
                          <button
                            onClick={() => { setDateFrom(''); setDateTo(''); }}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                          >
                            Clear dates
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Batch Action Bar */}
                {filteredQRCodes.length > 0 && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
                    >
                      {selectedIds.size === filteredQRCodes.length && selectedIds.size > 0
                        ? <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                        : <Square className="w-3.5 h-3.5" />
                      }
                      {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
                    </button>
                    {selectedIds.size > 0 && (
                      <>
                        <button
                          onClick={() => setBatchDeleteOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete {selectedIds.size}
                        </button>
                        <button
                          onClick={handleBulkExport}
                          disabled={bulkExporting}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-emerald-600 dark:text-emerald-400 disabled:opacity-50"
                        >
                          {bulkExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                          Export ZIP
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Skeleton Loading State */}
            {loading && qrCodes.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 animate-pulse h-[180px]">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                      <div className="flex-1 space-y-3 py-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mt-4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredQRCodes.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm mt-8">
                 <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-4">
                   <QrCode className="w-8 h-8 text-slate-400" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No QR Codes Found</h3>
                 <p className="text-slate-500 max-w-sm mb-6 text-sm">
                   {qrCodes.length === 0
                     ? "You haven't created any QR campaigns yet. Head over to the Create tab to get started."
                     : "No QR codes match your current search and filter settings."}
                 </p>
               </div>
            ) : (
              <StaggeredGrid className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredQRCodes.map((qr) => (
                  <StaggeredItem key={qr.id}>
                    <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group ${selectedIds.has(qr.id) ? 'border-blue-400 dark:border-blue-600 ring-1 ring-blue-400' : 'border-slate-200 dark:border-slate-800'} ${!qr.isActive ? 'opacity-60' : ''} ${loading ? 'pointer-events-none' : ''}`}>

                      {/* Top Section */}
                      <div className="p-5 flex gap-4 border-b border-slate-100 dark:border-slate-800">
                        {/* Select Checkbox */}
                        <button
                          onClick={() => toggleSelect(qr.id)}
                          className="self-start mt-1 p-0.5 text-slate-400 hover:text-blue-500 transition-colors shrink-0"
                        >
                          {selectedIds.has(qr.id)
                            ? <CheckSquare className="w-4 h-4 text-blue-500" />
                            : <Square className="w-4 h-4" />
                          }
                        </button>
                        <div className="w-24 h-24 bg-white border border-slate-200 rounded-xl p-2 shrink-0 flex items-center justify-center relative group-hover:border-blue-300 dark:group-hover:border-blue-600 transition-colors duration-300">
                          <QRCodeSVG
                            id={`qr-${qr.id}`}
                            value={`${import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'http://localhost:5000'}/q/${qr.shortId}`}
                            size={80}
                            level={"H"}
                          />
                        </div>
                        <div className="flex flex-col justify-center min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 dark:text-white truncate" title={qr.title}>{qr.title}</h3>
                            {qr.isFavorite && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 mb-2">
                            <span className="inline-block px-2.5 py-0.5 bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider rounded-md border border-blue-100 dark:border-blue-800">
                              {qr.qrType}
                            </span>
                            {!qr.isActive && (
                              <span className="inline-block px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase rounded-md border border-amber-100 dark:border-amber-800">
                                Paused
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-slate-500 mt-auto">
                            <Calendar className="w-3.5 h-3.5 mr-1.5" /> {formatDate(qr.createdAt)}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section: Stats & Actions */}
                      <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                          <BarChart2 className="w-4 h-4 text-emerald-500" />
                          <span>{qr.scanCount} scans</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* COPY LINK */}
                          <button
                            onClick={() => handleCopyLink(qr.shortId)}
                            className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors shadow-sm"
                            title="Copy Tracking Link"
                          >
                            {copiedId === qr.shortId ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
                          </button>

                          {/* DOWNLOAD DROPDOWN */}
                          <div className="relative" ref={exportMenuId === qr.id ? exportMenuRef : null}>
                            <button
                              onClick={() => setExportMenuId(exportMenuId === qr.id ? null : qr.id)}
                              className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors shadow-sm"
                              title="Download QR Code"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            {exportMenuId === qr.id && (
                              <div className="absolute right-0 bottom-full mb-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 py-1 animate-in fade-in duration-150">
                                <button onClick={() => handleDownload(qr.id, qr.title, 'svg')} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                  <QrCode className="w-4 h-4 text-slate-400" /> SVG
                                </button>
                                <button onClick={() => handleDownload(qr.id, qr.title, 'png')} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                  <FileImage className="w-4 h-4 text-blue-400" /> PNG
                                </button>
                                <button onClick={() => handleDownload(qr.id, qr.title, 'jpeg')} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                  <Image className="w-4 h-4 text-amber-400" /> JPEG
                                </button>
                                <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                                <button onClick={() => handleDownload(qr.id, qr.title, 'pdf')} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                  <FileText className="w-4 h-4 text-red-400" /> PDF
                                </button>
                              </div>
                            )}
                          </div>

                          {/* ANALYTICS */}
                          {onViewAnalytics && (
                            <button
                              onClick={() => onViewAnalytics(qr.id)}
                              className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-800 rounded-lg text-slate-500 transition-colors shadow-sm"
                              title="View Analytics"
                            >
                              <BarChart2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* MORE ACTIONS DROPDOWN */}
                          <div className="relative" ref={moreMenuId === qr.id ? moreMenuRef : null}>
                            <button
                              onClick={() => { setMoreMenuId(moreMenuId === qr.id ? null : qr.id); setFolderMenuId(null); }}
                              className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors shadow-sm"
                              title="More actions"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {moreMenuId === qr.id && (
                              <div className="absolute right-0 bottom-full mb-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 py-1 animate-in fade-in duration-150">
                                {/* Edit */}
                                <button
                                  onClick={() => { openEditModal(qr); setMoreMenuId(null); }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                  <Pencil className="w-4 h-4 text-slate-400" /> Edit
                                </button>

                                {/* Favorite */}
                                <button
                                  onClick={() => { handleToggleFavorite(qr); setMoreMenuId(null); }}
                                  disabled={togglingFavId === qr.id}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                                >
                                  <Star className={`w-4 h-4 ${qr.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                                  {qr.isFavorite ? 'Unfavorite' : 'Favorite'}
                                </button>

                                {/* Status Toggle */}
                                <button
                                  onClick={() => { handleToggleActive(qr); setMoreMenuId(null); }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                  <Power className={`w-4 h-4 ${qr.isActive ? 'text-emerald-500' : 'text-amber-500'}`} />
                                  {qr.isActive ? 'Pause' : 'Activate'}
                                </button>

                                {/* Duplicate */}
                                <button
                                  onClick={() => { handleDuplicate(qr); setMoreMenuId(null); }}
                                  disabled={duplicatingId === qr.id}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                                >
                                  {duplicatingId === qr.id ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                                  Duplicate
                                </button>

                                {/* Move to Folder */}
                                {folders.length > 0 && (
                                  <>
                                    <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                                    <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Move to folder</div>
                                    <button
                                      onClick={() => { handleMoveToFolder(qr.id, null); setMoreMenuId(null); }}
                                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${!qr.folderId ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-200'}`}
                                    >
                                      <Archive className="w-3.5 h-3.5 text-slate-400" /> None
                                    </button>
                                    {folders.map(f => (
                                      <button
                                        key={f.id}
                                        onClick={() => { handleMoveToFolder(qr.id, f.id); setMoreMenuId(null); }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${qr.folderId === f.id ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-200'}`}
                                      >
                                        <FolderOpen className="w-3.5 h-3.5" style={{ color: f.color }} /> {f.name}
                                      </button>
                                    ))}
                                  </>
                                )}

                                {/* Delete */}
                                <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                                <button
                                  onClick={() => { setDeleteTarget(qr); setMoreMenuId(null); }}
                                  disabled={deletingId === qr.id}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                >
                                  {deletingId === qr.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </StaggeredItem>
                ))}
              </StaggeredGrid>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditTarget(null)} />
            <motion.div
              className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-lg p-6 space-y-5"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit QR Code</h2>
                <button onClick={() => setEditTarget(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target URL</label>
                  <input
                    type="url"
                    value={editForm.targetUrl}
                    onChange={(e) => setEditForm(f => ({ ...f, targetUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    placeholder="Optional notes..."
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                    <input
                      type="datetime-local"
                      value={editForm.expiresAt}
                      onChange={(e) => setEditForm(f => ({ ...f, expiresAt: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Scans</label>
                    <input
                      type="number"
                      value={editForm.maxScans}
                      onChange={(e) => setEditForm(f => ({ ...f, maxScans: e.target.value }))}
                      placeholder="Unlimited"
                      min="1"
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={editSaving || !editForm.title}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Save Changes
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
        title="Delete QR Code?"
        message={`"${deleteTarget?.title}" will be permanently deleted. Any printed codes will stop working.`}
        confirmText="Delete"
        loading={!!deletingId}
        variant="danger"
      />

      {/* Batch Delete Confirmation Modal */}
      <ConfirmModal
        open={batchDeleteOpen}
        onClose={() => setBatchDeleteOpen(false)}
        onConfirm={handleBatchDelete}
        title={`Delete ${selectedIds.size} QR Code(s)?`}
        message="All selected QR codes will be permanently deleted. Any printed codes will stop working."
        confirmText={`Delete ${selectedIds.size}`}
        loading={batchDeleting}
        variant="danger"
      />
    </AnimatedPage>
  );
};

export default MyQRCodesView;
