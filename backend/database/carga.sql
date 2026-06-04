BEGIN;

-- =========================================================
-- CARGA DE DADOS BÁSICOS
-- =========================================================

-- TABELAS BÁSICAS / DOMÍNIO

\copy seasons (id, year) FROM 'csvs/seasons.csv' WITH (FORMAT csv, HEADER true);

\copy continents (id, code, name) FROM 'csvs/continents.csv' WITH (FORMAT csv, HEADER true);

\copy time_zones (id, name, gmt_offset, dst_offset, raw_offset) FROM 'csvs/time_zones.csv' WITH (FORMAT csv, HEADER true);

\copy language_names (id, name) FROM 'csvs/language_names.csv' WITH (FORMAT csv, HEADER true);

\copy feature_codes (id, feature_class, feature_code, name, description) FROM 'csvs/feature_codes.csv' WITH (FORMAT csv, HEADER true);

\copy airport_types (id, type) FROM 'csvs/airport_types.csv' WITH (FORMAT csv, HEADER true);

\copy status (id, status) FROM 'csvs/status.csv' WITH (FORMAT csv, HEADER true);

\copy countries (id, code, name, wikipedia_link, keywords, continent_id) FROM 'csvs/countries.csv' WITH (FORMAT csv, HEADER true);

\copy iso_language_codes (id, iso_639_3, iso_639_2, iso_639_1, language_id) FROM 'csvs/iso_language_codes.csv' WITH (FORMAT csv, HEADER true);

-- CIDADES / AEROPORTOS

\copy cities (id, name, ascii_name, alternate_names, latitude, longitude, feature_code_id, country_id, time_zone_id, cc2, admin1_code, admin2_code, admin3_code, admin4_code, population, elevation, dem, modification_date) FROM 'csvs/cities.csv' WITH (FORMAT csv, HEADER true);

\copy airports (id, ident, airport_type_id, name, latitude_deg, longitude_deg, elevation_ft, city_id, scheduled_service, icao_code, iata_code, gps_code, local_code, home_link, wikipedia_link, keywords) FROM 'csvs/airports.csv' WITH (FORMAT csv, HEADER true);

-- F1: ENTIDADES PRINCIPAIS

\copy circuits (id, circuit_ref, name, lat, long, city_id, wikipedia_url) FROM 'csvs/circuits.csv' WITH (FORMAT csv, HEADER true);

\copy constructors (id, constructor_ref, name, nationality, country_id, wikipedia_url) FROM 'csvs/constructors.csv' WITH (FORMAT csv, HEADER true);

\copy drivers (id, driver_ref, given_name, family_name, nationality, date_of_birth) FROM 'csvs/drivers.csv' WITH (FORMAT csv, HEADER true);

\copy races (id, race_ref, season_id, round, race_name, race_date, race_time, circuit_id) FROM 'csvs/races.csv' WITH (FORMAT csv, HEADER true);

\copy qualifying (id, race_id, driver_id, constructor_id, position, q1, q2, q3) FROM 'csvs/qualifying.csv' WITH (FORMAT csv, HEADER true);

\copy results (id, race_id, driver_id, constructor_id, grid, position, position_order, points, laps, status_id) FROM 'csvs/results.csv' WITH (FORMAT csv, HEADER true);

-- STANDINGS

\copy standings (id, season_id, round, position, points, wins) FROM 'csvs/standings.csv' WITH (FORMAT csv, HEADER true);

\copy driver_standings (standing_id, driver_id) FROM 'csvs/driver_standings.csv' WITH (FORMAT csv, HEADER true);

\copy constructor_standings (standing_id, constructor_id) FROM 'csvs/constructor_standings.csv' WITH (FORMAT csv, HEADER true);

-- RELACIONAMENTOS AUXILIARES

\copy country_languages (country_id, language_id) FROM 'csvs/country_languages.csv' WITH (FORMAT csv, HEADER true);

COMMIT;

BEGIN;

-- =========================================================
-- AJUSTE DAS SEQUENCES DAS COLUNAS IDENTITY
-- =========================================================

