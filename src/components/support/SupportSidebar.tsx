import { Heart, FileText, Users, Phone, Shield, ClipboardList, AlertCircle, Building, Bot, Lock, MessageCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface SupportSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const getMenuItems = (t: (key: string) => string) => [
  {
    id: "resources",
    label: t("sidebar.emergency_resources"),
    icon: Phone,
    description: t("sidebar.crisis_help")
  },
  {
    id: "report",
    label: t("sidebar.report_incident"),
    icon: ClipboardList,
    description: t("sidebar.document_safely")
  },
  {
    id: "contacts",
    label: t("sidebar.trusted_contacts"),
    icon: Users,
    description: t("sidebar.safe_people")
  },
  {
    id: "risk",
    label: t("sidebar.risk_assessment"),
    icon: AlertCircle,
    description: t("sidebar.check_safety")
  },
  {
    id: "directory",
    label: t("sidebar.resource_directory"),
    icon: Building,
    description: t("sidebar.find_help")
  },
  {
    id: "safety-plan",
    label: t("sidebar.safety_plan"),
    icon: Shield,
    description: t("sidebar.escape_plan")
  },
  {
    id: "ai-support",
    label: t("sidebar.ai_support"),
    icon: Bot,
    description: t("sidebar.chat_hera")
  }
];

const getQuickLinks = (t: (key: string) => string) => [
  { icon: Lock, label: t("sidebar.evidence_locker"), path: "/evidence" },
  { icon: MessageCircle, label: t("sidebar.community_forum"), path: "/forum" },
  { icon: BookOpen, label: t("sidebar.learn_safety"), path: "/learn" }
];

export const SupportSidebar = ({ activeTab, onTabChange, className }: SupportSidebarProps) => {
  const { t, dir } = useLanguage();
  const menuItems = getMenuItems(t);
  const quickLinks = getQuickLinks(t);

  return (
    <div className={cn("space-y-6", className)} dir={dir}>
      {/* Main Navigation */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-muted-foreground px-3 mb-3">{t("sidebar.support_tools")}</h3>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                dir === "rtl" && "text-right",
                isActive
                  ? "bg-primary/10 text-primary border-l-4 border-primary rtl:border-l-0 rtl:border-r-4"
                  : "hover:bg-muted text-foreground hover:text-primary"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
              <div className="min-w-0">
                <p className={cn("font-medium text-sm truncate", isActive && "text-primary")}>{item.label}</p>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-muted-foreground px-3 mb-3">{t("sidebar.quick_access")}</h3>
        <div className="space-y-1">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.path}
                href={link.path}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{link.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { getMenuItems };
