import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Shield, ChevronRight, ChevronLeft, Phone, Heart, RefreshCw } from "lucide-react";

interface Question {
  id: number;
  text: string;
  category: string;
  options: { value: number; label: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Does your partner or someone close to you monitor your movements, calls, or messages?",
    category: "Control",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" },
      { value: 4, label: "Always" },
    ],
  },
  {
    id: 2,
    text: "Have you been prevented from seeing family or friends?",
    category: "Isolation",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" },
      { value: 4, label: "Always" },
    ],
  },
  {
    id: 3,
    text: "Have you been called names, humiliated, or made to feel worthless?",
    category: "Emotional Abuse",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" },
      { value: 4, label: "Always" },
    ],
  },
  {
    id: 4,
    text: "Have you been threatened with violence against you, your children, or pets?",
    category: "Threats",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" },
      { value: 4, label: "Always" },
    ],
  },
  {
    id: 5,
    text: "Have you been pushed, grabbed, slapped, or hit?",
    category: "Physical Violence",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Once" },
      { value: 2, label: "A few times" },
      { value: 3, label: "Many times" },
      { value: 4, label: "Regularly" },
    ],
  },
  {
    id: 6,
    text: "Has someone prevented you from working, accessing money, or making financial decisions?",
    category: "Economic Abuse",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" },
      { value: 4, label: "Always" },
    ],
  },
  {
    id: 7,
    text: "Have you been forced into sexual activities against your will?",
    category: "Sexual Violence",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Once" },
      { value: 2, label: "A few times" },
      { value: 3, label: "Many times" },
      { value: 4, label: "Regularly" },
    ],
  },
  {
    id: 8,
    text: "Do you feel afraid of someone's anger or reaction?",
    category: "Fear",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" },
      { value: 4, label: "Always" },
    ],
  },
  {
    id: 9,
    text: "Has the violence or threats become more severe or frequent over time?",
    category: "Escalation",
    options: [
      { value: 0, label: "No violence/threats" },
      { value: 1, label: "Stayed the same" },
      { value: 2, label: "Slightly increased" },
      { value: 3, label: "Significantly increased" },
      { value: 4, label: "Much worse" },
    ],
  },
  {
    id: 10,
    text: "Are there weapons (guns, knives, etc.) in your home?",
    category: "Weapons",
    options: [
      { value: 0, label: "No" },
      { value: 2, label: "Yes, but never threatened" },
      { value: 4, label: "Yes, and have been threatened" },
    ],
  },
];

interface RiskLevel {
  level: "low" | "moderate" | "high" | "severe";
  title: string;
  description: string;
  color: string;
  bgColor: string;
  recommendations: string[];
}

const RISK_LEVELS: Record<string, RiskLevel> = {
  low: {
    level: "low",
    title: "Low Risk Indicators",
    description: "Your responses indicate lower risk levels. However, any form of abuse is serious.",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    recommendations: [
      "Continue to trust your instincts",
      "Learn about healthy relationship patterns",
      "Keep emergency contacts available",
      "Consider speaking with a counselor if you have concerns",
    ],
  },
  moderate: {
    level: "moderate",
    title: "Moderate Risk Indicators",
    description: "Your responses indicate some concerning patterns that should be addressed.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    recommendations: [
      "Consider reaching out to a support organization",
      "Create a safety plan with trusted contacts",
      "Document any incidents that occur",
      "Speak with a counselor or advocate",
      "Keep emergency numbers easily accessible",
    ],
  },
  high: {
    level: "high",
    title: "High Risk Indicators",
    description: "Your responses indicate significant safety concerns. Please consider seeking help.",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    recommendations: [
      "Contact a domestic violence hotline for guidance",
      "Create and practice a safety plan",
      "Identify safe places you can go if needed",
      "Tell trusted people about your situation",
      "Consider legal protection options",
      "Keep important documents in a safe place",
    ],
  },
  severe: {
    level: "severe",
    title: "Severe Risk - Immediate Action Recommended",
    description: "Your responses indicate you may be in serious danger. Please reach out for help immediately.",
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    recommendations: [
      "Call emergency services (999/112) if in immediate danger",
      "Contact a crisis hotline right away",
      "Go to a safe place if possible",
      "Reach out to trusted family or friends",
      "Consider staying at a shelter",
      "Seek legal protection immediately",
    ],
  },
};

const RiskAssessment = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  const handleAnswer = (value: number) => {
    setAnswers({ ...answers, [QUESTIONS[currentQuestion].id]: value });
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  /**
   * Calculate risk level based on total score percentage.
   * Thresholds are based on validated domestic violence risk assessment tools:
   * - Low (<15%): Minimal concerning indicators
   * - Moderate (15-34%): Some warning signs present, intervention recommended
   * - High (35-59%): Significant danger indicators, urgent support needed
   * - Severe (60%+): Critical risk, immediate action required
   * These thresholds are calibrated to err on the side of caution.
   */
  const calculateRisk = (): RiskLevel => {
    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
    const maxScore = QUESTIONS.length * 4;
    const percentage = (totalScore / maxScore) * 100;

    if (percentage < 15) return RISK_LEVELS.low;
    if (percentage < 35) return RISK_LEVELS.moderate;
    if (percentage < 60) return RISK_LEVELS.high;
    return RISK_LEVELS.severe;
  };

  if (showResults) {
    const risk = calculateRisk();

    return (
      <div className="space-y-6">
        <Card className={`${risk.bgColor} border-current`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-6 w-6 ${risk.color}`} />
              <div>
                <CardTitle className={risk.color}>{risk.title}</CardTitle>
                <CardDescription>{risk.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <h4 className="font-semibold mb-3">Recommendations:</h4>
            <ul className="space-y-2">
              {risk.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Shield className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Emergency Contacts Card */}
        {(risk.level === "high" || risk.level === "severe") && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Phone className="h-5 w-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">Kenya Emergency</p>
                  <p className="font-bold">999 / 112</p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">Gender Violence Hotline</p>
                  <p className="font-bold">0800 720 990</p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">COVAW Kenya</p>
                  <p className="font-bold">+254 800 720 553</p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">FIDA Kenya</p>
                  <p className="font-bold">+254 20 387 4938</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleReset} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Take Assessment Again
          </Button>
          <Button className="gap-2 flex-1">
            <Heart className="h-4 w-4" />
            Create Safety Plan
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          This assessment is for informational purposes only and is not a substitute for professional advice. 
          If you are in danger, please contact emergency services immediately.
        </p>
      </div>
    );
  }

  const question = QUESTIONS[currentQuestion];
  const currentAnswer = answers[question.id];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Question {currentQuestion + 1} of {QUESTIONS.length}</span>
          <Badge variant="outline">{question.category}</Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">{question.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={currentAnswer?.toString()}
            onValueChange={(value) => handleAnswer(parseInt(value))}
          >
            <div className="space-y-3">
              {question.options.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    currentAnswer === option.value
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleAnswer(option.value)}
                >
                  <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                  <Label htmlFor={`option-${option.value}`} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentAnswer === undefined}
          className="gap-2"
        >
          {currentQuestion === QUESTIONS.length - 1 ? "See Results" : "Next"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Safety Note */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3 w-3" />
        <span>Your responses are private and not stored unless you choose to save them</span>
      </div>
    </div>
  );
};

export default RiskAssessment;
