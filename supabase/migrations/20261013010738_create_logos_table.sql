-- Create logos table
CREATE TABLE public.logos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    image_url text NOT NULL,
    uploader_uid uuid NOT NULL,
    uploader_name text NOT NULL,
    uploader_avatar text,
    uploader_email text NOT NULL,
    votes text[] DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.logos ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read" ON public.logos FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON public.logos FOR INSERT WITH CHECK (auth.uid() = uploader_uid);
CREATE POLICY "Vote update" ON public.logos FOR UPDATE USING (auth.role() = 'authenticated');

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.logos;

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

-- Storage policies
CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Auth upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');