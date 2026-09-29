import { Outlet } from "react-router-dom";
import Topbar from "./Topbar.jsx";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Topbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-ink px-8 py-5 flex items-center justify-between">
        <span className="font-serif text-[15px] text-cream font-semibold">
          Fin<em className="not-italic font-normal">sight</em>
        </span>
        <div className="flex gap-5">
          {["Privacy", "Terms", "Help"].map((l) => (
            <span key={l} className="text-[11px] text-[#6a6660] cursor-pointer hover:text-ink-4 transition-colors">
              {l}
            </span>
          ))}
        </div>
        <span className="text-[11px] text-[#4a4840]">© Finsight 2026</span>
      </footer>
    </div>
  );
}
