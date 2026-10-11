import Badge from "./Badge";

type Props = {
  label: string;
  badge: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  hint?: string;
};

const FIELD_CLASS =
  "mt-2 block w-full min-w-0 rounded-lg border border-foreground/30 bg-surface px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

// autoComplete="off" はブラウザに入力履歴を残させないため
export default function TextField({
  label,
  badge,
  value,
  onChange,
  multiline = false,
  hint,
}: Props) {
  return (
    <label className="mt-4 block">
      <span className="text-base font-bold">
        {label}
        <Badge>{badge}</Badge>
      </span>
      {hint !== undefined && (
        <span className="mt-1 block text-sm">{hint}</span>
      )}
      {multiline ? (
        <textarea
          rows={3}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={FIELD_CLASS}
        />
      ) : (
        <input
          type="text"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={FIELD_CLASS}
        />
      )}
    </label>
  );
}
