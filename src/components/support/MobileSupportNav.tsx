import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SupportSidebar, getMenuItems } from "./SupportSidebar";
import { useLanguage } from "@/contexts/LanguageContext";

interface MobileSupportNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileSupportNav = ({ activeTab, onTabChange }: MobileSupportNavProps) => {
  const [open, setOpen] = useState(false);
  const { t, dir } = useLanguage();
  
  const menuItems = getMenuItems(t);
  const currentItem = menuItems.find(item => item.id === activeTab);
  const CurrentIcon = currentItem?.icon;

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between mb-4 h-12 lg:hidden"
          dir={dir}
        >
          <div className="flex items-center gap-2">
            {CurrentIcon && <CurrentIcon className="h-5 w-5 text-primary" />}
            <span className="font-medium">{currentItem?.label || t("sidebar.emergency_resources")}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent side={dir === "rtl" ? "right" : "left"} className="w-[300px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className={dir === "rtl" ? "text-right" : "text-left"}>{t("sidebar.support_tools")}</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <SupportSidebar 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
