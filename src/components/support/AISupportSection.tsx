import { Bot, Shield, Heart, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export const AISupportSection = () => {
  const { t, dir } = useLanguage();

  return (
    <Card className="p-6 md:p-8 text-center" dir={dir}>
      <Bot className="h-14 w-14 mx-auto mb-4 text-accent" />
      <h3 className="text-xl md:text-2xl font-semibold mb-4">{t("ai.title")}</h3>
      <p className="text-muted-foreground mb-6 max-w-xl mx-auto text-sm md:text-base">
        {t("ai.description")}
      </p>
      <div className="grid grid-cols-3 gap-3 mb-6 max-w-lg mx-auto">
        <Card className="p-3">
          <Shield className="h-5 w-5 mx-auto mb-1.5 text-primary" />
          <h4 className="font-semibold text-xs">{t("ai.confidential")}</h4>
          <p className="text-xs text-muted-foreground hidden sm:block">{t("ai.private_chats")}</p>
        </Card>
        <Card className="p-3">
          <Heart className="h-5 w-5 mx-auto mb-1.5 text-accent" />
          <h4 className="font-semibold text-xs">{t("ai.trauma_informed")}</h4>
          <p className="text-xs text-muted-foreground hidden sm:block">{t("ai.supportive")}</p>
        </Card>
        <Card className="p-3">
          <Globe className="h-5 w-5 mx-auto mb-1.5 text-secondary" />
          <h4 className="font-semibold text-xs">{t("ai.african_context")}</h4>
          <p className="text-xs text-muted-foreground hidden sm:block">{t("ai.local_help")}</p>
        </Card>
      </div>
      <p className="text-sm text-muted-foreground">
        {t("ai.start_chat")}
      </p>
    </Card>
  );
};
