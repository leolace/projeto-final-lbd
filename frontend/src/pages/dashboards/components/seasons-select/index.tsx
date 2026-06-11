import { useCallback, useState } from "react";
import { useSeasons } from "../../hooks";
import { useDashboardStore } from "../../store";

export const SeasonsSelect = () => {
  const { isLoading, data } = useSeasons();
  const seasons = data?.seasons || [];
  const season = useDashboardStore((state) => state.season);
  const setSeason = useDashboardStore((state) => state.setSeason);

  const handleSelectSeason = useCallback((id: number) => {
    const selectedSeason = seasons.find((season) => season.id === id);
    if (!selectedSeason) return;

    setSeason(selectedSeason);
  }, [seasons, setSeason]);

  return (
    <div className="grid">
      <label
        className="text-sm font-medium uppercase tracking-wide text-gray-600"
        htmlFor="admin-dashboard-season"
      >
        Temporada
      </label>
      <select
        className="mt-2 h-10 min-w-48 rounded-md border border-gray-300 bg-white px-3 text-sm text-black outline-none transition focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        disabled={isLoading || seasons.length === 0}
        id="admin-dashboard-season"
        onChange={(event) => handleSelectSeason(Number(event.target.value))}
        value={season?.id}
      >
        {seasons.length === 0 ? <option value="">Sem temporadas</option> : null}
        {seasons.map((season) => (
          <option key={season.id} value={season.id}>
            {season.year}
          </option>
        ))}
      </select>
    </div>
  );
};
