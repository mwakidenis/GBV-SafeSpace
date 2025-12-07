import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Shield, Lock, Eye, Clock, Smartphone, Globe, 
  AlertTriangle, RefreshCw, LogOut, History, Key
} from "lucide-react";
import { format } from "date-fns";

interface SecuritySettings {
  auto_logout_minutes: number;
  two_factor_enabled: boolean;
  login_notifications: boolean;
  hide_activity: boolean;
  browser_privacy_mode: boolean;
  data_encryption: boolean;
}

interface LoginHistory {
  id: string;
  login_time: string;
  device_info: string;
  ip_address: string;
  location: string;
  success: boolean;
}

const SecuritySettingsComponent = () => {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState<SecuritySettings>({
    auto_logout_minutes: 30,
    two_factor_enabled: false,
    login_notifications: true,
    hide_activity: false,
    browser_privacy_mode: false,
    data_encryption: true,
  });
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
      loadLoginHistory();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("user_security_settings" as any)
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      const settingsData = data as any;
      setSettings({
        auto_logout_minutes: settingsData.auto_logout_minutes || 30,
        two_factor_enabled: settingsData.two_factor_enabled || false,
        login_notifications: settingsData.login_notifications ?? true,
        hide_activity: settingsData.hide_activity || false,
        browser_privacy_mode: settingsData.browser_privacy_mode || false,
        data_encryption: settingsData.data_encryption ?? true,
      });
    }
  };

  const loadLoginHistory = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("login_history" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("login_time", { ascending: false })
      .limit(10);

    if (data) {
      setLoginHistory(data as unknown as LoginHistory[]);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_security_settings" as any)
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Security settings updated");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Clear all login history?")) return;

    try {
      await supabase
        .from("login_history" as any)
        .delete()
        .eq("user_id", user?.id);

      setLoginHistory([]);
      toast.success("Login history cleared");
    } catch (error) {
      toast.error("Failed to clear history");
    }
  };

  const handleSignOutAll = async () => {
    const confirmMessage = 
      "Sign out from ALL devices?\n\n" +
      "This will:\n" +
      "• End your session on this device\n" +
      "• End sessions on all other devices (phones, tablets, computers)\n" +
      "• Require you to log in again everywhere\n\n" +
      "Continue?";
    
    if (!confirm(confirmMessage)) return;

    try {
      await supabase.auth.signOut({ scope: "global" });
      toast.success("Signed out from all devices");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const securityTips = [
    "Use a strong, unique password for this account",
    "Enable two-factor authentication for extra security",
    "Regularly review your login history for suspicious activity",
    "Use the SOS button if you need to quickly hide the app",
    "Clear your browser history after using public devices",
    "Enable auto-logout if you share your device",
  ];

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and privacy
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Logout */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Auto Logout</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically sign out after inactivity
                </p>
              </div>
            </div>
            <Select
              value={settings.auto_logout_minutes.toString()}
              onValueChange={(value) =>
                setSettings({ ...settings, auto_logout_minutes: parseInt(value) })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="0">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-xs text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
            </div>
            <Switch
              checked={settings.two_factor_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, two_factor_enabled: checked })
              }
            />
          </div>

          {/* Login Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Login Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified of new sign-ins
                </p>
              </div>
            </div>
            <Switch
              checked={settings.login_notifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, login_notifications: checked })
              }
            />
          </div>

          {/* Hide Activity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Hide Activity Status</Label>
                <p className="text-xs text-muted-foreground">
                  Hide your online status from others
                </p>
              </div>
            </div>
            <Switch
              checked={settings.hide_activity}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, hide_activity: checked })
              }
            />
          </div>

          {/* Browser Privacy Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Enhanced Privacy Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Minimize data stored in browser
                </p>
              </div>
            </div>
            <Switch
              checked={settings.browser_privacy_mode}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, browser_privacy_mode: checked })
              }
            />
          </div>

          {/* Data Encryption */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>End-to-End Encryption</Label>
                <p className="text-xs text-muted-foreground">
                  Encrypt all your personal data
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600">
                Always On
              </Badge>
              <Lock className="h-4 w-4 text-green-600" />
            </div>
          </div>

          <Button onClick={saveSettings} disabled={loading} className="w-full gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Saving..." : "Save Security Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Login History</CardTitle>
                <CardDescription>Recent account activity</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Hide" : "Show"}
            </Button>
          </div>
        </CardHeader>
        {showHistory && (
          <CardContent className="space-y-4">
            {loginHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No login history available
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  {loginHistory.map((login) => (
                    <div
                      key={login.id}
                      className={`p-3 rounded-lg border ${
                        login.success ? "bg-background" : "bg-destructive/5 border-destructive/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{login.device_info || "Unknown device"}</span>
                        </div>
                        <Badge variant={login.success ? "outline" : "destructive"}>
                          {login.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{format(new Date(login.login_time), "MMM d, yyyy 'at' h:mm a")}</span>
                        {login.location && <span>📍 {login.location}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearHistory}
                  className="w-full"
                >
                  Clear History
                </Button>
              </>
            )}
          </CardContent>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Security Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            onClick={handleSignOutAll}
            className="w-full justify-start gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out From All Devices
          </Button>
          <Button
            variant="outline"
            onClick={() => signOut()}
            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign Out Now
          </Button>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {securityTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-primary">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettingsComponent;
