import { getMissingItems, isBlank } from "./missingItems";
import {
  ANESTHESIA_LABELS,
  EXPLANATION_OPTIONS,
  JAW_LABELS,
  PROCEDURE_OPTIONS,
  SIDE_LABELS,
  SURFACE_KEYS,
  getSurfaceLabels,
} from "./options";
import type { FormState } from "./types";

export type GenerateResult =
  | { ok: true; draft: string }
  | { ok: false; reasons: string[] };

// 生成できない理由を返す。空配列なら生成できる
export function validateForGenerate(form: FormState): string[] {
  return getMissingItems(form).required.map(
    (item) => `${item.label}が未入力です`,
  );
}

function formatSite(form: FormState): string | null {
  if (form.jaw === null || form.side === null || form.toothNumber === null) {
    return null;
  }
  const tooth = `${JAW_LABELS[form.jaw]}${SIDE_LABELS[form.side]}${form.toothNumber}番`;
  const labels = getSurfaceLabels(form.jaw, form.toothNumber);
  const surfaces = SURFACE_KEYS.filter((key) => form.surfaces.includes(key))
    .map((key) => labels[key])
    .join("・");
  return surfaces === "" ? tooth : `${tooth} ${surfaces}`;
}

// 入力値を定型文に並べるだけ。値がある行だけを出し、入力されていない事実は足さない
export function buildDraft(form: FormState): string {
  const lines: string[] = [];
  const addText = (label: string, text: string) => {
    if (!isBlank(text)) {
      lines.push(`${label}:${text.trim()}`);
    }
  };

  const site = formatSite(form);
  if (site !== null) {
    lines.push(`部位:${site}`);
  }

  const procedures = PROCEDURE_OPTIONS.filter((option) =>
    form.procedures.includes(option.key),
  ).map((option) => option.label);
  if (procedures.length > 0) {
    lines.push(`処置:${procedures.join("、")}`);
  }
  addText("処置補足", form.procedureNote);

  if (form.anesthesia !== null) {
    const label = ANESTHESIA_LABELS[form.anesthesia];
    const hasDetail =
      form.anesthesia === "used" && !isBlank(form.anesthesiaDetail);
    lines.push(
      hasDetail
        ? `麻酔:${label}(${form.anesthesiaDetail.trim()})`
        : `麻酔:${label}`,
    );
  }

  addText("材料", form.material);
  addText("色調", form.shade);

  const explanations = EXPLANATION_OPTIONS.filter((option) =>
    form.explanations.includes(option.key),
  ).map((option) => option.label);
  if (explanations.length > 0) {
    lines.push(`説明した項目:${explanations.join("、")}`);
  }
  addText("説明補足", form.explanationNote);

  addText("次回予定", form.nextVisit);
  addText("補足", form.remarks);

  return lines.join("\n");
}

// 必須項目が不足しているときは生成せず、理由を返す
export function generateDraft(form: FormState): GenerateResult {
  const reasons = validateForGenerate(form);
  if (reasons.length > 0) {
    return { ok: false, reasons };
  }
  return { ok: true, draft: buildDraft(form) };
}
