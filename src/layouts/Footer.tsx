import { useTheme } from "../hooks/useTheme";

export function Footer() {
  const {theme} = useTheme();
  return (
    <footer className={`w-full h-8 fixed bottom-0 left-0 right-0 z-10 ${theme === 'dark' ? 'bg-black' : 'bg-white'} border-t py-2 `}>
      <div className="container mx-auto px-4">
        <p className="text-[var(--text-muted)] text-xs text-center">
          Oohdit © {new Date().getFullYear()} All rights reserved
        </p>
        {/* <p className="text-[var(--text-muted)] text-xs text-center">
         Oohdit
        </p>
        <p className="text-[var(--text-muted)] text-xs text-center">
          All rights reserved
        </p> */}
      </div>
    </footer>
  );
}
