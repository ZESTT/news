
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { FileText, ScanSearch, Zap, ListChecks, GitFork, MessageSquare, Rocket, Share2, ShieldCheck, AlertTriangle, CheckCircle, UploadCloud, BrainCircuit, Sparkles, ClipboardList } from 'lucide-react';

const featureCards = [
  {
    icon: FileText,
    title: 'Text Analysis',
    description: 'Submit any text article, social media post, or blog comment. Our AI meticulously analyzes the content for linguistic patterns, source credibility, and common misinformation markers.',
    id: 'feature-text',
  },
  {
    icon: ScanSearch,
    title: 'Image OCR & Verify',
    description: 'Upload images like memes, screenshots, or news clippings. We extract text using advanced OCR and then apply the same rigorous analysis to verify its authenticity.',
    id: 'feature-image',
  },
  {
    icon: Zap,
    title: 'Real-Time Results',
    description: 'Get classification labels (e.g., REAL, FAKE) along with confidence scores in near real-time, empowering you to make informed decisions quickly.',
    id: 'feature-realtime',
  },
  {
    icon: ListChecks,
    title: 'Evidence-Based Reasoning',
    description: 'Understand *why* a piece of content is flagged. TruthScan provides insights and, where possible, references to support its classifications.',
    id: 'feature-reasoning',
  },
];

const howItWorksSteps = [
  {
    step: 1,
    icon: UploadCloud,
    title: 'Submit Your Content',
    description: 'Easily paste text or upload an image directly into our intuitive interface. No complex setups required.',
  },
  {
    step: 2,
    icon: BrainCircuit,
    title: 'AI-Powered Analysis',
    description: 'Our sophisticated AI engine, built on cutting-edge models, processes your submission, performing OCR (for images) and deep textual analysis.',
  },
  {
    step: 3,
    icon: Sparkles,
    title: 'Receive Instant Classification',
    description: "View a clear 'REAL' or 'FAKE' label, a confidence score, and detailed reasoning behind the verdict within seconds.",
  },
  {
    step: 4,
    icon: ClipboardList,
    title: 'Review & Act (Coming Soon)',
    description: 'Access your analysis history, understand the evidence, and (soon) share verified information responsibly or report misinformation.',
  },
];

const faqItems = [
  {
    id: 'faq1',
    question: 'Is TruthScan free to use?',
    answer: 'Yes, TruthScan offers a generous free tier for individual users to perform a certain number of analyses per day. We plan to introduce premium features for heavy users and organizations in the future.',
  },
  {
    id: 'faq2',
    question: 'How accurate is the fake-news classification?',
    answer: 'Our AI models are continuously trained on vast datasets and achieve high accuracy. However, no AI is perfect. We provide confidence scores and reasoning to help you interpret the results. Always cross-reference critical information.',
  },
  {
    id: 'faq3',
    question: 'What types of content can I analyze?',
    answer: 'You can analyze text from articles, social media, and websites. For images, we support common formats like PNG and JPEG, from which we extract text for analysis.',
  },
  {
    id: 'faq4',
    question: 'Is my data secure with TruthScan?',
    answer: "We take data privacy seriously. Uploaded content is processed for analysis and not stored long-term beyond what's necessary for providing the service, unless you opt into features like analysis history. We do not share your data with third parties.",
  },
  {
    id: 'faq5',
    question: 'Can I contribute to TruthScan?',
    answer: 'Absolutely! We plan to open-source key components of TruthScan. Check our (upcoming) GitHub repository for ways to contribute code, report issues, or suggest features.',
  },
];

const roadmapItems = [
  { title: "API for Developers", description: "Integrate TruthScan capabilities into your own applications.", icon: GitFork },
  { title: "Multi-Lingual Support", description: "Expanding analysis to more languages.", icon: MessageSquare },
  { title: "Social Media Integration", description: "Connect accounts and analyze content from social platforms.", icon: Share2 },
  { title: "Browser Extension", description: "Analyze content directly in your browser as you surf.", icon: Rocket },
];


export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section id="hero" className="py-20 md:py-32 bg-gradient-to-br from-background to-primary/10 dark:to-primary/10">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline text-foreground mb-6 max-w-3xl mx-auto">
              Detect Fake News Instantly From Text or Images
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Verify news accuracy in seconds with AI-powered analysis. TruthScan empowers you to navigate the digital world with confidence.
            </p>
            <div className="space-x-0 space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" asChild className="w-full sm:w-auto transition-colors duration-200 hover:bg-primary/90">
                <Link href="/signup">Get Started (Free)</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto transition-colors duration-200 hover:bg-accent hover:text-accent-foreground border-secondary hover:border-accent">
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>
            <div className="mt-16 max-w-4xl mx-auto">
              <Image
                src="/images/heroSection.png"
                alt="Hero section image for NewsGuard AI"
                width={2432}
                height={1442}
                className="w-full h-auto rounded-md shadow-2xl ring-1 ring-black/10"
                priority
              />
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section id="features" className="py-16 md:py-24 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center text-foreground mb-12">
              Core Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featureCards.map((feature) => (
                <Card key={feature.id} className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 bg-card">
                  <CardHeader className="items-center text-center">
                    <div className="p-4 bg-accent/10 rounded-full mb-4">
                      <feature.icon className="h-8 w-8 text-accent" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-card-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section - Redesigned */}
        <section id="how-it-works" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center text-foreground mb-16">
              How TruthScan Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
              {howItWorksSteps.map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center p-6 rounded-lg hover:bg-muted/70 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-transparent hover:border-border">
                  <div className="relative mb-6">
                    <div className="flex items-center justify-center h-24 w-24 rounded-full bg-primary/10 text-primary mb-4 ring-4 ring-primary/20 shadow-md">
                      <item.icon className="h-12 w-12" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-9 w-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-base font-bold shadow-xl border-2 border-background">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Demo (Placeholder) */}
        <section id="live-demo" className="py-16 md:py-24 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground mb-8">
              Try TruthScan (Interactive Demo)
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              We're working on an interactive demo for you to experience TruthScan&apos;s power firsthand. Stay tuned!
            </p>
            <Card className="max-w-2xl mx-auto bg-card p-8 rounded-lg shadow-xl text-left">
                <CardTitle className="mb-4 text-lg text-card-foreground">Sample Analysis Result:</CardTitle>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-status-green/10 rounded-md border border-status-green/30">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-status-green" />
                            <span className="font-medium text-status-green">REAL</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Confidence: 92%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-status-amber/10 rounded-md border border-status-amber/30">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-status-amber" />
                            <span className="font-medium text-status-amber-foreground">FAKE</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Confidence: 87%</span>
                    </div>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">
                    This is a visual representation. Actual analysis involves complex AI models.
                </p>
            </Card>
          </div>
        </section>


        {/* Roadmap (Placeholder) */}
        <section id="roadmap" className="py-16 md:py-24 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center text-foreground mb-12">
              Future of TruthScan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {roadmapItems.map((item) => (
                <Card key={item.title} className="text-center shadow-md hover:shadow-lg transition-shadow bg-card">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary">
                      <item.icon className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-card-foreground">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center text-foreground mb-12">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item) => (
                <AccordionItem value={item.id} key={item.id} className="bg-card p-2 rounded-lg mb-2 shadow-sm border-border">
                  <AccordionTrigger className="text-lg hover:no-underline text-card-foreground px-4 py-3 hover:bg-accent/10 rounded-md transition-colors">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed px-4 pt-2 pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}


    
