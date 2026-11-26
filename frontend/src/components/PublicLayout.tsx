import type { ReactNode } from "react";
import BlackHoleBackground from "./BlackHoleBackground";
import Footer from "./Footer";
import Nav from "./Nav";

// Everything every public page has: the background, the nav and the footer.
// `children` is whatever is written between <PublicLayout> and </PublicLayout>.
export default function PublicLayout({ children, home = false }: { children: ReactNode; home?: boolean }) {
  return (
    <div className="relative min-h-screen">
      <BlackHoleBackground alwaysDim={!home} />
      <Nav />
      <main className="relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
