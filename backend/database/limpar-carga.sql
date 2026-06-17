BEGIN;

-- Remove apenas os dados carregados nas tabelas de domínio e de Fórmula 1,
-- preservando a estrutura, funções, triggers e tabelas de usuários da aplicação.
-- O RESTART IDENTITY reinicia as sequências para permitir uma nova carga limpa.
-- O CASCADE resolve dependências de chaves estrangeiras entre as tabelas listadas.
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
