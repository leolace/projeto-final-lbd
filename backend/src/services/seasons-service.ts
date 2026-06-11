import { query } from "../db/service.js";

export async function getSeasons() {
  const result = await query<{
    id: number;
    year: number;
  }>(`
    select id, year
    from seasons
    order by year desc
  `);

  return {
    seasons: result.rows
  };
}
