import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Ploppy",
  description:
    "Create AI chatbots for your website with custom knowledge bases",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <head>
        {/* <script
          src="http://localhost:3000/chatBot.js"
          data-chatbot-id="80997bb9-9873-4d40-a7e6-8d7d5df6ff9d"
        ></script> */}
        <script
          src="https://ploppy.vercel.app/chatBot.js"
          data-chatbot-id="c3b2094e-0739-4ccf-a080-3bbda744c839"
        ></script>
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
