import { Lock, FileText, Users, Phone, Heart, Shield, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export const EmergencyResourcesSection = () => {
  const { t, dir } = useLanguage();

  return (
    <div className="space-y-6" dir={dir}>
      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 text-center shadow-medium">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-xl mb-3">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-sm mb-1">{t("emergency.encrypted_storage")}</h3>
          <p className="text-xs text-muted-foreground">
            {t("emergency.military_encryption")}
          </p>
        </Card>

        <Card className="p-4 text-center shadow-medium">
          <div className="inline-flex items-center justify-center p-2 bg-secondary/10 rounded-xl mb-3">
            <FileText className="h-5 w-5 text-secondary" />
          </div>
          <h3 className="font-semibold text-sm mb-1">{t("emergency.digital_reports")}</h3>
          <p className="text-xs text-muted-foreground">
            {t("emergency.legal_documentation")}
          </p>
        </Card>

        <Card className="p-4 text-center shadow-medium">
          <div className="inline-flex items-center justify-center p-2 bg-accent/10 rounded-xl mb-3">
            <Users className="h-5 w-5 text-accent" />
          </div>
          <h3 className="font-semibold text-sm mb-1">{t("emergency.connect_help")}</h3>
          <p className="text-xs text-muted-foreground">
            {t("emergency.verified_resources")}
          </p>
        </Card>
      </div>

      <h3 className="text-xl font-semibold text-center">{t("emergency.title")}</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Kenya Resources */}
        <Card className="p-5 shadow-medium hover:shadow-strong transition-smooth border-[hsl(140,60%,35%)]/30">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[hsl(140,60%,35%)]/10 rounded-xl flex-shrink-0">
              <MapPin className="h-5 w-5 text-[hsl(140,60%,35%)]" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold mb-2 flex items-center gap-2 flex-wrap">
                {t("emergency.kenya_resources")}
                <span className="text-xs bg-[hsl(140,60%,35%)]/20 px-2 py-0.5 rounded">🇰🇪</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong className="text-xs">Gender Violence Recovery Centre:</strong>
                  <p className="text-primary text-sm">+254 709 400 200</p>
                </div>
                <div>
                  <strong className="text-xs">COVAW:</strong>
                  <p className="text-primary text-sm">+254 800 720 553</p>
                </div>
                <div>
                  <strong className="text-xs">FIDA Kenya:</strong>
                  <p className="text-primary text-sm">+254 20 387 4938</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* International Crisis */}
        <Card className="p-5 shadow-medium hover:shadow-strong transition-smooth">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-destructive/10 rounded-xl flex-shrink-0">
              <Phone className="h-5 w-5 text-destructive" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold mb-2">{t("emergency.international_crisis")}</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong className="text-xs">{t("emergency.emergency_services")}:</strong>
                  <p className="text-primary text-sm">112 or 999 (Kenya)</p>
                </div>
                <div>
                  <strong className="text-xs">{t("emergency.crisis_text")}:</strong>
                  <p className="text-primary text-sm">Text HOME to local number</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Mental Health */}
        <Card className="p-5 shadow-medium hover:shadow-strong transition-smooth">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent/10 rounded-xl flex-shrink-0">
              <Heart className="h-5 w-5 text-accent" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold mb-2">{t("emergency.mental_health")}</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong className="text-xs">Kenya Red Cross Counseling:</strong>
                  <p className="text-primary text-sm">1199</p>
                </div>
                <div>
                  <strong className="text-xs">Befrienders Kenya:</strong>
                  <p className="text-primary text-sm">+254 722 178 177</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Legal Aid */}
        <Card className="p-5 shadow-medium hover:shadow-strong transition-smooth">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[hsl(45,100%,50%)]/20 rounded-xl flex-shrink-0">
              <FileText className="h-5 w-5 text-[hsl(45,100%,50%)]" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold mb-2">{t("emergency.legal_aid")}</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong className="text-xs">National Legal Aid Service:</strong>
                  <p className="text-primary text-sm">+254 800 720 152</p>
                </div>
                <div>
                  <strong className="text-xs">Kituo Cha Sheria:</strong>
                  <p className="text-primary text-sm">+254 20 387 4220</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-muted/50 border-2 border-primary/20">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm mb-1">{t("emergency.safety_priority")}</h4>
            <p className="text-xs text-muted-foreground">
              {t("emergency.safety_message")}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
