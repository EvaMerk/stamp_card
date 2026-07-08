/**
 * Reine Punchcard-Mathematik — spiegelt exakt die SQL-View `goal_progress`
 * (supabase/migrations/0002_goal_progress_view.sql).
 *
 * Punchcards werden nicht gespeichert: Kartenanzahl, aktive Karte und
 * Rest-Stempel sind reine Funktionen aus `target_count`, `card_size` und der
 * Anzahl vorhandener Stempel.
 *
 * Konventionen:
 * - `target` > 0 und `size` > 0 (DB-Constraints); die Funktionen verhalten
 *   sich bei ungültigen Werten trotzdem defensiv (kein NaN/Infinity/-1).
 * - Karten- und Slot-Indizes sind 0-basiert.
 * - Die letzte Karte kann kleiner sein, wenn `target` nicht durch `size`
 *   teilbar ist (z.B. 104/10 → 11 Karten, letzte mit 4 Feldern).
 */

/**
 * Gesamtzahl der Karten: ceil(target / size).
 * SQL: `ceil(target_count::numeric / card_size)::integer`
 */
export function totalCards(target: number, size: number): number {
  if (!Number.isFinite(target) || !Number.isFinite(size) || target <= 0 || size <= 0) {
    return 0;
  }
  return Math.ceil(target / size);
}

/**
 * Index der aktiven Karte: die nächste unvollständige Karte, gedeckelt auf
 * die letzte Karte (bleibt auch bei vollem Ziel auf der letzten Karte stehen).
 * SQL: `least(floor(count(s)::numeric / card_size), total_cards - 1)::integer`
 */
export function activeCardIndex(
  stampCount: number,
  target: number,
  size: number,
): number {
  const cards = totalCards(target, size);
  if (cards === 0) return 0;
  const safeCount = Math.max(0, Math.floor(stampCount));
  return Math.min(Math.floor(safeCount / size), cards - 1);
}

/**
 * Anzahl der Felder auf einer Karte. Alle Karten haben `size` Felder, nur die
 * letzte Karte kann kleiner sein (Rest von `target / size`).
 * Für Indizes außerhalb von [0, totalCards) → 0.
 */
export function slotsForCard(
  cardIndex: number,
  target: number,
  size: number,
): number {
  const cards = totalCards(target, size);
  if (cards === 0 || cardIndex < 0 || cardIndex >= cards) return 0;
  if (cardIndex < cards - 1) return size;
  const remainder = target % size;
  return remainder === 0 ? size : remainder;
}

/**
 * Verbleibende Stempel bis zum Ziel, nie negativ.
 * SQL: `greatest(target_count - count(s), 0)::integer`
 */
export function remainingCount(target: number, stampCount: number): number {
  if (!Number.isFinite(target) || target <= 0) return 0;
  return Math.max(target - Math.max(0, Math.floor(stampCount)), 0);
}

/**
 * Erstes freies Feld einer Karte (Punchcard-Mentalmodell: es wird sequenziell
 * gestempelt, nur das nächste freie Feld ist tappbar).
 *
 * @param stampedSlots bereits gestempelte Slot-Indizes dieser Karte
 * @param slotCount    Anzahl Felder der Karte (siehe {@link slotsForCard})
 * @returns Slot-Index oder `null`, wenn die Karte voll ist
 */
export function firstEmptySlot(
  stampedSlots: ReadonlySet<number> | readonly number[],
  slotCount: number,
): number | null {
  const stamped =
    stampedSlots instanceof Set ? stampedSlots : new Set(stampedSlots);
  for (let slot = 0; slot < slotCount; slot++) {
    if (!stamped.has(slot)) return slot;
  }
  return null;
}
