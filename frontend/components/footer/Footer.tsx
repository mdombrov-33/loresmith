import { footerLinks } from "@/constants/footer-links";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Github, Youtube, Twitter, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto">
        <div className="flex flex-col items-start justify-between gap-x-8 gap-y-10 px-4 py-12 sm:flex-row xl:px-0">
          <div>
            <Logo size="sm" />

            <ul className="mt-6 flex flex-wrap items-center gap-4">
              {footerLinks.map(({ title, href }) => (
                <li key={title}>
                  <Link
                    href={href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subscribe Newsletter */}
          <div className="w-full max-w-xs">
            <h6 className="font-medium">Stay up to date</h6>
            <p className="text-muted-foreground mt-2 text-sm">
              Get notified about new worlds and features
            </p>
            <form className="mt-4 flex items-center gap-2">
              <Input type="email" placeholder="Enter your email" />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col-reverse items-center justify-between gap-x-2 gap-y-5 px-4 py-8 sm:flex-row xl:px-0">
          {/* Copyright */}
          <span className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} LoreSmith. Craft your destiny.
          </span>

          <div className="text-muted-foreground flex items-center gap-5">
            <Link
              href="#"
              target="_blank"
              className="hover:text-foreground transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="sr-only">Discord</span>
            </Link>
            <Link
              href="#"
              target="_blank"
              className="hover:text-foreground transition-colors"
            >
              <Youtube className="h-5 w-5" />
              <span className="sr-only">YouTube</span>
            </Link>
            <Link
              href="#"
              target="_blank"
              className="hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link
              href="#"
              target="_blank"
              className="hover:text-foreground transition-colors"
            >
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
