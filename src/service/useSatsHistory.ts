import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchAllSatsHistory, SatsHistoryEntry } from "./SatsHistoryService";

// Stale etter 5 min — trigger refresh med kun de siste N runs
// GC etter 1 time — tømmer cache helt, neste besøk gjør full fetch
const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 60 * 60 * 1000;

export const useSatsHistory = (): UseQueryResult<SatsHistoryEntry[], Error> =>
    useQuery({
        queryKey: ['satsHistory'],
        queryFn: fetchAllSatsHistory,
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        retry: 1,
    });
