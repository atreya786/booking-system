import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "VenueFlow — Venue Booking & Approval Platform",
  description:
    "Role-based venue booking, tiered approval workflow, and full-day priority allocation engine.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
