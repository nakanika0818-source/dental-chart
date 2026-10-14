type Props = {
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
};

// 選択中かどうかは色だけでなく「✓」と太字でも示す
export default function ChoiceChip({
  type,
  name,
  checked,
  onChange,
  children,
}: Props) {
  return (
    <label className="relative inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1 rounded-lg border border-foreground/60 bg-surface px-3 py-2 text-base hover:bg-notice has-[:checked]:border-foreground has-[:checked]:bg-accent has-[:checked]:font-bold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foreground">
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span aria-hidden="true" className="hidden peer-checked:inline">
        ✓
      </span>
      {children}
    </label>
  );
}
