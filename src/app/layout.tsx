import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Proposal Submission - DRID, University of Benin",
  description: "Follow this page to submit your research, innovation and development proposals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-screen h-screen overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Geist+Sans:wght@100..900&family=Geist+Mono:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body
        className="font-geist-sans antialiased w-full h-full bg-white"
      >
        {children}
      </body>
    </html>
  );
}
