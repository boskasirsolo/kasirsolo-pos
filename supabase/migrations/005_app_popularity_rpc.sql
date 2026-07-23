-- Function to get top 10 most popular apps by active license count
CREATE OR REPLACE FUNCTION get_app_popularity_top10()
RETURNS TABLE (
  app_id UUID,
  app_name TEXT,
  count BIGINT,
  percentage BIGINT
) AS $$
DECLARE
  total BIGINT;
BEGIN
  SELECT COUNT(*) INTO total
  FROM ksp_licenses
  WHERE status = 'active';

  RETURN QUERY
  SELECT
    a.id AS app_id,
    a.name AS app_name,
    COUNT(l.id)::BIGINT AS count,
    ROUND((COUNT(l.id)::NUMERIC / NULLIF(total, 0)) * 100)::BIGINT AS percentage
  FROM ksp_apps a
  INNER JOIN ksp_licenses l ON l.app_id = a.id
  WHERE l.status = 'active'
    AND a.is_active = true
  GROUP BY a.id, a.name
  ORDER BY count DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users and anon (RLS handles access control)
GRANT EXECUTE ON FUNCTION get_app_popularity_top10() TO authenticated;
GRANT EXECUTE ON FUNCTION get_app_popularity_top10() TO anon;
