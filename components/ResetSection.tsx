import type { DraftAction, DraftState } from "@/lib/cr/draftState";

type Props = {
  state: DraftState;
  dispatch: (action: DraftAction) => void;
  onReset: () => void;
};

const BUTTON_CLASS =
  "min-h-11 rounded-lg border border-foreground px-4 py-2 text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

export default function ResetSection({ state, dispatch, onReset }: Props) {
  return (
    <section
      aria-labelledby="reset-heading"
      className="mt-6 rounded-lg border border-accent bg-surface p-4"
    >
      <h2 id="reset-heading" className="text-xl font-bold">
        リセット
      </h2>
      <p className="mt-1 text-sm">
        コピーが終わったら、次の記録の前に入力と下書きを消去してください。
      </p>

      {state.confirmingReset ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border-2 border-foreground bg-notice p-3"
        >
          <p className="text-base font-bold">
            入力・下書き・確認チェックをすべて消去します。元に戻せません。消去しますか?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onReset}
              className={`bg-accent ${BUTTON_CLASS}`}
            >
              消去する
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "cancelReset" })}
              className={`bg-surface ${BUTTON_CLASS}`}
            >
              取り消す(消去しない)
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => dispatch({ type: "requestReset" })}
          className={`mt-4 bg-surface ${BUTTON_CLASS}`}
        >
          入力と下書きをすべて消去
        </button>
      )}
    </section>
  );
}
