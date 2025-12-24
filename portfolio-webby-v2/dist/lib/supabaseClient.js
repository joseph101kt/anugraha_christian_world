"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
exports.supabase = (0, supabase_js_1.createClient)("https://hrghmxifjkbkhurxmzhy.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZ2hteGlmamtia2h1cnhtemh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNDY4NzAsImV4cCI6MjA3MDkyMjg3MH0.yFtCWcJMHDdgwmiCLANBeJfgEIJCDYG7tTgHavDbTEg");
