import "./globals.css";
import config from "@/lib/config";

export const metadata = {
  title: `${config.fest.name} — ${config.fest.collegeShort}`,
  description: `${config.artist.name} live at ${config.fest.college} — ${config.fest.date}. ${config.fest.tagline}`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
