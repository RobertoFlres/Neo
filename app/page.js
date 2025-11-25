import { Suspense } from 'react'
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import NewsletterGrid from "@/components/NewsletterGrid";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import AccessDeniedMessage from "@/components/AccessDeniedMessage";

export default function Home({ searchParams }) {
  const hasError = searchParams?.error === 'access_denied' || searchParams?.error === 'access_denied_contributor';

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main>
        {hasError && <AccessDeniedMessage />}
        <Hero />
        <FeaturesSection />
        <NewsletterGrid />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}