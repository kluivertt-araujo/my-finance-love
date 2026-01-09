import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  Bell,
  Globe,
  Shield,
  Download,
  Upload,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const { profile, isLoading, updateProfile, isUpdating, t, language } = usePreferences();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("pt");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setSelectedLanguage(profile.language || "pt");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ name, email });
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleLanguageChange = async (value: string) => {
    setSelectedLanguage(value);
    try {
      await updateProfile({ language: value });
    } catch (error) {
      console.error("Error updating language:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-4xl">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-foreground">
          {t("settingsTitle")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("managePreferences")}
        </p>
      </motion.div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display">{t("profile")}</CardTitle>
                <CardDescription>{t("personalInfo")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("fullName")}</Label>
                <Input 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={isUpdating}>
              {isUpdating ? t("loading") : t("saveChanges")}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Lock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <CardTitle className="font-display">{t("security")}</CardTitle>
                <CardDescription>{t("protectAccount")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">{t("currentPassword")}</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t("newPassword")}</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t("confirmPassword")}</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
            </div>
            <Button>{t("changePassword")}</Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Bell className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="font-display">{t("notifications")}</CardTitle>
                <CardDescription>{t("configureAlerts")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t("spendingAlerts")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("spendingAlertsDesc")}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t("billReminders")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("billRemindersDesc")}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t("weeklySummary")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("weeklySummaryDesc")}
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-income/10">
                <Globe className="w-5 h-5 text-income" />
              </div>
              <div>
                <CardTitle className="font-display">{t("preferences")}</CardTitle>
                <CardDescription>{t("customizeExperience")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("language")}</Label>
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">Português (Brasil)</SelectItem>
                    <SelectItem value="en">English (US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("currency")}</Label>
                <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted/50 text-sm">
                  R$ - Real Brasileiro (BRL)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="font-display">{t("data")}</CardTitle>
                <CardDescription>{t("backupAndImport")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                {t("exportBackup")}
              </Button>
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                {t("importData")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="font-display text-destructive">{t("dangerZone")}</CardTitle>
            <CardDescription>{t("irreversibleActions")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="gap-2 text-destructive border-destructive/50 hover:bg-destructive/10">
              <LogOut className="w-4 h-4" />
              {t("logoutAllDevices")}
            </Button>
            <Button variant="destructive" className="gap-2">
              {t("deleteAccount")}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
