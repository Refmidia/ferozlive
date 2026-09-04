import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { brand, brandCssVars } from "@/config/brand";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${brand.name} · Central de suporte`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  icons: {
    icon: brand.logoSrc,
    apple: brand.logoSrc,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full" style={brandCssVars()}>
        {children}
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: brand.colors.surfaceSolid,
              border: `1px solid ${brand.colors.border}`,
              color: brand.colors.text,
            },
          }}
        />
      </body>
    </html>
  );
}
