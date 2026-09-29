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
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0b0f19] text-[#f9fafb]">
        {children}
      </body>
    </html>
  );
}
