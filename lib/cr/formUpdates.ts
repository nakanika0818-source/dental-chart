import type { Anesthesia, FormState } from "./types";

// 麻酔を「使用あり」以外に変えたら詳細を消す。
// 残しておくと、あとで「使用あり」に戻したときに以前の詳細が下書きに混入する
export function anesthesiaPatch(anesthesia: Anesthesia): Partial<FormState> {
  return anesthesia === "used"
    ? { anesthesia }
    : { anesthesia, anesthesiaDetail: "" };
}
