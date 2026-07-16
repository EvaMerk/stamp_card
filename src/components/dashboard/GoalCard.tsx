"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, type PanInfo } from "motion/react";
import { Confetti } from "@phosphor-icons/react";
import { GoalAnalytics } from "@/components/analytics/GoalAnalytics";
import { GoalIcon } from "@/components/goals/GoalIcon";
import { useGoalStamps } from "@/hooks/useGoalStamps";
import {
  activeCardIndex,
  remainingCount,
  totalCards,
} from "@/lib/goals/punchcard-math";
import { getCardRewards } from "@/lib/goals/queries";
import type { Goal, GoalCardReward } from "@/lib/goals/types";
import { PunchCardGrid } from "@/components/punchcard/PunchCardGrid";
import { Spinner } from "@/components/ui/Spinner";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

const FALLBACK_COLOR = "#e07316"; // --accent (Light)

/**
 * Dashboard-Kachel eines Ziels (Mini-Ticket): Header (Symbol/Titel/Farbe)
 * und darunter der Swipe-Container mit zwei Panels — Stempelkarte ↔
 * Analytics (Plotly-Chart + Kartenübersicht). Umschalten per horizontalem
 * Wischen (motion drag="x") oder per Klick auf die Punkte-Indikatoren.
 */
export function GoalCard({ goal }: { goal: Goal }) {
  const color = goal.color ?? FALLBACK_COLOR;
  const { t } = useTranslation();

  return (
    <article className="relative flex flex-col gap-4 overflow-hidden rounded-[20px] border border-hairline bg-surface p-5 shadow-card">
      {/* Orange-Aura in der Kachel-Ecke (dekorativ) */}
      <span className="aura absolute -left-12 -top-12 h-36 w-36" aria-hidden="true" />

      <Link
        href={`/goal?id=${goal.id}`}
        className="group relative flex items-center gap-3"
      >
        <span
          className="flex h-11 w-11 shrink-0 rotate-[-6deg] items-center justify-center rounded-full transition group-hover:rotate-0"
          style={{
            border: `2px solid color-mix(in srgb, ${color} 55%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${color} 12%, var(--surface))`,
            color,
          }}
          aria-hidden="true"
        >
          <GoalIcon name={goal.icon} size={22} />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-display text-lg font-bold tracking-tight text-ink group-hover:text-accent-strong">
            {goal.title}
          </span>
          <span className="block text-xs text-ink-faint">
            {t("dashboard.detailsLink")}
          </span>
        </span>
      </Link>

      <GoalCardSwipe
        punchPanel={<GoalCardPunchPanel goal={goal} />}
        renderAnalytics={(active) => (
          <GoalAnalytics goal={goal} active={active} chartHeight={220} />
        )}
      />
    </article>
  );
}

/** Mindest-Drag-Distanz (px), ab der die Ansicht wechselt. */
const SWIPE_OFFSET_THRESHOLD = 60;
/** Alternativ: Mindest-Geschwindigkeit (px/s) für kurze, schnelle Flicks. */
const SWIPE_VELOCITY_THRESHOLD = 500;

export interface GoalCardSwipeProps {
  /** Panel A: die Stempelkarte (Black Box, unverändert übernommen). */
  punchPanel: ReactNode;
  /**
   * Panel B als Render-Prop: `active` = Panel ist aktuell sichtbar (für
   * Refetch beim Einwischen). Wird erst gemountet, wenn der User das erste
   * Mal wischt oder den Punkt anklickt (spart den Plotly-Chunk auf dem
   * Dashboard, solange niemand die Statistik ansieht).
   */
  renderAnalytics: (active: boolean) => ReactNode;
}

/**
 * Zwei-Panel-Swipe-Container (Stempelkarte ↔ Analytics).
 *
 * Gesten-Verhalten:
 * - `drag="x"` mit Constraints über die volle Panel-Breite; nach dem
 *   Loslassen entscheidet Distanz (>60px) ODER Velocity (>500px/s) über den
 *   Ansichtswechsel, sonst schnappt das Panel zurück.
 * - `dragDirectionLock` + `touch-action: pan-y`: horizontales Wischen
 *   kapert NICHT das vertikale Scrollen auf Touch-Geräten.
 * - Punkte-Indikator (● ○) ist klickbar — barrierefreie Alternative ohne
 *   Wischgeste.
 * - Container-Höhe folgt animiert dem aktiven Panel (Panels sind
 *   unterschiedlich hoch).
 */
