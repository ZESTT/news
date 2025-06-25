
import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { AppLogo } from '../common/AppLogo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted text-muted-foreground py-16 md:py-20 border-t border-border/50">
      <div className="container max-w-screen-xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div className="lg:col-span-1">
            <div className="mb-6">
              <AppLogo size="md" />
            </div>
            <p className="text-sm mb-3 text-muted-foreground">Empowering truth in the digital age.</p>
            <p className="text-xs text-muted-foreground">&copy; {currentYear} TruthScan AI. All rights reserved.</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#hero" className="text-muted-foreground hover:text-accent transition-colors">Home</Link></li>
              <li><Link href="#features" className="text-muted-foreground hover:text-accent transition-colors">Features</Link></li>
              <li><Link href="/about-us" className="text-muted-foreground hover:text-accent transition-colors">About Us</Link></li> {/* Placeholder link */}
              <li><Link href="/blog" className="text-muted-foreground hover:text-accent transition-colors">Blog</Link></li> {/* Placeholder link */}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Legal & Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#faq" className="text-muted-foreground hover:text-accent transition-colors">FAQ</Link></li>
              <li><Link href="/terms-of-service" className="text-muted-foreground hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><a href="mailto:support@truthscan.ai" className="text-muted-foreground hover:text-accent transition-colors">Contact Support</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Connect With Us</h3>
            <div className="flex space-x-5 mb-4">
              <a href="https://github.com/truthscan" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-accent transition-colors">
                <Github size={22} />
              </a>
              <a href="https://twitter.com/truthscan" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-accent transition-colors">
                <Twitter size={22} />
              </a>
              <a href="https://linkedin.com/company/truthscan" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-accent transition-colors">
                <Linkedin size={22} />
              </a>
            </div>
            <p className="text-xs mt-4 text-muted-foreground">
              Built with Next.js, ShadCN UI, and Genkit.
            </p>
          </div>
        </div>
        <div className="border-t border-border/50 pt-8 text-center text-xs text-muted-foreground">
          <p>TruthScan is an AI-powered tool for educational and informational purposes to help users identify potential misinformation. It is not a substitute for professional advice or comprehensive fact-checking. Always consider multiple sources.</p>
        </div>
      </div>
    </footer>
  );
}
