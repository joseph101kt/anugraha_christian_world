"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/syncProductsFromSupabase.ts
require("dotenv/config");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const dotenv_1 = require("dotenv");
const node_fetch_1 = __importDefault(require("node-fetch"));
const supabaseClient_1 = require("../lib/supabaseClient");
(0, dotenv_1.config)({ path: path.resolve(process.cwd(), '.env.local') });
console.log('🧩 Starting syncProductsFromSupabase');
// --------------------
// Environment validation
// --------------------
try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');
    }
    console.log('✅ Environment variables validated');
}
catch (err) {
    console.error('❌ Environment validation failed:', err);
    process.exit(1);
}
// --------------------
// Paths
// --------------------
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'products.json');
const IMAGES_ROOT = path.join(process.cwd(), 'public', 'images');
console.log('📂 DATA_FILE_PATH:', DATA_FILE_PATH);
console.log('📂 IMAGES_ROOT:', IMAGES_ROOT);
// --------------------
// Helpers
// --------------------
async function ensureDir(dir) {
    try {
        await fs.mkdir(dir, { recursive: true });
    }
    catch (err) {
        console.error(`❌ Failed to ensure directory exists: ${dir}`, err);
        throw err;
    }
}
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
function filenameFromUrl(url) {
    try {
        return url.split('/').pop().split('?')[0];
    }
    catch (err) {
        console.error('❌ Failed to extract filename from URL:', url, err);
        throw err;
    }
}
async function downloadImage(imageUrl, slug) {
    console.log(`⬇️ Downloading image for "${slug}" → ${imageUrl}`);
    try {
        const response = await (0, node_fetch_1.default)(imageUrl);
        if (!response.ok) {
            console.error(`❌ Image download failed (${response.status})`, imageUrl);
            return null;
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        const fileName = filenameFromUrl(imageUrl);
        const productDir = path.join(IMAGES_ROOT, slug);
        await ensureDir(productDir);
        const localPath = path.join(productDir, fileName);
        await fs.writeFile(localPath, buffer);
        const publicPath = `/images/${slug}/${fileName}`;
        console.log(`✅ Image saved: ${publicPath}`);
        return publicPath;
    }
    catch (err) {
        console.error(`❌ Unexpected error downloading image for "${slug}"`, imageUrl, err);
        return null;
    }
}
// --------------------
// Main sync logic
// --------------------
async function syncProductsFromSupabase() {
    console.log('🔄 Fetching products from Supabase');
    const { data: remoteProducts, error } = await supabaseClient_1.supabase.from('products').select('*');
    if (error) {
        console.error('❌ Supabase query error:', error);
        process.exit(1);
    }
    if (!remoteProducts) {
        console.error('❌ Supabase returned null product list');
        process.exit(1);
    }
    console.log(`📦 Retrieved ${remoteProducts.length} product(s)`);
    let localProducts = [];
    try {
        if (await fileExists(DATA_FILE_PATH)) {
            console.log('📖 Reading local products.json');
            const raw = await fs.readFile(DATA_FILE_PATH, 'utf-8');
            localProducts = JSON.parse(raw);
            console.log(`📘 Loaded ${localProducts.length} local product(s)`);
        }
        else {
            console.warn('⚠️ products.json not found — starting fresh');
        }
    }
    catch (err) {
        console.error('❌ Failed to read or parse products.json', err);
        process.exit(1);
    }
    const localSlugs = new Set(localProducts.map(p => p.slug));
    let addedCount = 0;
    // --------------------
    // Sync missing products
    // --------------------
    for (const product of remoteProducts) {
        try {
            if (!product.slug) {
                console.warn('⚠️ Skipping product with missing slug:', product);
                continue;
            }
            if (localSlugs.has(product.slug)) {
                console.log(`⏭️ Already exists locally: ${product.slug}`);
                continue;
            }
            console.log(`➕ Adding missing product: ${product.slug}`);
            // Main image
            let localMainImage = null;
            if (product.main_image) {
                localMainImage = await downloadImage(product.main_image, product.slug);
            }
            else {
                console.warn(`⚠️ Product "${product.slug}" has no main_image`);
            }
            // Secondary images
            const localSecondaryImages = [];
            if (Array.isArray(product.secondary_images)) {
                for (const img of product.secondary_images) {
                    const localPath = await downloadImage(img, product.slug);
                    if (localPath)
                        localSecondaryImages.push(localPath);
                }
            }
            const localProduct = {
                ...product,
                id: product.slug,
                main_image: localMainImage,
                secondary_images: localSecondaryImages,
            };
            console.log('📌 Added product snapshot:', {
                slug: product.slug,
                name: product.name,
                price: product.price,
                main_image: localMainImage,
                secondary_images_count: localSecondaryImages.length,
            });
            localProducts.push(localProduct);
            addedCount++;
            console.log(`✅ Product synced: ${product.slug}`);
        }
        catch (err) {
            console.error(`❌ Fatal error while processing product "${product?.slug}"`, err);
        }
    }
    // --------------------
    // Write products.json
    // --------------------
    try {
        await ensureDir(path.dirname(DATA_FILE_PATH));
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(localProducts, null, 2), 'utf-8');
        console.log(`💾 products.json updated (${localProducts.length} total products)`);
    }
    catch (err) {
        console.error('❌ Failed to write products.json', err);
        process.exit(1);
    }
    console.log(`🎉 Sync complete — added ${addedCount} product(s)`);
}
// --------------------
syncProductsFromSupabase()
    .then(() => {
    console.log('🏁 Script finished cleanly');
})
    .catch(err => {
    console.error('❌ Unhandled script failure:', err);
    process.exit(1);
});
