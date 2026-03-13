-- Create the invoices bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload invoices"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'invoices');

-- Allow authenticated users to read
CREATE POLICY "Authenticated users can read invoices"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'invoices');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete invoices"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'invoices');
