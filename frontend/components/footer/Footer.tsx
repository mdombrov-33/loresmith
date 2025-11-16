import { footerSections, socialLinks } from "@/constants/footer-links";
import Logo from "@/components/shared/Logo";

export default function Footer() {
  return (
    <footer className="border-border bg-card mt-20 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-card-foreground mb-4 text-lg font-bold">
                {section.title}
              </h3>
              <ul className="text-muted-foreground space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="hover:text-primary transition"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="border-border mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <Logo size="sm" />

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="text-muted-foreground hover:text-primary transition"
                aria-label={social.name}
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d={social.icon} />
                </svg>
              </a>
            ))}
          </div>

          <p className="text-muted-foreground text-sm">
            © 2025 LoreSmith. Craft your destiny.
          </p>
        </div>
      </div>
    </footer>
  );
}
