import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { DarkModeProvider } from "@/components/DarkModeProvider";
import DarkModeToggle from "@/components/DarkModeToggle";
import SocialLinks from "@/components/SocialLinks";

const cairo = Cairo({ subsets: ["arabic"] });

export const metadata: Metadata = {
  title: "متطوعي وزارة الشباب والرياضة YLY",
  description: "نموذج التسجيل للمتطوعين في وزارة الشباب والرياضة",
  icons: {
    icon: '/yly-icon.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="transition-colors">
      <body className={`${cairo.className} min-h-screen`}>
        <DarkModeProvider>
          <DarkModeToggle />
          <SocialLinks />
          {children}
        </DarkModeProvider>
      </body>
    </html>
  );
}
