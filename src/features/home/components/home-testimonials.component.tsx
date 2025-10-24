import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const testimonials = [
  {
    name: 'María G.',
    role: 'Investor, Madrid',
    text: 'Generating my IRPF crypto report used to take days. Now it’s minutes.',
  },
  {
    name: 'Pedro S.',
    role: 'Trader, Barcelona',
    text: 'Finally, a tool that understands Spanish tax requirements for crypto.',
  },
  {
    name: 'Lucía R.',
    role: 'Consultant, Valencia',
    text: 'The reports are clean and ready for Hacienda. Huge time-saver.',
  },
];

export const HomeTestimonials = () => {
  return (
    <section>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Loved by users in Spain</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            What investors and professionals say about Auto Crypto Tax
          </p>
        </div>
        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name}>
              <CardHeader>
                <CardTitle className="text-base">{t.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">“{t.text}”</p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{t.name.split(' ').map(p => p[0]).join('').slice(0,2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

