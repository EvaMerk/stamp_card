"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { slotsForCard, totalCards } from "@/lib/goals/punchcard-math";
import { createGoal, updateGoal } from "@/lib/goals/queries";
import type {
  CardRewardInput,
  Goal,
  GoalCardReward,
} from "@/lib/goals/types";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, inputClassName } from "@/components/ui/Input";
import {
  DEFAULT_GOAL_ICON,
  GOAL_ICON_CHOICES,
  GoalIcon,
} from "./GoalIcon";
import { PeriodPicker } from "./PeriodPicker";
import { cn } from "@/lib/utils";

// Kuratierte, pastellige Farbpalette („Ticket & Tinte“) — funktioniert auf
// Creme (Light) UND warmem Fast-Schwarz (Dark). Bestandsziele mit alten
// Hex-Werten rendern unverändert weiter (Hex-in-DB bleibt).
const COLORS = [
  { value: "#e8871e", label: "Mandarine" },
  { value: "#e25d4f", label: "Koralle" },
  { value: "#d96a9b", label: "Rosa" },
  { value: "#9f7aea", label: "Flieder" },
  { value: "#5a8dee", label: "Himmelblau" },
  { value: "#2fb7b0", label: "Türkis" },
  { value: "#6aa84f", label: "Grün" },
  { value: "#a07855", label: "Mokka" },
] as const;

// Obergrenze für individuell konfigurierbare Karten-Belohnungen im Formular
const MAX_REWARD_INPUTS = 50;

const goalFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Bitte gib einen Titel ein.")
      .max(200, "Der Titel darf höchstens 200 Zeichen lang sein."),
    description: z
      .string()
      .max(2000, "Die Beschreibung ist zu lang (max. 2000 Zeichen).")
      .optional(),
    icon: z.string().min(1, "Bitte wähle ein Symbol."),
    color: z.string().min(1, "Bitte wähle eine Farbe."),
    target_count: z
      .number({ error: "Bitte gib eine Zahl ein." })
      .int("Bitte gib eine ganze Zahl ein.")
      .min(1, "Die Zielanzahl muss mindestens 1 sein.")
      .max(100000, "Die Zielanzahl ist zu groß."),
    card_size: z
      .number({ error: "Bitte gib eine Zahl ein." })
      .int("Bitte gib eine ganze Zahl ein.")
      .min(1, "Die Kartengröße muss mindestens 1 sein.")
      .max(100, "Maximal 100 Felder pro Karte."),
    period_type: z.enum(["year", "month", "week", "custom"]),
    start_date: z.string().min(1, "Bitte wähle ein Startdatum."),
    end_date: z.string().optional(),
    reward_text: z.string().max(500, "Die Belohnung ist zu lang.").optional(),
    use_card_rewards: z.boolean(),
    card_rewards: z.array(z.string().max(500)).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.period_type === "custom") {
      if (!values.end_date) {
        ctx.addIssue({
          code: "custom",
          path: ["end_date"],
          message: "Bei eigenem Zeitraum ist ein Enddatum erforderlich.",
        });
      } else if (values.end_date < values.start_date) {
        ctx.addIssue({
          code: "custom",
          path: ["end_date"],
          message: "Das Enddatum darf nicht vor dem Startdatum liegen.",
        });
      }
    }
  });

type GoalFormValues = z.infer<typeof goalFormSchema>;

function felderWort(n: number): string {
  return n === 1 ? "Feld" : "Feldern";
}

function buildCardRewardDefaults(
  goal: Goal | undefined,
  cardRewards: GoalCardReward[],
): string[] {
  if (!goal) return [];
  const cards = totalCards(goal.target_count, goal.card_size);
  return Array.from(
    { length: cards },
    (_, i) => cardRewards.find((r) => r.card_index === i)?.reward_text ?? "",
  );
}

export interface GoalFormProps {
  /** Vorhandenes Ziel → Bearbeiten-Modus; sonst Anlegen-Modus. */
  goal?: Goal;
  /** Bestehende Karten-Belohnungen (nur im Bearbeiten-Modus relevant). */
  cardRewards?: GoalCardReward[];
}

/**
 * Formular zum Anlegen und Bearbeiten eines Ziels — react-hook-form + zod,
 * mit Live-Preview der Kartenaufteilung und optionalen Belohnungen pro Karte.
 *
 * Symbol-Auswahl: kuratierte Phosphor-Icons (Name als String in goals.icon).
 * Bestandsziele mit Emoji behalten ihr Emoji: Es erscheint als zusätzliche,
 * vorausgewählte Option am Grid-Anfang, bis bewusst ein Icon gewählt wird.
 */
