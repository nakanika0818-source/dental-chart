import type { FormState } from "./types";

export type MissingItemKey =
  | "jaw"
  | "side"
  | "toothNumber"
  | "procedures"
  | "anesthesiaUnconfirmed"
  | "anesthesiaDetail"
  | "surfaces"
  | "anesthesia"
  | "material"
  | "shade"
  | "explanations"
  | "nextVisit"
  | "remarks";

export type MissingItem = { key: MissingItemKey; label: string };

export type MissingItems = {
  // 未入力だと下書きを生成できない
  required: MissingItem[];
  // 確認を促すだけで、生成は妨げない
  needsConfirmation: MissingItem[];
  // 空欄でもエラーにしない
  optional: MissingItem[];
};

export function isBlank(text: string): boolean {
  return text.trim() === "";
}

// 入力欄の空欄を示すだけで、記録の医学的な完全性を判定するものではない
export function getMissingItems(form: FormState): MissingItems {
  const required: MissingItem[] = [];
  const needsConfirmation: MissingItem[] = [];
  const optional: MissingItem[] = [];

  if (form.jaw === null) {
    required.push({ key: "jaw", label: "歯の位置(上顎・下顎)" });
  }
  if (form.side === null) {
    required.push({ key: "side", label: "歯の位置(右・左)" });
  }
  if (form.toothNumber === null) {
    required.push({ key: "toothNumber", label: "歯の位置(番号)" });
  }
  if (form.procedures.length === 0 && isBlank(form.procedureNote)) {
    required.push({ key: "procedures", label: "処置内容" });
  }

  if (form.anesthesia === "unconfirmed") {
    needsConfirmation.push({
      key: "anesthesiaUnconfirmed",
      label: "麻酔(未確認になっています)",
    });
  }
  if (form.anesthesia === "used" && isBlank(form.anesthesiaDetail)) {
    needsConfirmation.push({
      key: "anesthesiaDetail",
      label: "麻酔の詳細(使用ありですが、詳細が未入力です)",
    });
  }

  if (form.surfaces.length === 0) {
    optional.push({ key: "surfaces", label: "歯面" });
  }
  if (form.anesthesia === null) {
    optional.push({ key: "anesthesia", label: "麻酔" });
  }
  if (isBlank(form.material)) {
    optional.push({ key: "material", label: "使用材料" });
  }
  if (isBlank(form.shade)) {
    optional.push({ key: "shade", label: "色調" });
  }
  if (form.explanations.length === 0 && isBlank(form.explanationNote)) {
    optional.push({ key: "explanations", label: "患者への説明" });
  }
  if (isBlank(form.nextVisit)) {
    optional.push({ key: "nextVisit", label: "次回予定" });
  }
  if (isBlank(form.remarks)) {
    optional.push({ key: "remarks", label: "その他の所見・補足" });
  }

  return { required, needsConfirmation, optional };
}
