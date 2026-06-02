-- Geodaten für Umkreissuche in profiles

-- PostGIS aktivieren (auf Supabase meist schon aktiv)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Felder zur profiles-Tabelle hinzufügen
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plz     VARCHAR(10),
  ADD COLUMN IF NOT EXISTS lat     DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lng     DOUBLE PRECISION;

-- Räumlicher Index für Performance
CREATE INDEX IF NOT EXISTS profiles_lat_lng_idx
  ON profiles (lat, lng)
  WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- PostGIS-Index (geography-Typ, für ST_DWithin in Metern)
CREATE INDEX IF NOT EXISTS profiles_geo_idx
  ON profiles USING GIST (
    CAST(ST_MakePoint(lng, lat) AS geography)
  )
  WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- RPC-Funktion: User im Umkreis finden, sortiert nach Entfernung
-- Aufruf: supabase.rpc('find_users_nearby', { ref_lat, ref_lng, radius_km })
CREATE OR REPLACE FUNCTION find_users_nearby(
  ref_lat  DOUBLE PRECISION,
  ref_lng  DOUBLE PRECISION,
  radius_km DOUBLE PRECISION
)
RETURNS TABLE (
  id           UUID,
  name         TEXT,
  avatar_url   TEXT,
  location     TEXT,
  plz          VARCHAR,
  lat          DOUBLE PRECISION,
  lng          DOUBLE PRECISION,
  created_at   TIMESTAMPTZ,
  distance_km  DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    p.id,
    p.name,
    p.avatar_url,
    p.location,
    p.plz,
    p.lat,
    p.lng,
    p.created_at,
    ROUND(
      (ST_DistanceSphere(
        ST_MakePoint(p.lng, p.lat),
        ST_MakePoint(ref_lng, ref_lat)
      ) / 1000)::NUMERIC,
      1
    )::DOUBLE PRECISION AS distance_km
  FROM profiles p
  WHERE
    p.lat IS NOT NULL
    AND p.lng IS NOT NULL
    AND ST_DWithin(
      CAST(ST_MakePoint(p.lng, p.lat) AS geography),
      CAST(ST_MakePoint(ref_lng, ref_lat) AS geography),
      radius_km * 1000
    )
  ORDER BY distance_km ASC;
$$;
