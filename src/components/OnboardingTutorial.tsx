import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  Heart,
  BookOpen,
  Brain,
  Lock,
  MessageSquare,
  AlertTriangle,
  FileCheck,
  Users,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Building,
  ClipboardList,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ONBOARDING_STORAGE_KEY = "hera-onboarding-completed";

interface OnboardingStep {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  features?: { icon: React.ReactNode; textKey: string }[];
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    icon: <Shield className="h-12 w-12 text-primary" />,
    titleKey: "onboarding.welcome.title",
    descriptionKey: "onboarding.welcome.description",
    features: [
      { icon: <Lock className="h-4 w-4" />, textKey: "onboarding.welcome.feature1" },
      { icon: <Heart className="h-4 w-4" />, textKey: "onboarding.welcome.feature2" },
      { icon: <Sparkles className="h-4 w-4" />, textKey: "onboarding.welcome.feature3" },
    ],
  },
  {
    id: "ai-protection",
    icon: <Brain className="h-12 w-12 text-primary" />,
    titleKey: "onboarding.ai.title",
    descriptionKey: "onboarding.ai.description",
    features: [
      { icon: <Shield className="h-4 w-4" />, textKey: "onboarding.ai.feature1" },
      { icon: <AlertTriangle className="h-4 w-4" />, textKey: "onboarding.ai.feature2" },
      { icon: <MessageSquare className="h-4 w-4" />, textKey: "onboarding.ai.feature3" },
    ],
  },
  {
    id: "support",
    icon: <Heart className="h-12 w-12 text-accent" />,
    titleKey: "onboarding.support.title",
    descriptionKey: "onboarding.support.description",
    features: [
      { icon: <Phone className="h-4 w-4" />, textKey: "onboarding.support.feature1" },
      { icon: <ClipboardList className="h-4 w-4" />, textKey: "onboarding.support.feature2" },
      { icon: <Users className="h-4 w-4" />, textKey: "onboarding.support.feature3" },
    ],
  },
  {
    id: "safety-tools",
    icon: <Lock className="h-12 w-12 text-secondary" />,
    titleKey: "onboarding.safety.title",
    descriptionKey: "onboarding.safety.description",
    features: [
      { icon: <FileCheck className="h-4 w-4" />, textKey: "onboarding.safety.feature1" },
      { icon: <AlertTriangle className="h-4 w-4" />, textKey: "onboarding.safety.feature2" },
      { icon: <Building className="h-4 w-4" />, textKey: "onboarding.safety.feature3" },
    ],
  },
  {
    id: "learning",
    icon: <BookOpen className="h-12 w-12 text-secondary" />,
    titleKey: "onboarding.learning.title",
    descriptionKey: "onboarding.learning.description",
    features: [
      { icon: <Sparkles className="h-4 w-4" />, textKey: "onboarding.learning.feature1" },
      { icon: <CheckCircle className="h-4 w-4" />, textKey: "onboarding.learning.feature2" },
      { icon: <Users className="h-4 w-4" />, textKey: "onboarding.learning.feature3" },
    ],
  },
  {
    id: "community",
    icon: <Users className="h-12 w-12 text-primary" />,
    titleKey: "onboarding.community.title",
    descriptionKey: "onboarding.community.description",
    features: [
      { icon: <MessageSquare className="h-4 w-4" />, textKey: "onboarding.community.feature1" },
      { icon: <Lock className="h-4 w-4" />, textKey: "onboarding.community.feature2" },
      { icon: <Heart className="h-4 w-4" />, textKey: "onboarding.community.feature3" },
    ],
  },
];

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const OnboardingTutorial = ({ isOpen, onClose, onComplete }: OnboardingTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { t, dir } = useLanguage();

  const totalSteps = onboardingSteps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const step = onboardingSteps[currentStep];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setCurrentStep(0);
    onComplete?.();
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setCurrentStep(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg" dir={dir}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-2xl">{step.icon}</div>
          </div>
          <DialogTitle className="text-center text-xl">
            {t(step.titleKey)}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t(step.descriptionKey)}
          </DialogDescription>
        </DialogHeader>

        {/* Features list */}
        {step.features && (
          <div className="space-y-3 py-4">
            {step.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <span className="text-sm">{t(feature.textKey)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Progress indicator */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            {t("onboarding.step")} {currentStep + 1} {t("onboarding.of")} {totalSteps}
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleSkip} className="sm:mr-auto">
            {t("onboarding.skip")}
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("onboarding.previous")}
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep < totalSteps - 1 ? (
                <>
                  {t("onboarding.next")}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  {t("onboarding.getStarted")}
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Hook to manage onboarding state
export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    // Initialize from localStorage to prevent flash
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";
  });

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    const isCompleted = completed === "true";
    setHasCompletedOnboarding(isCompleted);
    
    // Auto-show onboarding for first-time visitors
    if (!isCompleted) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTutorial = () => {
    setShowOnboarding(true);
  };

  const closeTutorial = () => {
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setHasCompletedOnboarding(false);
  };

  return {
    showOnboarding,
    hasCompletedOnboarding,
    startTutorial,
    closeTutorial,
    resetOnboarding,
  };
};

export default OnboardingTutorial;
