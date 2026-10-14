import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CR処置後の記録補助ツール(講座用デモ)",
  description:
    "CR処置の内容を選択式で入力し、記録の下書きを作る講座用デモです。架空の情報のみ入力してください。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <p
          role="note"
          className="border-b border-accent bg-notice px-4 py-2 text-center text-base font-bold text-foreground"
        >
          講座用デモ・架空の情報のみ入力してください
        </p>
        {children}
      </body>
    </html>
  );
}
