// supabase.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://nclreaswclozgwjhmhgw.supabase.co";  // Replace with your actual Supabase URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jbHJlYXN3Y2xvemd3amhtaGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1Mzg0MjEsImV4cCI6MjA1NTExNDQyMX0._GnxD1ZgpITDkWuaDqvpgcLRgd7YF0PN_U80l0gFJ2I"; // Replace with your actual anon key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export { supabase };
