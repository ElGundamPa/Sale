import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PROCESSED_SALES_LIMIT } from "@/config/constants";
import { logger } from "@/lib/logger";
import type { Sale } from "@/types";

/** Shape returned by the Apps Script `doGet`. */
export interface SheetTeam {
  id: string;
  name: string;
  goal: number;
  total_real?: number;
  agents: Array<{ id: string; name: string; sales: number; teamId: string }>;
}
export interface SheetSale {
  agentName: string;
  entryDate: string;
  value: number;
  /** ISO string del Timestamp de Form Responses 1 (cuándo se envió el form). */
  submittedAt?: string | null;
}
export interface SheetPayload {
  teams: SheetTeam[];
  newSales: SheetSale[];
}

/** Si una venta tiene Timestamp dentro de esta ventana, dispara animación
 *  aunque sea el primer poll (cubre el caso "agrego venta y abro dashboard"). */
const SALE_FRESHNESS_MS = 10 * 60 * 1000;

interface State {
  data: SheetPayload | null;
  error: string | null;
  lastFetchedAt: number | null;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const saleId = (s: { agentName: string; entryDate: string; value: number }) =>
  `${norm(s.agentName)}|${s.entryDate}|${s.value}`;

export function useGoogleSheetData(opts: {
  pollingIntervalSeconds: number;
  enabled: boolean;
  onNewSale?: (sale: Sale) => void;
}) {
  const { pollingIntervalSeconds, enabled, onNewSale } = opts;
  const [state, setState] = useState<State>({
    data: null,
    error: null,
    lastFetchedAt: null,
  });

  const isFirstLoad = useRef(true);
  const processed = useRef<Set<string>>(new Set());
  const processedQueue = useRef<string[]>([]);
  const onNewSaleRef = useRef(onNewSale);
  onNewSaleRef.current = onNewSale;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const fetchOnce = async () => {
      try {
        const { data, error } = await supabase.functions.invoke<SheetPayload>(
          "google-sheets-proxy",
        );
        if (cancelled) return;
        if (error) throw new Error(error.message);
        if (!data) throw new Error("Empty payload");

        logger.info("sheet fetch", {
          teams: data.teams?.length ?? 0,
          newSales: data.newSales?.length ?? 0,
          firstLoad: isFirstLoad.current,
        });
        for (const sale of data.newSales ?? []) {
          if (!sale.agentName || !sale.value) continue;
          const id = saleId(sale);
          if (processed.current.has(id)) continue;
          processed.current.add(id);
          processedQueue.current.push(id);
          while (processedQueue.current.length > PROCESSED_SALES_LIMIT) {
            const oldest = processedQueue.current.shift();
            if (oldest) processed.current.delete(oldest);
          }

          // ¿Es una venta "fresca"? Sí si el Timestamp de Form Responses 1
          // (submittedAt) cae dentro de la ventana de frescura.
          const submittedMs = sale.submittedAt
            ? Date.parse(sale.submittedAt)
            : NaN;
          const isFresh =
            !isNaN(submittedMs) &&
            Date.now() - submittedMs < SALE_FRESHNESS_MS;

          // Disparamos animación si:
          //  (a) ya pasamos del primer poll (cualquier venta nueva en sesión activa), o
          //  (b) la venta es FRESCA (recién enviada por el formulario).
          const shouldFire = !isFirstLoad.current || isFresh;

          if (shouldFire) {
            logger.info("new sale detected", { id, isFresh, submittedAt: sale.submittedAt });
            onNewSaleRef.current?.({
              id,
              agentName: sale.agentName,
              entryDate: sale.entryDate,
              value: sale.value,
            });
          } else {
            logger.info("seed sale (no animation, stale + first load)", { id, submittedAt: sale.submittedAt });
          }
        }
        isFirstLoad.current = false;
        setState({ data, error: null, lastFetchedAt: Date.now() });
      } catch (err) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : String(err),
        }));
      }
    };

    fetchOnce();
    const id = window.setInterval(
      fetchOnce,
      Math.max(3, pollingIntervalSeconds) * 1000,
    );
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [enabled, pollingIntervalSeconds]);

  return state;
}
