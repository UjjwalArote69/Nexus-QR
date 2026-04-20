import API from './axios';


// ── Create QR Code (works for both anonymous and logged-in users) ──
export const generateQRCode = async (qrData) => {
    const response = await API.post('/qrcodes/create', qrData);
  return response.data;
};

// ── Create QR Code with file upload (images, PDF, video, MP3) ──
export const createQRWithFile = async (formData) => {
    const response = await API.post('/qrcodes/create-with-file', formData);
    return response.data;
};

// ── Fetch QR codes for the current user (paginated) ──
export const fetchMyQRCodes = async ({ page = 1, limit = 20 } = {}) => {
    const response = await API.get('/qrcodes/my-qrs', { params: { page, limit } });
    return response.data;
};

// ── Update a QR code ──
export const updateQRCode = async (id, data) => {
    const response = await API.put(`/qrcodes/${id}`, data);
    return response.data;
};

// ── Delete a QR code ──
export const deleteQRCode = async (id) => {
    const response = await API.delete(`/qrcodes/${id}`);
    return response.data;
};

// ── Duplicate a QR code ──
export const duplicateQRCode = async (id) => {
    const response = await API.post(`/qrcodes/${id}/duplicate`);
    return response.data;
};

// ── Toggle favorite ──
export const toggleFavorite = async (id) => {
    const response = await API.patch(`/qrcodes/${id}/favorite`);
    return response.data;
};

// ── Batch delete ──
export const batchDeleteQRCodes = async (ids) => {
    const response = await API.post('/qrcodes/batch-delete', { ids });
    return response.data;
};

// ── Claim anonymous QR codes after login/registration ──
// Transfers all QR codes created with the session token to the authenticated user.
export const claimAnonymousQRCodes = async (sessionToken) => {
    const response = await API.post('/qrcodes/claim', { sessionToken });
    return response.data;
};

export const fetchRecentScans = async () => {
    const response = await API.get('/qrcodes/recent-scans');
    return response.data;
};

// ── Archive/restore QR code ──
export const archiveQRCode = async (id) => {
    const response = await API.patch(`/qrcodes/${id}/archive`);
    return response.data;
};

// ── Bulk create QR codes ──
export const bulkCreateQRCodes = async (items) => {
    const response = await API.post('/qrcodes/bulk-create', { items });
    return response.data;
};

// ── Upload image (for vCard avatar, etc.) ──
export const uploadImage = async (formData) => {
    const response = await API.post('/qrcodes/upload-image', formData);
    return response.data;
};