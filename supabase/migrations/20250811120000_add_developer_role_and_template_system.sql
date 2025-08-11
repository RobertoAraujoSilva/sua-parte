-- =====================================================
-- Sistema Ministerial - Developer Role and Template System
-- Migration to add developer functionality and template management
-- =====================================================

-- Step 1: Add developer and family_member roles to user_role enum
ALTER TYPE user_role ADD VALUE 'developer';
ALTER TYPE user_role ADD VALUE 'family_member';

-- Step 2: Add template-related columns to programas table
ALTER TABLE public.programas 
ADD COLUMN IF NOT EXISTS template_status_enum TEXT CHECK (template_status_enum IN ('pending', 'processing', 'template_ready', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS developer_processed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS developer_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS template_download_url TEXT,
ADD COLUMN IF NOT EXISTS template_metadata JSONB,
ADD COLUMN IF NOT EXISTS processing_notes TEXT,
ADD COLUMN IF NOT EXISTS jw_org_content TEXT,
ADD COLUMN IF NOT EXISTS parsed_meeting_parts JSONB,
ADD COLUMN IF NOT EXISTS arquivo TEXT; -- For template file names

-- Step 3: Create template_downloads table for tracking usage
CREATE TABLE IF NOT EXISTS public.template_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programa_id UUID REFERENCES public.programas(id) ON DELETE CASCADE NOT NULL,
  instructor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  downloaded_at TIMESTAMPTZ DEFAULT now(),
  template_version VARCHAR(20),
  download_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 4: Enable RLS on template_downloads table
ALTER TABLE public.template_downloads ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for template_downloads
CREATE POLICY "Users can view their own template downloads"
  ON public.template_downloads FOR SELECT
  USING (auth.uid() = instructor_user_id);

CREATE POLICY "Users can create their own template downloads"
  ON public.template_downloads FOR INSERT
  WITH CHECK (auth.uid() = instructor_user_id);

-- Step 6: Create RLS policies for developer access to templates
CREATE POLICY "Developers can manage all templates"
  ON public.programas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'developer'
    )
  );

-- Step 7: Allow instructors to view published templates
CREATE POLICY "Instructors can view published templates"
  ON public.programas FOR SELECT
  USING (
    template_status_enum = 'published' 
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'instrutor'
    )
  );

-- Step 8: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_programas_template_status ON public.programas(template_status_enum);
CREATE INDEX IF NOT EXISTS idx_programas_developer_user_id ON public.programas(developer_user_id);
CREATE INDEX IF NOT EXISTS idx_template_downloads_programa_id ON public.template_downloads(programa_id);
CREATE INDEX IF NOT EXISTS idx_template_downloads_instructor_user_id ON public.template_downloads(instructor_user_id);

-- Step 9: Add comments for documentation
COMMENT ON COLUMN public.programas.template_status_enum IS 'Status of template: pending, processing, template_ready, published, archived';
COMMENT ON COLUMN public.programas.developer_processed_at IS 'Timestamp when template was processed by developer';
COMMENT ON COLUMN public.programas.developer_user_id IS 'ID of developer who processed this template';
COMMENT ON COLUMN public.programas.template_download_url IS 'URL for downloading the Excel template';
COMMENT ON COLUMN public.programas.template_metadata IS 'Metadata about the template (parts count, timing, etc.)';
COMMENT ON COLUMN public.programas.processing_notes IS 'Notes from developer about template processing';
COMMENT ON COLUMN public.programas.jw_org_content IS 'Original JW.org apostila content';
COMMENT ON COLUMN public.programas.parsed_meeting_parts IS 'Extracted meeting parts from JW.org content';
COMMENT ON COLUMN public.programas.arquivo IS 'Template file name';

COMMENT ON TABLE public.template_downloads IS 'Tracks template downloads by instructors';

-- Step 10: Create function to get published templates for instructors
CREATE OR REPLACE FUNCTION get_published_templates()
RETURNS TABLE (
  id UUID,
  semana TEXT,
  data_inicio_semana DATE,
  template_status_enum TEXT,
  template_metadata JSONB,
  parsed_meeting_parts JSONB,
  developer_processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    COALESCE(p.template_metadata->>'semana', 'Semana não identificada') as semana,
    p.data_inicio_semana,
    p.template_status_enum,
    p.template_metadata,
    p.parsed_meeting_parts,
    p.developer_processed_at,
    p.created_at
  FROM public.programas p
  WHERE p.template_status_enum = 'published'
  ORDER BY p.data_inicio_semana DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create function to track template downloads
CREATE OR REPLACE FUNCTION track_template_download(
  template_id UUID,
  template_version TEXT DEFAULT '1.0'
) RETURNS UUID AS $$
DECLARE
  download_id UUID;
BEGIN
  INSERT INTO public.template_downloads (
    programa_id,
    instructor_user_id,
    template_version,
    download_metadata
  ) VALUES (
    template_id,
    auth.uid(),
    template_version,
    jsonb_build_object(
      'download_timestamp', now(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    )
  ) RETURNING id INTO download_id;
  
  RETURN download_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 12: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.template_downloads TO authenticated;
GRANT EXECUTE ON FUNCTION get_published_templates() TO authenticated;
GRANT EXECUTE ON FUNCTION track_template_download(UUID, TEXT) TO authenticated;

-- Step 13: Add trigger for automatic timestamp updates on template_downloads
CREATE TRIGGER update_template_downloads_updated_at
  BEFORE UPDATE ON public.template_downloads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Step 14: Update existing programs to have proper default values
UPDATE public.programas 
SET template_status_enum = NULL
WHERE template_status_enum IS NULL;

-- Step 15: Create view for developer dashboard statistics
CREATE OR REPLACE VIEW developer_template_stats AS
SELECT 
  COUNT(*) FILTER (WHERE template_status_enum = 'template_ready') as templates_ready,
  COUNT(*) FILTER (WHERE template_status_enum = 'published') as templates_published,
  COUNT(*) FILTER (WHERE template_status_enum = 'pending') as templates_pending,
  COUNT(DISTINCT td.instructor_user_id) as unique_instructors,
  COUNT(td.id) as total_downloads
FROM public.programas p
LEFT JOIN public.template_downloads td ON p.id = td.programa_id
WHERE p.template_status_enum IS NOT NULL;

-- Grant access to the view
GRANT SELECT ON developer_template_stats TO authenticated;

-- Step 16: Create RLS policy for the view
CREATE POLICY "Developers can view template statistics"
  ON developer_template_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'developer'
    )
  );

-- Step 17: Add helpful functions for template management
CREATE OR REPLACE FUNCTION publish_template(template_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.programas 
  SET 
    template_status_enum = 'published',
    updated_at = now()
  WHERE id = template_id
    AND template_status_enum = 'template_ready'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'developer'
    );
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION publish_template(UUID) TO authenticated;
