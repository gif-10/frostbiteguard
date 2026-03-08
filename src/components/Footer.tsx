import { Snowflake } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border py-8">
    <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Snowflake className="h-4 w-4 text-primary" />
        <span className="font-heading font-semibold text-foreground">FrostGuard</span>
        <span>· Frostbite Risk Detection System</span>
      </div>
      <p className="text-xs text-muted-foreground">Stay warm. Stay safe. © {new Date().getFullYear()}</p>
    </div>
  </footer>
);

export default Footer;
