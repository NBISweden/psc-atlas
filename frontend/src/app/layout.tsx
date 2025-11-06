import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.scss";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";

export const metadata: Metadata = {
  title: "PSC Atlas",
  description: "PSC Atlas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>PSCatlas</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
      <div className="d-flex min-vh-100">
          <Sidebar />
          <div className="flex-grow-1 d-flex flex-column">
              <Header />
              <main className="flex-grow-1 px-4 py-4">{children}</main>
          </div>
      </div>
      </body>
    </html>
  );
}
