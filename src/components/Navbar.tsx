import { useState } from "react";
import { Snowflake, Menu, X } from "lucide-react";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Risk Checker", href: "#checker" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Risk Map", href: "#risk-map" },
  { label: "Prevention", href: "#prevention" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 frost-glass">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <a href="#home" className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
          <Snowflake className="h-6 w-6" />
          FrostGuard
        </a>
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {item.label}
            </a>
          ))}
        </div>
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden frost-glass border-t border-border px-4 pb-4">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
