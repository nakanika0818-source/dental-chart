import Badge from "./Badge";
import { FIELD_CLASS } from "./ui";

type Props = {
  label: string;
  badge: "必須" | "任意";
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  hint?: string;
};

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
        <span className="mt-1 block text-sm leading-relaxed">{hint}</span>
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
