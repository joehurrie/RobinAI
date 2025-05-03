import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { DeepgramContextProvider } from "@/lib/contexts/DeepgramContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DeepgramContextProvider>
            {children}
          </DeepgramContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