SELECT setval(pg_get_serial_sequence('seasons', 'id'), COALESCE((SELECT MAX(id) FROM seasons), 1), true);
SELECT setval(pg_get_serial_sequence('continents', 'id'), COALESCE((SELECT MAX(id) FROM continents), 1), true);
SELECT setval(pg_get_serial_sequence('countries', 'id'), COALESCE((SELECT MAX(id) FROM countries), 1), true);
SELECT setval(pg_get_serial_sequence('time_zones', 'id'), COALESCE((SELECT MAX(id) FROM time_zones), 1), true);
SELECT setval(pg_get_serial_sequence('language_names', 'id'), COALESCE((SELECT MAX(id) FROM language_names), 1), true);
SELECT setval(pg_get_serial_sequence('iso_language_codes', 'id'), COALESCE((SELECT MAX(id) FROM iso_language_codes), 1), true);
SELECT setval(pg_get_serial_sequence('feature_codes', 'id'), COALESCE((SELECT MAX(id) FROM feature_codes), 1), true);
SELECT setval(pg_get_serial_sequence('airport_types', 'id'), COALESCE((SELECT MAX(id) FROM airport_types), 1), true);
SELECT setval(pg_get_serial_sequence('status', 'id'), COALESCE((SELECT MAX(id) FROM status), 1), true);
SELECT setval(pg_get_serial_sequence('airports', 'id'), COALESCE((SELECT MAX(id) FROM airports), 1), true);
SELECT setval(pg_get_serial_sequence('circuits', 'id'), COALESCE((SELECT MAX(id) FROM circuits), 1), true);
SELECT setval(pg_get_serial_sequence('constructors', 'id'), COALESCE((SELECT MAX(id) FROM constructors), 1), true);
SELECT setval(pg_get_serial_sequence('drivers', 'id'), COALESCE((SELECT MAX(id) FROM drivers), 1), true);
SELECT setval(pg_get_serial_sequence('races', 'id'), COALESCE((SELECT MAX(id) FROM races), 1), true);
SELECT setval(pg_get_serial_sequence('qualifying', 'id'), COALESCE((SELECT MAX(id) FROM qualifying), 1), true);
SELECT setval(pg_get_serial_sequence('results', 'id'), COALESCE((SELECT MAX(id) FROM results), 1), true);
SELECT setval(pg_get_serial_sequence('standings', 'id'), COALESCE((SELECT MAX(id) FROM standings), 1), true);


-- =========================================================
-- NORMALIZAÇÃO, DEDUPLICAÇÃO E AJUSTE DE VÍNCULO DOS DADOS
-- =========================================================

-- Parte 1: Normalização da nacionalidade dos países 

-- 1. Adicionando coluna nationality em countries
ALTER TABLE countries
ADD COLUMN IF NOT EXISTS nationality VARCHAR(255);

