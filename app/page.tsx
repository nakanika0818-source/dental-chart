import CrRecordForm from "@/components/CrRecordForm";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-bold">CR処置後の記録補助ツール</h1>
      <p className="mt-4 text-base leading-relaxed">
        CR処置の内容を選択式で入力し、定型文による記録の下書きを作るためのツールです。
        入力していない項目を確認し、下書きを修正してからコピーできます。
      </p>
      <CrRecordForm />
      <p className="mt-6 rounded-lg border border-accent bg-surface p-4 text-base leading-relaxed">
        下書きの生成・コピーの欄は準備中です。
      </p>
    </main>
  );
}
