export type Jaw = "upper" | "lower";
export type Side = "right" | "left";
export type ToothNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// 歯面は位置で持ち、表示名は歯の位置から決める(options.ts の getSurfaceLabels)
export type SurfaceKey = "mesial" | "distal" | "occlusal" | "buccal" | "lingual";

export type ProcedureKey =
  | "cariesRemoval"
  | "cavityPreparation"
  | "pulpCappingLining"
  | "bonding"
  | "crFilling"
  | "lightCuring"
  | "contouringOcclusalAdjustment"
  | "polishing";

export type Anesthesia = "used" | "notUsed" | "unconfirmed";

export type ExplanationKey =
  | "procedure"
  | "anesthesiaCaution"
  | "postoperativePain"
  | "occlusionDiscomfort"
  | "stainingDebonding";

// 未入力は null・空配列・空文字で表す。「未確認」「使用なし」は別の値として持つ
export type FormState = {
  jaw: Jaw | null;
  side: Side | null;
  toothNumber: ToothNumber | null;
  surfaces: SurfaceKey[];
  procedures: ProcedureKey[];
  procedureNote: string;
  anesthesia: Anesthesia | null;
  anesthesiaDetail: string;
  material: string;
  shade: string;
  explanations: ExplanationKey[];
  explanationNote: string;
  nextVisit: string;
  remarks: string;
};

export function createEmptyForm(): FormState {
  return {
    jaw: null,
    side: null,
    toothNumber: null,
    surfaces: [],
    procedures: [],
    procedureNote: "",
    anesthesia: null,
    anesthesiaDetail: "",
    material: "",
    shade: "",
    explanations: [],
    explanationNote: "",
    nextVisit: "",
    remarks: "",
  };
}
