import HeaderClient from "@/components/HeaderClient";

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>
        <HeaderClient />
        {children}
      </body>
    </html>
  );
}