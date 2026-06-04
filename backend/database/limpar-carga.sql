BEGIN;

TRUNCATE TABLE
  constructor_standings,
  driver_standings,
  country_languages,
  standings,
  results,
  qualifying,
  lap_times,
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
RESTART IDENTITY CASCADE;

COMMIT;
