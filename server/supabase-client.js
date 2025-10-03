// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseClient = createClient(
  "https://qatnezrhybhpcygdiehb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdG5lenJoeWJocGN5Z2RpZWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMjIxNDcsImV4cCI6MjA2Mjg5ODE0N30.FvetjbiajQ_tJ5P5JE9b9nnwIQ9oo3ZTdq-QLUIT77E"
);

export default supabaseClient;
