import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillTwin — Evidence-Based Skill Intelligence & Placement Platform",
  description: "Turn static resumes into living, evidence-backed skill profiles connecting students, academicians, industries, and institutions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F7F4EE] text-[#18181B] selection:bg-[#EFE5D8] selection:text-[#18181B]">
        {children}
      </body>
    </html>
  );
}
