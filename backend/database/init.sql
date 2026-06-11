CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- =========================================================
-- TABELAS BÁSICAS / DOMÍNIO
-- =========================================================

CREATE TABLE IF NOT EXISTS seasons (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    year INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS continents (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    code VARCHAR(2) NOT NULL UNIQUE,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS countries (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    code VARCHAR(2) UNIQUE NOT NULL,
    name TEXT UNIQUE NOT NULL,
    wikipedia_link TEXT NOT NULL UNIQUE,
    keywords TEXT,
    continent_id INTEGER,

    CONSTRAINT fk_countries_continent
        FOREIGN KEY (continent_id)
        REFERENCES continents(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS time_zones (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL UNIQUE,
    gmt_offset DOUBLE PRECISION,
    dst_offset DOUBLE PRECISION,
    raw_offset DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS language_names (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS iso_language_codes (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    iso_639_3 TEXT UNIQUE,
    iso_639_2 TEXT UNIQUE,
    iso_639_1 TEXT UNIQUE,
    language_id INTEGER UNIQUE,

    CONSTRAINT fk_iso_language_codes_language
        FOREIGN KEY (language_id)
        REFERENCES language_names(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS feature_codes (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    feature_class TEXT NOT NULL,
    feature_code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    CONSTRAINT uq_feature_codes_class_code UNIQUE (feature_class, feature_code)
);

CREATE TABLE IF NOT EXISTS airport_types (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    type TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS status (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    status TEXT NOT NULL UNIQUE
);

-- =========================================================
-- CIDADES / AEROPORTOS
-- =========================================================

CREATE TABLE IF NOT EXISTS cities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    ascii_name TEXT NOT NULL,
    alternate_names TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    feature_code_id INTEGER,
    country_id INTEGER,
    time_zone_id INTEGER,
    cc2 TEXT,
    admin1_code TEXT,
    admin2_code TEXT,
    admin3_code TEXT,
    admin4_code TEXT,
    population BIGINT,
    elevation DOUBLE PRECISION,
    dem TEXT,
    modification_date DATE NOT NULL,

    CONSTRAINT fk_cities_feature_code
        FOREIGN KEY (feature_code_id)
        REFERENCES feature_codes(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_cities_country
        FOREIGN KEY (country_id)
        REFERENCES countries(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_cities_time_zone
        FOREIGN KEY (time_zone_id)
        REFERENCES time_zones(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS airports (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ident VARCHAR(10) NOT NULL UNIQUE,
    airport_type_id INTEGER,
    name TEXT,
    latitude_deg DOUBLE PRECISION,
    longitude_deg DOUBLE PRECISION,
    elevation_ft DOUBLE PRECISION,
    city_id TEXT,
    scheduled_service BOOLEAN,
    icao_code TEXT,
    iata_code TEXT,
    gps_code TEXT,
    local_code TEXT,
    home_link TEXT,
    wikipedia_link TEXT,
    keywords TEXT,

    CONSTRAINT fk_airports_airport_type
        FOREIGN KEY (airport_type_id)
        REFERENCES airport_types(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_airports_city
        FOREIGN KEY (city_id)
        REFERENCES cities(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- =========================================================
-- F1: ENTIDADES PRINCIPAIS
-- =========================================================

CREATE TABLE IF NOT EXISTS circuits (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    circuit_ref VARCHAR(14) UNIQUE,
    name VARCHAR(44) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    long DOUBLE PRECISION NOT NULL,
    city_id TEXT,
    wikipedia_url TEXT,

    CONSTRAINT fk_circuits_city
        FOREIGN KEY (city_id)
        REFERENCES cities(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS constructors (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    constructor_ref VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(25) NOT NULL,
    nationality VARCHAR(13) NOT NULL,
    country_id INTEGER,
    wikipedia_url TEXT,

    CONSTRAINT fk_constructors_country
        FOREIGN KEY (country_id)
        REFERENCES countries(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    driver_ref VARCHAR(18) NOT NULL UNIQUE,
    given_name VARCHAR(17) NOT NULL,
    family_name VARCHAR(23) NOT NULL,
    nationality VARCHAR(15) NOT NULL,
    date_of_birth DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS races (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    race_ref VARCHAR(7) NOT NULL UNIQUE,
    season_id INTEGER NOT NULL,
    round INTEGER NOT NULL,
    race_name TEXT NOT NULL,
    race_date DATE NOT NULL,
    race_time TIME,
    circuit_id INTEGER NOT NULL,

    CONSTRAINT fk_races_season
        FOREIGN KEY (season_id)
        REFERENCES seasons(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_races_circuit
        FOREIGN KEY (circuit_id)
        REFERENCES circuits(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS qualifying (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    race_id BIGINT NOT NULL,
    driver_id INTEGER NOT NULL,
    constructor_id INTEGER NOT NULL,
    position INTEGER NOT NULL,
    q1 INTERVAL,
    q2 INTERVAL,
    q3 INTERVAL,

    CONSTRAINT fk_qualifying_race
        FOREIGN KEY (race_id)
        REFERENCES races(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_qualifying_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_qualifying_constructor
        FOREIGN KEY (constructor_id)
        REFERENCES constructors(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS results (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    race_id BIGINT NOT NULL,
    driver_id INTEGER NOT NULL,
    constructor_id INTEGER NOT NULL,
    grid INTEGER NOT NULL,
    position INTEGER NOT NULL,
    position_order INTEGER NOT NULL,
    points DOUBLE PRECISION NOT NULL,
    laps NUMERIC(5,1) NOT NULL,
    status_id INTEGER,

    CONSTRAINT fk_results_race
        FOREIGN KEY (race_id)
        REFERENCES races(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_results_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_results_constructor
        FOREIGN KEY (constructor_id)
        REFERENCES constructors(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_results_status
        FOREIGN KEY (status_id)
        REFERENCES status(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- =========================================================
-- STANDINGS
-- =========================================================

CREATE TABLE IF NOT EXISTS standings (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    season_id INTEGER NOT NULL,
    round INTEGER NOT NULL,
    position INTEGER,
    points DOUBLE PRECISION NOT NULL,
    wins INTEGER NOT NULL,

    CONSTRAINT fk_standings_season
        FOREIGN KEY (season_id)
        REFERENCES seasons(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS driver_standings (
    standing_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    PRIMARY KEY (standing_id, driver_id),

    CONSTRAINT fk_driver_standings_standing
        FOREIGN KEY (standing_id)
        REFERENCES standings(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_driver_standings_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS constructor_standings (
    standing_id INTEGER NOT NULL,
    constructor_id INTEGER NOT NULL,
    PRIMARY KEY (standing_id, constructor_id),

    CONSTRAINT fk_constructor_standings_standing
        FOREIGN KEY (standing_id)
        REFERENCES standings(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_constructor_standings_constructor
        FOREIGN KEY (constructor_id)
        REFERENCES constructors(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================================
-- RELACIONAMENTOS AUXILIARES
-- =========================================================

CREATE TABLE IF NOT EXISTS country_languages (
    country_id INTEGER NOT NULL,
    language_id INTEGER NOT NULL,
    PRIMARY KEY (country_id, language_id),

    CONSTRAINT fk_country_languages_country
        FOREIGN KEY (country_id)
        REFERENCES countries(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_country_languages_language
        FOREIGN KEY (language_id)
        REFERENCES language_names(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================================
-- ÍNDICES ÚTEIS
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_cities_country_id ON cities(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_feature_code_id ON cities(feature_code_id);
CREATE INDEX IF NOT EXISTS idx_cities_time_zone_id ON cities(time_zone_id);

CREATE INDEX IF NOT EXISTS idx_airports_city_id ON airports(city_id);
CREATE INDEX IF NOT EXISTS idx_airports_airport_type_id ON airports(airport_type_id);

CREATE INDEX IF NOT EXISTS idx_circuits_city_id ON circuits(city_id);
CREATE INDEX IF NOT EXISTS idx_constructors_country_id ON constructors(country_id);

CREATE INDEX IF NOT EXISTS idx_races_season_id ON races(season_id);
CREATE INDEX IF NOT EXISTS idx_races_circuit_id ON races(circuit_id);

CREATE INDEX IF NOT EXISTS idx_qualifying_race_id ON qualifying(race_id);
CREATE INDEX IF NOT EXISTS idx_qualifying_driver_id ON qualifying(driver_id);
CREATE INDEX IF NOT EXISTS idx_qualifying_constructor_id ON qualifying(constructor_id);

CREATE INDEX IF NOT EXISTS idx_results_race_id ON results(race_id);
CREATE INDEX IF NOT EXISTS idx_results_driver_id ON results(driver_id);
CREATE INDEX IF NOT EXISTS idx_results_constructor_id ON results(constructor_id);
CREATE INDEX IF NOT EXISTS idx_results_status_id ON results(status_id);

CREATE INDEX IF NOT EXISTS idx_standings_season_id ON standings(season_id);

COMMIT;

BEGIN;

-- =========================================================
-- TABELA LAP TIMES PARA O EXERCÍCIO 6
-- =========================================================

CREATE TABLE IF NOT EXISTS lap_times (
    race_id   BIGINT  NOT NULL,
    driver_id INTEGER NOT NULL,
    lap       INTEGER NOT NULL,
    position  INTEGER,
    time      INTERVAL,
    milliseconds INTEGER,
    PRIMARY KEY (race_id, driver_id, lap),
    CONSTRAINT fk_lap_times_race   FOREIGN KEY (race_id)
        REFERENCES races(id)   ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_lap_times_driver FOREIGN KEY (driver_id)
        REFERENCES drivers(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

COMMIT;

BEGIN;

-- =========================================================
-- CRIAÇÃO DAS TABELAS DA APLICAÇÃO
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    userId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    login TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('Admin', 'Escuderia', 'Piloto')),
    idOriginal TEXT,

    name TEXT NOT NULL,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tipo, idOriginal)
);

CREATE TABLE IF NOT EXISTS users_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID NOT NULL UNIQUE,

    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users_piloto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID NOT NULL UNIQUE,

    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users_escuderia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID NOT NULL UNIQUE,

    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION sync_user_from_driver()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO users (
        login,
        password,
        tipo,
        idOriginal,
        name,
        updatedAt
    )
    VALUES (
        NEW.driver_ref || '_d',
        crypt(NEW.driver_ref, gen_salt('bf')),
        'Piloto',
        NEW.driver_ref,
        CONCAT_WS(' ', NEW.given_name, NEW.family_name),
        NOW()
    )
    ON CONFLICT (tipo, idOriginal) DO UPDATE
    SET login = EXCLUDED.login,
        password = EXCLUDED.password,
        name = EXCLUDED.name,
        updatedAt = NOW();

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION sync_user_from_constructor()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO users (
        login,
        password,
        tipo,
        idOriginal,
        name,
        updatedAt
    )
    VALUES (
        NEW.constructor_ref || '_c',
        crypt(NEW.constructor_ref, gen_salt('bf')),
        'Escuderia',
        NEW.constructor_ref,
        NEW.name,
        NOW()
    )
    ON CONFLICT (tipo, idOriginal) DO UPDATE
    SET login = EXCLUDED.login,
        password = EXCLUDED.password,
        name = EXCLUDED.name,
        updatedAt = NOW();

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_user_from_driver
AFTER INSERT OR UPDATE ON drivers
FOR EACH ROW
EXECUTE FUNCTION sync_user_from_driver();

CREATE TRIGGER trg_sync_user_from_constructor
AFTER INSERT OR UPDATE ON constructors
FOR EACH ROW
EXECUTE FUNCTION sync_user_from_constructor();

CREATE TABLE IF NOT EXISTS users_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    userId UUID NOT NULL,
    action TEXT NOT NULL,
    actionTimestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,

    FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE INDEX IF NOT EXISTS idx_users_log_user
ON users_log(userId);

COMMIT;
