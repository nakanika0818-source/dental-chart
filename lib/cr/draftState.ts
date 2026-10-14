import { buildDraft, generateDraft } from "./buildDraft";
import { isBlank } from "./missingItems";
import type { FormState } from "./types";

export type CopyStatus = "idle" | "copying" | "success" | "failure";

export type DraftState = {
  // テキスト欄に表示している文章(手で編集した内容を含む)
  draft: string;
  // 最後に生成した文章。未生成なら null
  generatedDraft: string | null;
  // 手で編集した下書きを上書きしてよいか確認している間 true
  confirmingOverwrite: boolean;
  // 生成しようとして必須項目が足りなかったとき true
  showReasons: boolean;
  // 「下書きの内容を確認した」のチェック
  confirmed: boolean;
  copyStatus: CopyStatus;
  // 入力・下書きが変わるたびに増やす。コピー中に変わったら、その結果を表示しないために使う
  version: number;
};

export type DraftAction =
  | { type: "generate"; form: FormState }
  | { type: "confirmOverwrite"; form: FormState }
  | { type: "cancelOverwrite" }
  | { type: "edit"; text: string }
  | { type: "inputChanged" }
  | { type: "setConfirmed"; confirmed: boolean }
  | { type: "copyStarted" }
  | { type: "copyFinished"; version: number; ok: boolean };

export const initialDraftState: DraftState = {
  draft: "",
  generatedDraft: null,
  confirmingOverwrite: false,
  showReasons: false,
  confirmed: false,
  copyStatus: "idle",
  version: 0,
};

export function isDraftEdited(state: DraftState): boolean {
  return state.generatedDraft !== null && state.draft !== state.generatedDraft;
}

// 生成後に入力を変えたかどうか。選択の順番など、下書きに影響しない違いは無視する
export function isDraftStale(form: FormState, state: DraftState): boolean {
  return (
    state.generatedDraft !== null && buildDraft(form) !== state.generatedDraft
  );
}

// コピーできない理由を返す。空配列ならコピーできる
export function getCopyBlockers(form: FormState, state: DraftState): string[] {
  if (state.generatedDraft === null) {
    return ["先に下書きを生成してください。"];
  }
  const blockers: string[] = [];
  if (isBlank(state.draft)) {
    blockers.push("下書きが空です。");
  }
  if (isDraftStale(form, state)) {
    blockers.push("古い下書きです。再生成してください。");
  }
  if (!state.confirmed) {
    blockers.push("「下書きの内容を確認した」にチェックを入れてください。");
  }
  return blockers;
}

// 下書きの内容が変わったので、確認チェックとコピーの表示を取り消す
function invalidate(state: DraftState): DraftState {
  return {
    ...state,
    confirmed: false,
    copyStatus: "idle",
    version: state.version + 1,
  };
}

function regenerate(state: DraftState, form: FormState): DraftState {
  const result = generateDraft(form);
  if (!result.ok) {
    // 生成できないときは、表示中の下書きに手を付けない
    return { ...state, confirmingOverwrite: false, showReasons: true };
  }
  return invalidate({
    ...state,
    draft: result.draft,
    generatedDraft: result.draft,
    confirmingOverwrite: false,
    showReasons: false,
  });
}

export function draftReducer(
  state: DraftState,
  action: DraftAction,
): DraftState {
  switch (action.type) {
    case "generate": {
      if (!generateDraft(action.form).ok) {
        return regenerate(state, action.form);
      }
      // 手で編集した内容は、確認を取ってから上書きする(空欄なら失うものがないので確認しない)
      if (isDraftEdited(state) && !isBlank(state.draft)) {
        return { ...state, confirmingOverwrite: true, showReasons: false };
      }
      return regenerate(state, action.form);
    }
    case "confirmOverwrite":
      return regenerate(state, action.form);
    case "cancelOverwrite":
      return { ...state, confirmingOverwrite: false };
    case "edit":
      return invalidate({ ...state, draft: action.text });
    case "inputChanged":
      return invalidate(state);
    case "setConfirmed":
      return { ...state, confirmed: action.confirmed };
    case "copyStarted":
      return { ...state, copyStatus: "copying" };
    case "copyFinished":
      // コピー中に入力や下書きが変わっていたら、古い内容の結果は表示しない
      if (action.version !== state.version) {
        return state;
      }
      return { ...state, copyStatus: action.ok ? "success" : "failure" };
  }
}
