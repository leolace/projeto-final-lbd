BEGIN;

DROP FUNCTION IF EXISTS sync_user_from_driver() CASCADE;
DROP FUNCTION IF EXISTS sync_user_from_constructor() CASCADE;
DROP FUNCTION IF EXISTS get_constructor_dashboard_stats(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_driver_dashboard_stats(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_driver_year_circuit_stats(TEXT) CASCADE;

DROP TABLE IF EXISTS
  users_log,
  users_admin,
  users_piloto,
  users_escuderia,
  users,
  lap_times,
  constructor_standings,
  driver_standings,
  country_languages,
  standings,
  results,
  qualifying,
  races,
  circuits,
  airports,
  cities,
  drivers,
  constructors,
  iso_language_codes,
  countries,
  status,
  airport_types,
  feature_codes,
  language_names,
  time_zones,
  continents,
  seasons
CASCADE;

COMMIT;
