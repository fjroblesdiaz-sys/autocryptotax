import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fszodwdgyrrarqjvjkab.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzem9kd2RneXJyYXJxanZqa2FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MjQ2NzgsImV4cCI6MjA3NDEwMDY3OH0.ksBRVLU7e_13Z8M-zFcP8aOs2gd5NFn14XYCrz-lYkc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);