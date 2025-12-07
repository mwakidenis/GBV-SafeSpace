import { ArrowRight, Shield, Brain, Heart, BookOpen, Sparkles, Lock, Users, MessageSquare, FileCheck, Star, Quote, Globe, Phone, AlertTriangle, ClipboardList, Building, Vibrate, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Navigation from "@/components/Navigation";
import { OnboardingTutorial, useOnboarding } from "@/components/OnboardingTutorial";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { showOnboarding, startTutorial, closeTutorial } = useOnboarding();
  const { t } = useLanguage();
  
  const testimonials = [
    {
      name: "Sarah M.",
      location: "Nairobi, Kenya",
      content: "HERA SafeSpace gave me the courage to document evidence and seek help. The anonymous support community changed my life.",
      avatar: "SM"
    },
    {
      name: "Anonymous",
      location: "East Africa",
      content: "The AI detector helped me identify threatening messages I was receiving. The platform's privacy features made me feel safe to reach out.",
      avatar: "AN"
    },
    {
      name: "Grace K.",
      location: "Mombasa, Kenya",
      content: "Learning digital safety skills through the interactive lessons empowered me to protect myself and help others in my community.",
      avatar: "GK"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navigation />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-20 text-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>
        
        <div className="animate-in fade-in slide-in-from-bottom duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Your Digital Safety Companion</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-foreground">HERA</span>{" "}
            <span className="gradient-hero-text">SafeSpace</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Empowering women and girls across Africa with AI-powered protection, survivor support, and digital literacy education
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/learn">
              <Button size="lg" className="gap-2 shadow-glow text-lg px-8 py-6">
                <BookOpen className="h-5 w-5" />
                Start Learning
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/detect">
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6">
                <Shield className="h-5 w-5" />
                Explore AI Protection
              </Button>
            </Link>
          </div>
          
          {/* Take a Tour Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-muted-foreground hover:text-primary"
            onClick={startTutorial}
          >
            <HelpCircle className="h-4 w-4" />
            {t("onboarding.startTutorial")}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto mt-16 animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
          <Card className="p-6 text-center border-0 shadow-medium">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">AI</div>
            <div className="text-sm text-muted-foreground">Powered Detection</div>
          </Card>
          <Card className="p-6 text-center border-0 shadow-medium">
            <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Safe Support</div>
          </Card>
          <Card className="p-6 text-center border-0 shadow-medium">
            <div className="text-3xl md:text-4xl font-bold text-accent mb-2">100%</div>
            <div className="text-sm text-muted-foreground">Confidential</div>
          </Card>
          <Card className="p-6 text-center border-0 shadow-medium">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              <Globe className="h-8 w-8 mx-auto" />
            </div>
            <div className="text-sm text-muted-foreground">Africa-Focused</div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Three Pillars of <span className="text-primary">Protection</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive tools and resources designed to keep you safe in the digital world
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 shadow-medium hover:shadow-strong transition-smooth hover:-translate-y-2 animate-in fade-in slide-in-from-bottom duration-700 delay-100">
            <div className="inline-flex p-4 bg-gradient-hero rounded-2xl mb-6 shadow-glow">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">AI Detector</h3>
            <p className="text-muted-foreground mb-6">
              Real-time protection using advanced AI to detect and warn you about toxic messages, threats, and harmful content before it reaches you.
            </p>
            <Link to="/detect">
              <Button variant="ghost" className="gap-2 group">
                Learn More
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-smooth" />
              </Button>
            </Link>
          </Card>

          <Card className="p-8 shadow-medium hover:shadow-strong transition-smooth hover:-translate-y-2 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            <div className="inline-flex p-4 bg-accent rounded-2xl mb-6">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Support Portal</h3>
            <p className="text-muted-foreground mb-6">
              Confidential space to document incidents with encrypted storage, generate reports, and connect with verified support resources and trained volunteers.
            </p>
            <Link to="/support">
              <Button variant="ghost" className="gap-2 group">
                Learn More
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-smooth" />
              </Button>
            </Link>
          </Card>

          <Card className="p-8 shadow-medium hover:shadow-strong transition-smooth hover:-translate-y-2 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
            <div className="inline-flex p-4 bg-secondary rounded-2xl mb-6">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Literacy Hub</h3>
            <p className="text-muted-foreground mb-6">
              Interactive lessons on digital safety, online violence prevention, and protective strategies. Earn badges as you learn and grow your digital resilience.
            </p>
            <Link to="/learn">
              <Button variant="ghost" className="gap-2 group">
                Start Learning
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-smooth" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-8 md:p-12 gradient-card shadow-strong max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom duration-700">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="p-6 bg-primary/10 rounded-3xl">
                <Lock className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3">Your Privacy, Our Promise</h3>
              <p className="text-muted-foreground mb-4">
                We use military-grade encryption to protect your data. Your information is never shared without your explicit consent. 
                All support resources are verified and confidential.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">End-to-End Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Survivor-Centered</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Voices of <span className="text-primary">Empowerment</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real stories from women who found strength and support through our platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="p-8 shadow-medium hover:shadow-strong transition-smooth animate-in fade-in slide-in-from-bottom duration-700"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <Quote className="h-8 w-8 text-primary/30 mb-4" />
              <p className="text-muted-foreground mb-6 italic">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {testimonial.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Platform Features Summary */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for <span className="text-primary">Digital Safety</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A comprehensive toolkit designed with your safety and privacy in mind
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 text-center shadow-soft hover:shadow-medium transition-smooth">
            <div className="inline-flex p-3 bg-primary/10 rounded-xl mb-4">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">AI Detection</h3>
            <p className="text-sm text-muted-foreground">
              Real-time analysis of harmful content and threats
            </p>
          </Card>
          
          <Card className="p-6 text-center shadow-soft hover:shadow-medium transition-smooth">
            <div className="inline-flex p-3 bg-secondary/10 rounded-xl mb-4">
              <FileCheck className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold mb-2">Evidence Locker</h3>
            <p className="text-sm text-muted-foreground">
              Securely store and encrypt important documents
            </p>
          </Card>
          
          <Card className="p-6 text-center shadow-soft hover:shadow-medium transition-smooth">
            <div className="inline-flex p-3 bg-accent/10 rounded-xl mb-4">
              <MessageSquare className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Safe Community</h3>
            <p className="text-sm text-muted-foreground">
              Connect anonymously with supportive peers
            </p>
          </Card>
          
          <Card className="p-6 text-center shadow-soft hover:shadow-medium transition-smooth">
            <div className="inline-flex p-3 bg-primary/10 rounded-xl mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Learning Hub</h3>
            <p className="text-sm text-muted-foreground">
              Build digital literacy through interactive lessons
            </p>
          </Card>
        </div>

        {/* New Features Row */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-6">
          <Card className="p-6 text-center shadow-soft hover:shadow-medium transition-smooth border-destructive/20 bg-destructive/5">
            <div className="inline-flex p-3 bg-destructive/10 rounded-xl mb-4">
              <ClipboardList className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="font-semibold mb-2">Incident Reporting</h3>
            <p className="text-sm text-muted-foreground">
              Secure, confidential incident documentation
            </p>
          </Card>
          
          <Card className="p-6 text-center shadow-soft hover:shadow-medium transition-smooth border-orange-500/20 bg-orange-500/5">
            <div className="inline-flex p-3 bg-orange-500/10 rounded-xl mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="font-semibold mb-2">Risk Assessment</h3>
            <p className="text-sm text-muted-foreground">
              Evaluate your safety level and get guidance
            </p>
          </Card>
          
          <Card className="p-6 text-center shadow-soft hover:shadow-medium transition-smooth border-green-500/20 bg-green-500/5">
            <div className="inline-flex p-3 bg-green-500/10 rounded-xl mb-4">
              <Building className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="font-semibold mb-2">Resource Directory</h3>
            <p className="text-sm text-muted-foreground">
              Find verified shelters, legal aid, and counseling
            </p>
          </Card>
          
          <Card className="p-6 text-center shadow-soft hover:shadow-medium transition-smooth border-red-500/20 bg-red-500/5">
            <div className="inline-flex p-3 bg-red-500/10 rounded-xl mb-4">
              <Vibrate className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="font-semibold mb-2">SOS Emergency</h3>
            <p className="text-sm text-muted-foreground">
              Quick exit with shake-to-activate feature
            </p>
          </Card>
        </div>
      </section>

      {/* Emergency Contact Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="p-8 md:p-12 border-2 border-destructive/20 bg-destructive/5 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="p-6 bg-destructive/10 rounded-full">
                <Phone className="h-12 w-12 text-destructive" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-3">Need Immediate Help?</h3>
              <p className="text-muted-foreground mb-4">
                If you're in immediate danger, please contact emergency services or call these helplines:
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="px-4 py-2 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">Kenya Emergency</p>
                  <p className="font-bold text-destructive">999 / 112</p>
                </div>
                <div className="px-4 py-2 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">Gender Violence</p>
                  <p className="font-bold text-destructive">0800 720 990</p>
                </div>
                <div className="px-4 py-2 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">COVAW Kenya</p>
                  <p className="font-bold text-destructive">+254 800 720 553</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom duration-700">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-primary text-primary" />
            ))}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Take Control of Your Digital Safety?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of women and girls who are building safer online experiences across Africa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gap-2 shadow-glow text-lg px-8">
                Create Free Account
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/support">
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                <Users className="h-5 w-5" />
                Get Support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" alt="HERA SafeSpace" className="h-6 w-6" />
              <span className="font-bold">HERA SafeSpace</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Built with <span aria-label="love">❤️</span> for women and girls across Africa • Your safety, your space, your power
            </p>
            <div className="flex gap-4">
              <Link to="/support" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                Support
              </Link>
              <Link to="/forum" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                Community
              </Link>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Onboarding Tutorial */}
      <OnboardingTutorial 
        isOpen={showOnboarding} 
        onClose={closeTutorial}
      />
    </div>
  );
};

export default Index;
