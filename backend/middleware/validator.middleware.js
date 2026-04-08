import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (e) {
        return res.status(400).json({ errors: e.errors });
    }
};

// ── Auth Schemas ──

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email format"),
        password: z.string().min(8, "Password must be at least 8 characters"),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(1, "Password is required"),
    }),
});

// ── QR Code Schemas ──

export const createQRSchema = z.object({
    body: z.object({
        qrType: z.string().min(1, "QR type is required"),
        title: z.string().max(255).optional(),
        targetUrl: z.string().url("Invalid URL").optional().or(z.literal('')).or(z.literal(undefined)),
        content: z.any().optional(),
        description: z.string().max(500).optional(),
        expiresAt: z.string().datetime().optional().nullable(),
        maxScans: z.number().int().positive().optional().nullable(),
        customSlug: z.string().regex(/^[a-zA-Z0-9_-]{3,50}$/, "Slug must be 3-50 chars (letters, numbers, hyphens, underscores)").optional(),
    }),
});

export const updateQRSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid QR code ID"),
    }),
    body: z.object({
        title: z.string().max(255).optional(),
        targetUrl: z.string().optional(),
        isActive: z.boolean().optional(),
        description: z.string().max(500).optional().nullable(),
        expiresAt: z.string().datetime().optional().nullable(),
        maxScans: z.number().int().positive().optional().nullable(),
        content: z.any().optional(),
        folderId: z.string().uuid().optional().nullable(),
    }),
});

export const batchDeleteSchema = z.object({
    body: z.object({
        ids: z.array(z.string().uuid("Invalid QR code ID")).min(1, "At least one ID is required"),
    }),
});

// ── Folder Schemas ──

export const createFolderSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Folder name is required").max(100),
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional(),
    }),
});

export const updateFolderSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid folder ID"),
    }),
    body: z.object({
        name: z.string().min(1).max(100).optional(),
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional(),
    }),
});

// ── Template Schemas ──

export const createTemplateSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Template name is required").max(100),
        fgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional(),
        bgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional(),
        isDefault: z.boolean().optional(),
    }),
});

export const updateTemplateSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid template ID"),
    }),
    body: z.object({
        name: z.string().min(1).max(100).optional(),
        fgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional(),
        bgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional(),
        isDefault: z.boolean().optional(),
    }),
});