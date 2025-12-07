import { useState } from "react";
import { AlertCircle, Brain, Shield, Zap, Send, AlertTriangle, RefreshCw, Copy, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AIChatAssistant from "@/components/AIChatAssistant";

interface DetectionResult {
  is_safe: boolean;
  categories: string[];
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  explanation: string;
}

interface RewriteResult {
  original: string;
  rewritten: string;
  changes: string[];
}

const Detect = () => {
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [rewriteResult, setRewriteResult] = useState<RewriteResult | null>(null);
  const [rewriting, setRewriting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("detect");

  const analyzeText = async () => {
    if (!text.trim()) {
      toast.error("Please enter text to analyze");
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setRewriteResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("detect-toxicity", {
        body: { text },
      });

      if (error) throw error;

      setResult(data);
      
      if (!data.is_safe) {
        toast.warning(`Potentially harmful content detected: ${data.severity} severity`);
      } else {
        toast.success("Text appears safe");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to analyze text";
      toast.error(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const rewriteText = async () => {
    if (!text.trim()) {
      toast.error("Please enter text to rewrite");
      return;
    }

    setRewriting(true);
    setRewriteResult(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `Please rewrite the following message to be kinder, more respectful, and constructive while maintaining the core intent. If the message is already appropriate, return it as is. Respond ONLY with JSON in this exact format:
{
  "original": "the original text",
  "rewritten": "the improved version",
  "changes": ["list of changes made"]
}

Text to rewrite: "${text}"`,
              },
            ],
            context: "general",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to rewrite");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const json = JSON.parse(line.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) fullContent += content;
              } catch {
                // Ignore JSON parsing errors for incomplete chunks
              }
            }
          }
        }
      }

      // Parse the JSON from the response
      const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setRewriteResult({
          original: text,
          rewritten: parsed.rewritten,
          changes: parsed.changes || [],
        });
        toast.success("Text rewritten successfully!");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to rewrite text";
      toast.error(errorMessage);
    } finally {
      setRewriting(false);
    }
  };

  const copyRewritten = () => {
    if (rewriteResult?.rewritten) {
      navigator.clipboard.writeText(rewriteResult.rewritten);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const useRewritten = () => {
    if (rewriteResult?.rewritten) {
      setText(rewriteResult.rewritten);
      setRewriteResult(null);
      setResult(null);
      toast.success("Using rewritten text");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-destructive/70 text-white";
      case "medium": return "bg-orange-500 text-white";
      case "low": return "bg-yellow-500 text-black";
      default: return "bg-muted";
    }
  };

  const exampleTexts = [
    { label: "Threat", text: "I'm going to make you regret this. You'll see what happens when you mess with me." },
    { label: "Harassment", text: "You're so stupid. Why don't you just go away? Nobody wants you here." },
    { label: "Safe", text: "I really appreciate your help with this project. Your insights have been valuable." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom duration-700">
          <div className="inline-flex items-center justify-center p-3 bg-secondary/10 rounded-2xl mb-4">
            <Brain className="h-8 w-8 text-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI Digital Violence <span className="text-secondary">Detector</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time protection powered by AI. Detect toxic, abusive, and threatening messages before they cause harm.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center shadow-medium animate-in fade-in slide-in-from-bottom duration-700 delay-100">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Real-Time Detection</h3>
            <p className="text-sm text-muted-foreground">
              AI analyzes messages instantly to flag harmful content
            </p>
          </Card>

          <Card className="p-6 text-center shadow-medium animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            <div className="inline-flex items-center justify-center p-3 bg-secondary/10 rounded-xl mb-4">
              <AlertCircle className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold mb-2">Smart Alerts</h3>
            <p className="text-sm text-muted-foreground">
              Get warnings before sending or reading unsafe messages
            </p>
          </Card>

          <Card className="p-6 text-center shadow-medium animate-in fade-in slide-in-from-bottom duration-700 delay-300">
            <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-xl mb-4">
              <Zap className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Safe Rewrite</h3>
            <p className="text-sm text-muted-foreground">
              AI suggests safer alternatives for potentially harmful messages
            </p>
          </Card>
        </div>

        <Card className="p-8 md:p-12 shadow-strong animate-in fade-in slide-in-from-bottom duration-700 delay-400 mb-12">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="detect">Detect Toxicity</TabsTrigger>
              <TabsTrigger value="rewrite">Safe Rewrite</TabsTrigger>
            </TabsList>

            <TabsContent value="detect" className="space-y-4">
              <div className="max-w-2xl mx-auto space-y-4">
                <Textarea
                  placeholder="Enter text to analyze for toxicity, threats, or harassment..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  className="resize-none"
                />
                
                {/* Example texts */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Try examples:</span>
                  {exampleTexts.map((example) => (
                    <Button
                      key={example.label}
                      variant="outline"
                      size="sm"
                      onClick={() => setText(example.text)}
                    >
                      {example.label}
                    </Button>
                  ))}
                </div>
                
                <Button onClick={analyzeText} disabled={analyzing} className="w-full gap-2">
                  {analyzing ? (
                    <>
                      <Brain className="h-5 w-5 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Analyze Text
                    </>
                  )}
                </Button>

                {result && (
                  <Card className={`p-6 ${result.is_safe ? 'border-green-500' : 'border-destructive'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          {result.is_safe ? "✓ Text Appears Safe" : "⚠ Potentially Harmful Content"}
                        </h3>
                        <p className="text-sm text-muted-foreground">{result.explanation}</p>
                      </div>
                      {!result.is_safe && (
                        <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
                      )}
                    </div>

                    {!result.is_safe && result.categories.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Detected Issues:</p>
                        <div className="flex flex-wrap gap-2">
                          {result.categories.map((category) => (
                            <Badge key={category} variant="destructive">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span>Severity:</span>
                      <Badge className={getSeverityColor(result.severity)}>
                        {result.severity.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span>Confidence:</span>
                      <span className="font-medium">{(result.confidence * 100).toFixed(0)}%</span>
                    </div>

                    {!result.is_safe && (
                      <Button
                        onClick={() => {
                          setActiveTab("rewrite");
                          rewriteText();
                        }}
                        variant="outline"
                        className="w-full mt-4 gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Get Safe Rewrite Suggestion
                      </Button>
                    )}
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="rewrite" className="space-y-4">
              <div className="max-w-2xl mx-auto space-y-4">
                <Textarea
                  placeholder="Enter a message you'd like to make kinder and more respectful..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  className="resize-none"
                />
                
                <Button onClick={rewriteText} disabled={rewriting} className="w-full gap-2">
                  {rewriting ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Rewriting...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Rewrite Safely
                    </>
                  )}
                </Button>

                {rewriteResult && (
                  <Card className="p-6 border-green-500">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Suggested Rewrite
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Original:</p>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                          {rewriteResult.original}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Rewritten:</p>
                        <p className="text-sm bg-green-500/10 p-3 rounded border border-green-500/30">
                          {rewriteResult.rewritten}
                        </p>
                      </div>

                      {rewriteResult.changes.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Changes Made:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {rewriteResult.changes.map((change, i) => (
                              <li key={i}>{change}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button onClick={copyRewritten} variant="outline" className="flex-1 gap-2">
                          {copied ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button onClick={useRewritten} className="flex-1 gap-2">
                          Use This Version
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="animate-in fade-in slide-in-from-left duration-700 delay-600">
            <h3 className="text-xl font-semibold mb-4">How It Works</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-medium mb-1">Paste or Type Text</h4>
                  <p className="text-sm text-muted-foreground">
                    Enter any message you've received or want to send
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-medium mb-1">AI Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Our AI scans for toxicity, threats, harassment, and more
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-medium mb-1">Get Results & Suggestions</h4>
                  <p className="text-sm text-muted-foreground">
                    See detailed analysis and get safer alternatives if needed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-right duration-700 delay-600">
            <h3 className="text-xl font-semibold mb-4">What We Detect</h3>
            <div className="space-y-3">
              {[
                "Cyberbullying and harassment",
                "Threats and intimidation",
                "Hate speech and discrimination",
                "Sexual harassment and grooming",
                "Impersonation attempts",
                "Blackmail and extortion",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-secondary flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* AI Chat Assistant - Detection Context */}
      <AIChatAssistant context="detect" />
    </div>
  );
};

export default Detect;
