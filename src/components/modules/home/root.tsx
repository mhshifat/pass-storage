"use client";

import { useAuth } from "@/components/providers/auth";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Button } from "@/components/ui/button";
import { ROUTE_PATHS } from "@/lib/constants";
import {
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Lock,
  Smartphone,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";


export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  const isSignedIn = !!user?.id;

  // Helper function to safely map features
  const renderFeatures = (featureKey: string) => {
    const features = t(featureKey, { returnObjects: true });
    if (Array.isArray(features)) {
      return (features as unknown as string[]).map((feature: string, index: number) => (
        <li key={index} className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          <span>{feature}</span>
        </li>
      ));
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background to-secondary/20 z-0"></div>
        
        {/* Header */}
        <header className="relative z-10 container max-w-7xl mx-auto px-4 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8" />
            <h1 className="text-3xl font-bold">{t('app.name')}</h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {!isSignedIn ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => router.push(ROUTE_PATHS.SIGN_IN)}
                  className="hidden sm:flex"
                >
                  {t('header.signin')}
                </Button>
                <Button 
                  onClick={() => router.push(ROUTE_PATHS.SIGN_UP)}
                >
                  {t('header.signup')}
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => router.push(ROUTE_PATHS.DASHBOARD)}
              >
                {t('header.dashboard')}
              </Button>
            )}
          </div>
        </header>

        {/* Hero content */}
        <section className="relative z-10 container max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="text-primary">{t('app.tagline').split(' ')[0]}</span> {t('app.tagline').split(' ').slice(1).join(' ')}
              </h1>
              <p className="text-xl text-muted-foreground">
                {t('hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg"
                  onClick={() => router.push(ROUTE_PATHS.SIGN_UP)}
                  className="gap-2"
                >
                  {t('hero.cta.start')} <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => router.push(ROUTE_PATHS.SIGN_IN)}
                >
                  {t('hero.cta.signin')}
                </Button>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="relative bg-secondary/20 border border-border rounded-lg shadow-lg backdrop-blur-sm p-2">
                <img 
                  src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800" 
                  alt="PassStorage Dashboard Preview" 
                  className="rounded-md shadow-md"
                />
                <div className="absolute -bottom-4 -right-4 bg-accent p-3 rounded-lg border border-border shadow-lg backdrop-blur-lg">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Features Section */}
      <section className="bg-card py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('features.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('features.description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-background p-6 rounded-lg border border-border">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('features.encryption.title')}</h3>
              <p className="text-muted-foreground">
                {t('features.encryption.description')}
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-background p-6 rounded-lg border border-border">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('features.crossPlatform.title')}</h3>
              <p className="text-muted-foreground">
                {t('features.crossPlatform.description')}
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-background p-6 rounded-lg border border-border">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('features.sharing.title')}</h3>
              <p className="text-muted-foreground">
                {t('features.sharing.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 container max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">{t('howItWorks.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('howItWorks.description')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-bold mb-2">{t('howItWorks.step1.title')}</h3>
            <p className="text-muted-foreground">
              {t('howItWorks.step1.description')}
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-bold mb-2">{t('howItWorks.step2.title')}</h3>
            <p className="text-muted-foreground">
              {t('howItWorks.step2.description')}
            </p>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-bold mb-2">{t('howItWorks.step3.title')}</h3>
            <p className="text-muted-foreground">
              {t('howItWorks.step3.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-card py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('pricing.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('pricing.description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-background p-6 rounded-lg border border-border flex flex-col">
              <h3 className="text-xl font-bold mb-2">{t('pricing.free.name')}</h3>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">{t('pricing.perMonth')}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {renderFeatures('pricing.free.features')}
              </ul>
              <Button 
                variant="outline" 
                className="w-full mt-auto"
                onClick={() => router.push(ROUTE_PATHS.SIGN_UP)}
              >
                {t('pricing.free.cta')}
              </Button>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-accent p-6 rounded-lg border-2 border-primary shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary px-3 py-1 rounded-full text-sm font-medium text-primary-foreground">
                {t('pricing.pro.label')}
              </div>
              <h3 className="text-xl font-bold mb-2">{t('pricing.pro.name')}</h3>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-4xl font-bold">$9</span>
                <span className="text-muted-foreground">{t('pricing.perMonth')}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {renderFeatures('pricing.pro.features')}
              </ul>
              <Button 
                className="w-full"
                // onClick={() => router.push('/subscription')}
              >
                {t('pricing.pro.cta')}
              </Button>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-background p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold mb-2">{t('pricing.enterprise.name')}</h3>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground">{t('pricing.perMonth')}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {renderFeatures('pricing.enterprise.features')}
              </ul>
              <Button 
                variant="outline" 
                className="w-full"
                // onClick={() => navigate('/subscription')}
              >
                {t('pricing.enterprise.cta')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 container max-w-7xl mx-auto px-4">
        <div className="bg-accent p-8 sm:p-12 rounded-2xl border border-border text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => router.push(ROUTE_PATHS.SIGN_UP)}
              className="gap-2"
            >
              {t('header.signup')} <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push(ROUTE_PATHS.SIGN_IN)}
            >
              {t('header.signin')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <ShieldCheck className="h-6 w-6" />
              <span className="text-xl font-bold">{t('app.name')}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {t('app.name')}. {t('footer.rights')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