export function GoalCardSwipe({
  punchPanel,
  renderAnalytics,
}: GoalCardSwipeProps) {
  const { t } = useTranslation();
  const viewLabels = [t("card.view.punchcard"), t("card.view.stats")] as const;
  const [view, setView] = useState<0 | 1>(0);
  const [analyticsMounted, setAnalyticsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const punchRef = useRef<HTMLDivElement>(null);
  const analyticsRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [heights, setHeights] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      setWidth(container.clientWidth);
      setHeights([
        punchRef.current?.offsetHeight ?? 0,
        analyticsRef.current?.offsetHeight ?? 0,
      ]);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    if (punchRef.current) observer.observe(punchRef.current);
    if (analyticsRef.current) observer.observe(analyticsRef.current);
    return () => observer.disconnect();
  }, [analyticsMounted]);

  function show(next: 0 | 1) {
    if (next === 1) setAnalyticsMounted(true);
    setView(next);
  }

  function handleDragEnd(
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) {
    // Schneller Flick zählt auch bei kurzer Distanz; sonst zählt die Distanz.
    const direction =
      Math.abs(info.velocity.x) >= SWIPE_VELOCITY_THRESHOLD
        ? Math.sign(info.velocity.x)
        : Math.abs(info.offset.x) >= SWIPE_OFFSET_THRESHOLD
          ? Math.sign(info.offset.x)
          : 0;
    if (direction < 0) show(1);
    else if (direction > 0) show(0);
    // direction === 0 → Ansicht unverändert, animate schnappt zurück.
  }

  const activeHeight = heights[view];

  return (
    <div className="flex flex-col gap-3">
      <motion.div
        ref={containerRef}
        className="overflow-hidden"
        animate={activeHeight > 0 ? { height: activeHeight } : undefined}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
      >
        <motion.div
          className="flex items-start"
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: -width, right: 0 }}
          dragElastic={0.15}
          dragMomentum={false}
          style={{ touchAction: "pan-y" }}
          onDragStart={() => setAnalyticsMounted(true)}
          onDragEnd={handleDragEnd}
          animate={{ x: -view * width }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
        >
          <div
            ref={punchRef}
            className="w-full min-w-0 shrink-0"
            aria-hidden={view !== 0}
            inert={view !== 0}
          >
            {punchPanel}
          </div>
          <div
            ref={analyticsRef}
            className="w-full min-w-0 shrink-0 pl-px"
            aria-hidden={view !== 1}
            inert={view !== 1}
          >
            {analyticsMounted ? renderAnalytics(view === 1) : null}
          </div>
        </motion.div>
      </motion.div>

      <div className="flex items-center justify-center gap-2">
        {viewLabels.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => show(index as 0 | 1)}
            aria-label={t("card.view.show", { label })}
            aria-pressed={view === index}
            className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-sunken"
          >
            <span
              aria-hidden="true"
              className={`block rounded-full transition-all duration-300 ${
                view === index
                  ? "h-2 w-5 bg-accent"
                  : "h-2 w-2 bg-ink-faint/50"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Punch-Bereich der Kachel: Fortschrittszeile + aktives Mitglieds-Ticket.
 * (Panel A des Swipe-Containers — Innenleben unverändert aus Phase 2.)
 */
function GoalCardPunchPanel({ goal }: { goal: Goal }) {
  const { t } = useTranslation();
  const { stamps, loading, error, addStamp } = useGoalStamps(goal.id);
  const [rewards, setRewards] = useState<GoalCardReward[]>([]);

  useEffect(() => {
    let cancelled = false;
    getCardRewards(goal.id)
      .then((data) => {
        if (!cancelled) setRewards(data);
      })
      .catch(() => {
        // Belohnungs-Overrides sind optional — Fallback ist goals.reward_text.
      });
    return () => {
      cancelled = true;
    };
  }, [goal.id]);

  if (loading) {
    return <Spinner label={t("goal.stampsLoading")} />;
  }

  const stampCount = stamps.length;
  const cards = totalCards(goal.target_count, goal.card_size);
  const activeCard = activeCardIndex(
    stampCount,
    goal.target_count,
    goal.card_size,
  );
  const remaining = remainingCount(goal.target_count, stampCount);
  const cardStamps = stamps.filter((s) => s.card_index === activeCard);
  const rewardText =
    rewards.find((r) => r.card_index === activeCard)?.reward_text ??
    goal.reward_text;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-ink-soft">
        <span className="font-display font-bold text-ink">
          {stampCount}/{goal.target_count}
        </span>{" "}
        {t("goal.cardCounter", { card: activeCard + 1, cards })}
        {remaining === 0 && (
          <span className="ml-2 inline-flex items-center gap-1 font-semibold text-accent-strong">
            {t("goal.reachedShort")}
            <Confetti size={14} weight="fill" aria-hidden="true" />
          </span>
        )}
      </p>

      <PunchCardGrid
        goal={goal}
        cardIndex={activeCard}
        stamps={cardStamps}
        rewardText={rewardText}
        onStamp={(slotIndex) => addStamp(activeCard, slotIndex)}
      />

      {error && (
        <p
          className="bg-danger-soft rounded-2xl px-4 py-2.5 text-xs text-danger"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
