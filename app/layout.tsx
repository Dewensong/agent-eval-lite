import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppStoreProvider } from "@/lib/store/app-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentEval Lite",
  description: "轻量级、可视化的 Prompt / Agent 评测工作台。"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AppStoreProvider>{children}</AppStoreProvider>
      </body>
    </html>
  );
}
