import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export const HomeFooter = () => {
  return (
    <footer>
      <Separator />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2025 Auto Crypto Tax. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground">Características</Link>
            <Link href="#pricing" className="hover:text-foreground">Precios</Link>
            <Link href="#faq" className="hover:text-foreground">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

