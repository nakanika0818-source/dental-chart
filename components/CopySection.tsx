import { getCopyBlockers } from "@/lib/cr/draftState";
import type { DraftAction, DraftState } from "@/lib/cr/draftState";
import type { FormState } from "@/lib/cr/types";

type Props = {
  form: FormState;
  state: DraftState;
  dispatch: (action: DraftAction) => void;
  onSelectAll: () => void;
};

const BUTTON_CLASS =
  "min-h-11 rounded-lg border border-foreground px-4 py-2 text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:border-dashed disabled:opacity-60";

const STATUS_TEXT = {
  idle: "",
  copying: "コピーしています…",
  success: "コピーしました。貼り付け先で内容を確認してください。",
  failure:
    "コピーできませんでした。「全文を選択」を押してから、手動でコピーしてください(パソコンは Ctrl+C、スマートフォンは選択した文字を長押しして「コピー」)。",
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
    <section
      aria-labelledby="copy-heading"
      className="mt-6 rounded-lg border border-accent bg-surface p-4"
    >
      <h2 id="copy-heading" className="text-xl font-bold">
        確認・コピー
      </h2>

      <label className="relative mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-foreground/30 p-3 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foreground">
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
      <p className="mt-1 text-sm">
        下書きを編集・再生成したときや、入力を変更したときは、チェックが外れます。
      </p>

      {blockers.length > 0 && (
        <div className="mt-4 rounded-lg border border-dashed border-foreground/40 p-3">
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

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={blockers.length > 0 || copying}
          onClick={copy}
          className={`bg-accent ${BUTTON_CLASS}`}
        >
          下書きをコピー
        </button>
        {state.copyStatus === "failure" && (
          <button
            type="button"
            onClick={onSelectAll}
            className={`bg-surface ${BUTTON_CLASS}`}
          >
            全文を選択
          </button>
        )}
      </div>

      <p
        role="status"
        aria-live="polite"
        className={
          state.copyStatus === "idle"
            ? "sr-only"
            : "mt-4 rounded-lg border-l-4 border-foreground bg-notice p-3 text-base font-bold"
        }
      >
        {STATUS_TEXT[state.copyStatus]}
      </p>
    </section>
  );
}
