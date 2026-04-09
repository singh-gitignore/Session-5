import { useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
export function AppHeader() {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 px-2 font-semibold transition-opacity hover:opacity-80"
        >
          <img
            src="/aramco-logo-cropped.png"
            alt="Aramco India Logo"
            className="h-11 w-11 object-cover drop-shadow-sm transition-transform hover:scale-105"
          />
          <span className="bg-gradient-to-r from-[#00A3E0] to-[#84BD00] bg-clip-text text-transparent font-bold">
            Aramco 
          </span>
        </button>
        <ModeToggle />
      </div>
    </header>
  );
}
