import Section from "./Section";
import {
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  HINT_CLASS,
  NOTICE_BOX,
  GUIDE_BOX,
} from "./ui";
import { getCopyBlockers } from "@/lib/cr/draftState";
import type { DraftAction, DraftState } from "@/lib/cr/draftState";
import type { FormState } from "@/lib/cr/types";

type Props = {
  form: FormState;
  state: DraftState;
  dispatch: (action: DraftAction) => void;
  onSelectAll: () => void;
};

const STATUS_TEXT = {
  idle: "",
  copying: "コピーしています…",
  success: "コピーしました。貼り付け先で内容を確認してください。",
  failure: "コピーできませんでした。次の手順で手動でコピーしてください。",
} as const;

async function writeClipboard(text: string): Promise<boolean> {
  try {
    // http の別端末から開いた場合などは navigator.clipboard 自体がない
    if (navigator.clipboard === undefined) {
      return false;
    }
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function CopySection({
  form,
  state,
  dispatch,
  onSelectAll,
}: Props) {
  const blockers = getCopyBlockers(form, state);
  const hasDraft = state.generatedDraft !== null;
  const copying = state.copyStatus === "copying";

  const copy = async () => {
    // 押した時点の下書きと版を控えておき、終わったときに変わっていれば結果を捨てる
    const { draft, version } = state;
    dispatch({ type: "copyStarted" });
    const ok = await writeClipboard(draft);
    dispatch({ type: "copyFinished", version, ok });
  };

  return (
    <Section id="copy" step={6} title="確認・コピー">
      <label className="relative mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-foreground/60 bg-surface p-3 hover:bg-notice has-[:checked]:border-foreground has-[:checked]:bg-accent has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foreground">
        <input
          type="checkbox"
          checked={state.confirmed}
          disabled={!hasDraft}
          onChange={(event) =>
            dispatch({ type: "setConfirmed", confirmed: event.target.checked })
          }
          className="size-6 shrink-0"
        />
        <span className="text-base font-bold">下書きの内容を確認した</span>
      </label>
      <p className={HINT_CLASS}>
        下書きを編集・再生成したときや、入力を変更したときは、チェックが外れます。
      </p>

      {blockers.length > 0 && (
        <div className={`mt-4 ${GUIDE_BOX}`}>
          <p className="text-base font-bold">まだコピーできません。</p>
          <ul className="mt-1 list-disc pl-6 text-base">
            {blockers.map((blocker) => (
              <li key={blocker} className="mt-1 break-words">
                {blocker}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        disabled={blockers.length > 0 || copying}
        onClick={copy}
        className={`mt-4 ${PRIMARY_BUTTON}`}
      >
        下書きをコピー
      </button>

      <p
        role="status"
        aria-live="polite"
        className={
          state.copyStatus === "idle"
            ? "sr-only"
            : `${NOTICE_BOX} text-base font-bold`
        }
      >
        {STATUS_TEXT[state.copyStatus]}
      </p>

      {state.copyStatus === "failure" && (
        <div className={`mt-2 ${GUIDE_BOX}`}>
          <ol className="list-decimal pl-6 text-base leading-relaxed">
            <li>下の「全文を選択」を押す(上の下書きの欄が全文選択されます)</li>
            <li className="mt-1">
              パソコンは Ctrl+C(Mac は ⌘+C)、スマートフォンは選択した文字を長押しして「コピー」を選ぶ
            </li>
            <li className="mt-1">貼り付け先で内容を確認する</li>
          </ol>
          <button
            type="button"
            onClick={onSelectAll}
            className={`mt-3 ${SECONDARY_BUTTON}`}
          >
            全文を選択
          </button>
        </div>
      )}
    </Section>
  );
}
