"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
// migrateProducts.ts
require("dotenv/config");
var supabase_js_1 = require("@supabase/supabase-js");
var fs = require("fs/promises");
var path = require("path");
// Load .env.local explicitly (optional)
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: path.resolve(process.cwd(), '.env.local') });
// Initialize Supabase client
var supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
// Path to your local products.json
var DATA_FILE_PATH = path.join(process.cwd(), 'data', 'products.json');
function migrateProducts() {
    return __awaiter(this, void 0, void 0, function () {
        var fileData, products, transformedProducts, _a, data, error, err_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fs.readFile(DATA_FILE_PATH, 'utf-8')];
                case 1:
                    fileData = _c.sent();
                    products = JSON.parse(fileData);
                    transformedProducts = products.map(function (_a) {
                        var id = _a.id, reviews = _a.reviews, additional_info = _a.additional_info, secondary_images = _a.secondary_images, tags = _a.tags, rest = __rest(_a, ["id", "reviews", "additional_info", "secondary_images", "tags"]);
                        return (__assign(__assign({}, rest), { slug: id, reviews: reviews !== null && reviews !== void 0 ? reviews : [], additional_info: additional_info !== null && additional_info !== void 0 ? additional_info : [], secondary_images: secondary_images !== null && secondary_images !== void 0 ? secondary_images : [], tags: tags !== null && tags !== void 0 ? tags : [] }));
                    });
                    return [4 /*yield*/, supabase
                            .from('products')
                            .upsert(transformedProducts, { onConflict: 'slug' })
                            .select()];
                case 2:
                    _a = _c.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('❌ Supabase upsert error:', error);
                        process.exit(1);
                    }
                    else {
                        console.log("\u2705 Successfully migrated ".concat((_b = data === null || data === void 0 ? void 0 : data.length) !== null && _b !== void 0 ? _b : 0, " products."));
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _c.sent();
                    console.error('❌ Migration failed:', err_1);
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Run the migration
migrateProducts();
