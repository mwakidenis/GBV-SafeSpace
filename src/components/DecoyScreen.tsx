import { Calculator, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface DecoyScreenProps {
  onExit: () => void;
}

export const DecoyScreen = ({ onExit }: DecoyScreenProps) => {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");

  const handleNumber = (num: string) => {
    setDisplay(display === "0" ? num : display + num);
  };

  const handleOperator = (op: string) => {
    setEquation(display + " " + op);
    setDisplay("0");
  };

  const handleClear = () => {
    setDisplay("0");
    setEquation("");
  };

  const handleEquals = () => {
    try {
      const result = eval(equation + " " + display);
      setDisplay(String(result));
      setEquation("");
    } catch {
      setDisplay("Error");
    }
  };

  // Secret exit: Triple click on display
  const [clickCount, setClickCount] = useState(0);
  const handleDisplayClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 3) {
      onExit();
      setClickCount(0);
    }
    setTimeout(() => setClickCount(0), 2000);
  };

  return (
    <div className="fixed inset-0 bg-background z-[100] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Calculator</h2>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onExit}
            className="opacity-20 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div 
          className="bg-muted p-4 rounded-lg mb-4 text-right cursor-pointer"
          onClick={handleDisplayClick}
        >
          {equation && <div className="text-sm text-muted-foreground">{equation}</div>}
          <div className="text-3xl font-mono">{display}</div>
          <div className="text-xs text-muted-foreground mt-2 opacity-50">
            Triple-tap to exit
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {["7", "8", "9", "/"].map((btn) => (
            <Button
              key={btn}
              variant="outline"
              onClick={() => {
                if (btn === "/") handleOperator(btn);
                else handleNumber(btn);
              }}
            >
              {btn}
            </Button>
          ))}
          {["4", "5", "6", "*"].map((btn) => (
            <Button
              key={btn}
              variant="outline"
              onClick={() => {
                if (btn === "*") handleOperator(btn);
                else handleNumber(btn);
              }}
            >
              {btn}
            </Button>
          ))}
          {["1", "2", "3", "-"].map((btn) => (
            <Button
              key={btn}
              variant="outline"
              onClick={() => {
                if (btn === "-") handleOperator(btn);
                else handleNumber(btn);
              }}
            >
              {btn}
            </Button>
          ))}
          {["C", "0", "=", "+"].map((btn) => (
            <Button
              key={btn}
              variant={btn === "=" ? "default" : "outline"}
              onClick={() => {
                if (btn === "C") handleClear();
                else if (btn === "=") handleEquals();
                else if (btn === "+") handleOperator(btn);
                else handleNumber(btn);
              }}
            >
              {btn}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};
