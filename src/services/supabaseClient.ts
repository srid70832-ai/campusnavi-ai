import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://zpnzazuqprfhgaedgbaz.supabase.co';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbnphenVxcHJmaGdhZWRnYmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2ODMwNjQsImV4cCI6MjEwODI1OTA2NH0.vqBM07TCLYYYmgcTnjSK3mpZ-JFeMPNb8BOkcfe95vM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
