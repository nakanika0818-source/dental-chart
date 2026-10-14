type Props = {
  id: string;
  step: number;
  title: string;
  children: React.ReactNode;
};

// 画面の各セクションの枠と見出し。番号は入力から記録までの順番を示す
export default function Section({ id, step, title, children }: Props) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="mt-6 rounded-xl border border-accent bg-surface p-4 shadow-sm sm:p-6"
    >
      <h2
        id={`${id}-heading`}
        className="flex items-center gap-3 text-xl font-bold"
      >
        <span
          aria-hidden="true"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-accent bg-notice text-base"
        >
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