export function GoalForm({ goal, cardRewards = [] }: GoalFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues: GoalFormValues = goal
    ? {
        title: goal.title,
        description: goal.description ?? "",
        icon: goal.icon ?? DEFAULT_GOAL_ICON,
        color: goal.color ?? COLORS[0].value,
        target_count: goal.target_count,
        card_size: goal.card_size,
        period_type: goal.period_type,
        start_date: goal.start_date,
        end_date: goal.end_date ?? "",
        reward_text: goal.reward_text ?? "",
        use_card_rewards: cardRewards.length > 0,
        card_rewards: buildCardRewardDefaults(goal, cardRewards),
      }
    : {
        title: "",
        description: "",
        icon: DEFAULT_GOAL_ICON,
        color: COLORS[0].value,
        target_count: 100,
        card_size: 10,
        period_type: "year",
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: "",
        reward_text: "",
        use_card_rewards: false,
        card_rewards: [],
      };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues,
  });

  const icon = watch("icon");
  const color = watch("color");
  const targetCount = watch("target_count");
  const cardSize = watch("card_size");
  const periodType = watch("period_type");
  const startDate = watch("start_date");
  const endDate = watch("end_date") ?? "";
  const rewardText = watch("reward_text") ?? "";
  const useCardRewards = watch("use_card_rewards");

  // Bestands-Emoji (oder unbekannter Icon-Name) als zusätzliche Option, damit
  // das Bearbeiten eines Alt-Ziels die Auswahl nicht stillschweigend ändert.
  const legacyIcon =
    defaultValues.icon &&
    !GOAL_ICON_CHOICES.some((c) => c.name === defaultValues.icon)
      ? defaultValues.icon
      : null;
  const iconChoices = legacyIcon
    ? [{ name: legacyIcon, label: `Bisheriges Symbol ${legacyIcon}` }, ...GOAL_ICON_CHOICES]
    : GOAL_ICON_CHOICES;

  // Live-Preview der Kartenaufteilung ("→ 10 Karten à 10 Felder, …")
  const preview = useMemo(() => {
    const cards = totalCards(targetCount, cardSize);
    if (cards === 0) return null;
    const lastSlots = slotsForCard(cards - 1, targetCount, cardSize);
    if (cards === 1) {
      return `→ 1 Karte mit ${lastSlots} ${felderWort(lastSlots)}`;
    }
    const base = `→ ${cards} Karten à ${cardSize} ${felderWort(cardSize)}`;
    return lastSlots === cardSize
      ? base
      : `${base}, letzte Karte mit ${lastSlots} ${felderWort(lastSlots)}`;
  }, [targetCount, cardSize]);

  const rewardInputCount = Math.min(
    totalCards(targetCount, cardSize),
    MAX_REWARD_INPUTS,
  );

  async function onSubmit(values: GoalFormValues) {
    setSubmitError(null);
    if (!user) {
      setSubmitError("Du bist nicht angemeldet.");
      return;
    }

    const cards = totalCards(values.target_count, values.card_size);
    const rewards: CardRewardInput[] = values.use_card_rewards
      ? (values.card_rewards ?? [])
          .slice(0, Math.min(cards, MAX_REWARD_INPUTS))
          .map((text, cardIndex) => ({
            card_index: cardIndex,
            reward_text: text.trim(),
          }))
          .filter((r) => r.reward_text.length > 0)
      : [];

    const payload = {
      title: values.title.trim(),
      description: values.description?.trim() || null,
      icon: values.icon,
      color: values.color,
      target_count: values.target_count,
      card_size: values.card_size,
      period_type: values.period_type,
      start_date: values.start_date,
      end_date: values.period_type === "custom" ? (values.end_date ?? null) : null,
      reward_text: values.reward_text?.trim() || null,
    };

    try {
      if (goal) {
        await updateGoal(goal.id, payload, rewards);
        router.push(`/goal?id=${goal.id}`);
      } else {
        await createGoal({ ...payload, user_id: user.id }, rewards);
        router.push("/dashboard");
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Speichern fehlgeschlagen.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <Input
        label="Titel"
        placeholder="z.B. 100x Sport"
        error={errors.title?.message}
        {...register("title")}
      />

      <Textarea
        label="Beschreibung (optional)"
        placeholder="Worum geht es bei diesem Ziel?"
        error={errors.description?.message}
        {...register("description")}
      />

      {/* Symbol: kuratierte Phosphor-Icons als gestempelte Piktogramme */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink-soft">Symbol</span>
        <div className="grid grid-cols-10 gap-1.5 max-sm:grid-cols-5">
          {iconChoices.map((choice) => {
            const selected = icon === choice.name;
            return (
              <button
                key={choice.name}
                type="button"
                onClick={() =>
                  setValue("icon", choice.name, { shouldValidate: true })
                }
                aria-pressed={selected}
                aria-label={`Symbol ${choice.label}`}
                title={choice.label}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-full border transition hover:scale-105",
                  selected
                    ? "bg-accent-soft border-accent text-accent-strong shadow-sm"
                    : "border-hairline bg-surface text-ink-soft",
                )}
              >
                <GoalIcon name={choice.name} size={20} />
              </button>
            );
          })}
        </div>
        {errors.icon && (
          <p className="text-xs text-danger" role="alert">
            {errors.icon.message}
          </p>
        )}
      </div>

      {/* Farbe */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink-soft">Farbe</span>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() =>
                setValue("color", c.value, { shouldValidate: true })
              }
              aria-pressed={color === c.value}
              aria-label={`Farbe ${c.label}`}
              title={c.label}
              className={cn(
                "h-9 w-9 rounded-full border-2 transition hover:scale-110",
                color === c.value
                  ? "border-ink ring-2 ring-ink/25 ring-offset-2 ring-offset-surface"
                  : "border-surface shadow-sm",
              )}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
        {errors.color && (
          <p className="text-xs text-danger" role="alert">
            {errors.color.message}
          </p>
        )}
      </div>

      {/* Zielanzahl + Kartengröße mit Live-Preview */}
      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            type="number"
            label="Zielanzahl"
            min={1}
            inputMode="numeric"
            error={errors.target_count?.message}
            {...register("target_count", { valueAsNumber: true })}
          />
          <Input
            type="number"
            label="Felder pro Karte"
            min={1}
            max={100}
            inputMode="numeric"
            error={errors.card_size?.message}
            {...register("card_size", { valueAsNumber: true })}
          />
        </div>
        {preview && (
          <p className="text-sm font-medium text-accent-strong">{preview}</p>
        )}
      </div>

      {/* Zeitraum */}
      <PeriodPicker
        periodType={periodType}
        startDate={startDate}
        endDate={endDate}
        onPeriodTypeChange={(p) =>
          setValue("period_type", p, { shouldValidate: true })
        }
        onStartDateChange={(d) =>
          setValue("start_date", d, { shouldValidate: true })
        }
        onEndDateChange={(d) =>
          setValue("end_date", d, { shouldValidate: true })
        }
        startDateError={errors.start_date?.message}
        endDateError={errors.end_date?.message}
      />

      {/* Belohnung */}
      <div className="flex flex-col gap-3">
        <Input
          label="Belohnung pro Karte (optional)"
          placeholder="z.B. Ein Kinoabend"
          error={errors.reward_text?.message}
          {...register("reward_text")}
        />

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--accent)]"
            {...register("use_card_rewards")}
          />
          Unterschiedliche Belohnung pro Karte
        </label>

        {useCardRewards && (
          <div className="bg-accent-soft flex flex-col gap-2 rounded-[20px] border border-accent/20 p-4">
            {Array.from({ length: rewardInputCount }, (_, cardIndex) => (
              <div key={cardIndex} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-xs font-semibold text-ink-soft">
                  Karte {cardIndex + 1}
                </span>
                <input
                  type="text"
                  placeholder={rewardText.trim() || "Belohnung (optional)"}
                  aria-label={`Belohnung für Karte ${cardIndex + 1}`}
                  className={cn(inputClassName, "w-full py-2 text-sm")}
                  {...register(`card_rewards.${cardIndex}` as const)}
                />
              </div>
            ))}
            {totalCards(targetCount, cardSize) > MAX_REWARD_INPUTS && (
              <p className="text-xs text-ink-soft">
                Es können höchstens {MAX_REWARD_INPUTS} Karten individuell
                belohnt werden — für die übrigen gilt die Standard-Belohnung.
              </p>
            )}
            <p className="text-xs text-ink-soft">
              Leere Felder verwenden die Standard-Belohnung oben.
            </p>
          </div>
        )}
      </div>

      {submitError && (
        <p
          className="bg-danger-soft rounded-2xl px-4 py-2.5 text-sm text-danger"
          role="alert"
        >
          {submitError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Abbrechen
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Wird gespeichert …"
            : goal
              ? "Änderungen speichern"
              : "Ziel anlegen"}
        </Button>
      </div>
    </form>
  );
}