-- 2. Preencheendo countries.nationality a partir dos gentílicos
UPDATE countries SET nationality = 'American'       WHERE name = 'United States';
UPDATE countries SET nationality = 'Argentine'      WHERE name = 'Argentina';
UPDATE countries SET nationality = 'Australian'     WHERE name = 'Australia';
UPDATE countries SET nationality = 'Austrian'       WHERE name = 'Austria';
UPDATE countries SET nationality = 'Belgian'        WHERE name = 'Belgium';
UPDATE countries SET nationality = 'Brazilian'      WHERE name = 'Brazil';
UPDATE countries SET nationality = 'British'        WHERE name = 'United Kingdom';
UPDATE countries SET nationality = 'Canadian'       WHERE name = 'Canada';
UPDATE countries SET nationality = 'Chilean'        WHERE name = 'Chile';
UPDATE countries SET nationality = 'Chinese'        WHERE name = 'China';
UPDATE countries SET nationality = 'Colombian'      WHERE name = 'Colombia';
UPDATE countries SET nationality = 'Danish'         WHERE name = 'Denmark';
UPDATE countries SET nationality = 'Dutch'          WHERE name = 'Netherlands';
UPDATE countries SET nationality = 'Finnish'        WHERE name = 'Finland';
UPDATE countries SET nationality = 'French'         WHERE name = 'France';
UPDATE countries SET nationality = 'German'         WHERE name = 'Germany';
UPDATE countries SET nationality = 'Hungarian'      WHERE name = 'Hungary';
UPDATE countries SET nationality = 'Indian'         WHERE name = 'India';
UPDATE countries SET nationality = 'Indonesian'     WHERE name = 'Indonesia';
UPDATE countries SET nationality = 'Irish'          WHERE name = 'Ireland';
UPDATE countries SET nationality = 'Italian'        WHERE name = 'Italy';
UPDATE countries SET nationality = 'Japanese'       WHERE name = 'Japan';
UPDATE countries SET nationality = 'Malaysian'      WHERE name = 'Malaysia';
UPDATE countries SET nationality = 'Mexican'        WHERE name = 'Mexico';
UPDATE countries SET nationality = 'Monegasque'     WHERE name = 'Monaco';
UPDATE countries SET nationality = 'New Zealander'  WHERE name = 'New Zealand';
UPDATE countries SET nationality = 'Polish'         WHERE name = 'Poland';
UPDATE countries SET nationality = 'Portuguese'     WHERE name = 'Portugal';
UPDATE countries SET nationality = 'Rhodesian'      WHERE name = 'Zimbabwe';
UPDATE countries SET nationality = 'Russian'        WHERE name = 'Russia';
UPDATE countries SET nationality = 'South African'  WHERE name = 'South Africa';
UPDATE countries SET nationality = 'Spanish'        WHERE name = 'Spain';
UPDATE countries SET nationality = 'Swedish'        WHERE name = 'Sweden';
UPDATE countries SET nationality = 'Swiss'          WHERE name = 'Switzerland';
UPDATE countries SET nationality = 'Thai'           WHERE name = 'Thailand';
UPDATE countries SET nationality = 'Uruguayan'      WHERE name = 'Uruguay';
UPDATE countries SET nationality = 'Venezuelan'     WHERE name = 'Venezuela';

-- 3. Corrigindo casos faltantes identificados manualmente
UPDATE countries
SET nationality = 'Liechtensteiner'
WHERE name = 'Liechtenstein';

UPDATE countries
SET nationality = 'Hong Kong'
WHERE name = 'Hong Kong';

-- 4. Adicionando colunas de referência para countries
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS country_id INTEGER;

ALTER TABLE constructors
ADD COLUMN IF NOT EXISTS country_id INTEGER;

-- 5. Preenchendo referências para countries
UPDATE drivers d
SET country_id = c.id
FROM countries c
WHERE d.nationality = c.nationality;

UPDATE constructors ct
SET country_id = c.id
FROM countries c
WHERE ct.nationality = c.nationality;

-- 6. Reforçando preenchimento após correções manuais
UPDATE drivers d
SET country_id = c.id
FROM countries c
WHERE d.nationality = c.nationality
  AND d.country_id IS NULL;

UPDATE constructors ct
SET country_id = c.id
FROM countries c
WHERE ct.nationality = c.nationality
  AND ct.country_id IS NULL;

-- 7. Para garantir integridade referencial
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_drivers_country'
    ) THEN
        ALTER TABLE drivers
        ADD CONSTRAINT fk_drivers_country
        FOREIGN KEY (country_id) REFERENCES countries(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_constructors_country'
    ) THEN
        ALTER TABLE constructors
        ADD CONSTRAINT fk_constructors_country
        FOREIGN KEY (country_id) REFERENCES countries(id);
    END IF;
END $$;


-- Parte 2: Deduplicação da tabela cities

-- Regra adotada: manter o menor id por grupo de equivalência
-- definido por nome padronizado e país

CREATE TEMP TABLE city_merge_map AS
SELECT DISTINCT
    c.id AS old_id,
    MIN(c.id) OVER (
        PARTITION BY lower(trim(c.name)), c.country_id
    ) AS new_id
FROM cities c;

-- 1. Atualizando referências em airports
UPDATE airports a
SET city_id = m.new_id
FROM city_merge_map m
WHERE a.city_id = m.old_id
  AND m.old_id <> m.new_id;

-- 2. Atualizando referências em circuits
UPDATE circuits c
SET city_id = m.new_id
FROM city_merge_map m
WHERE c.city_id = m.old_id
  AND m.old_id <> m.new_id;

-- 3. Removendo duplicatas da tabela cities
DELETE FROM cities c
USING city_merge_map m
WHERE c.id = m.old_id
  AND m.old_id <> m.new_id;

COMMIT;