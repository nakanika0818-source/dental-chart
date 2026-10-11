// 必須・任意の違いを色ではなく文字で示す
export default function Badge({ children }: { children: string }) {
  return (
    <span className="ml-2 rounded border border-foreground/40 px-1.5 py-0.5 text-sm font-normal">
      {children}
    </span>
  );
}
