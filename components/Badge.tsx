// 必須・任意の違いを文字で示す。色と太さの違いは補助
export default function Badge({ children }: { children: string }) {
  const style =
    children === "必須"
      ? "border-foreground bg-notice font-bold"
      : "border-foreground/60 bg-surface font-normal";
  return (
    <span
      className={`ml-2 inline-block rounded border px-1.5 py-0.5 align-middle text-sm ${style}`}
    >
      {children}
    </span>
  );
}
