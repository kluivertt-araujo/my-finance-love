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
  Trash2,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { profile, isLoading, updateProfile, isUpdating, t, language } = usePreferences();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("pt");
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  
  // Password strength calculation
  const getPasswordStrength = (password: string): { level: "weak" | "medium" | "strong"; color: string } => {
    if (!password) return { level: "weak", color: "bg-muted" };
    
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;
    
    // Strong: >10 chars + uppercase + numbers + symbols
    if (length > 10 && hasUppercase && hasNumbers && hasSymbols) {
      return { level: "strong", color: "bg-income" };
    }
    
    // Medium: 6-10 chars + letters + numbers
    if (length >= 6 && (hasUppercase || hasLowercase) && hasNumbers) {
      return { level: "medium", color: "bg-warning" };
    }
    
    // Weak: <6 chars or only letters/lowercase
    return { level: "weak", color: "bg-destructive" };
  };
  
  const passwordStrength = getPasswordStrength(newPassword);
  
  // Delete account state
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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

  const handleChangePassword = async () => {
    setPasswordError("");
    
    // Validate fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(t("fillAllPasswordFields"));
      return;
    }
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwordsDoNotMatch"));
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // First verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: currentPassword,
      });
      
      if (signInError) {
        setPasswordError(language === "pt" ? "Senha atual incorreta" : "Current password is incorrect");
        setIsChangingPassword(false);
        return;
      }
      
      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (updateError) {
        toast.error(t("passwordChangeError"));
        setIsChangingPassword(false);
        return;
      }
      
      toast.success(t("passwordChanged"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(t("passwordChangeError"));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    
    try {
      // Delete user data first (the database will cascade delete related data)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Delete profile (this will cascade to other user data due to RLS)
        await supabase.from("profiles").delete().eq("user_id", user.id);
        await supabase.from("accounts").delete().eq("user_id", user.id);
        await supabase.from("categories").delete().eq("user_id", user.id);
        await supabase.from("transactions").delete().eq("user_id", user.id);
        await supabase.from("transfers").delete().eq("user_id", user.id);
        await supabase.from("financial_goals").delete().eq("user_id", user.id);
        await supabase.from("goal_contributions").delete().eq("user_id", user.id);
      }
      
      // Sign out the user
      await signOut();
      
      toast.success(t("accountDeleted"));
      navigate("/auth");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(t("accountDeleteError"));
    } finally {
      setIsDeletingAccount(false);
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
                <Input 
                  id="current-password" 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t("newPassword")}</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {newPassword && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{t("passwordStrength")}:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.level === "strong" ? "text-income" :
                        passwordStrength.level === "medium" ? "text-warning" : "text-destructive"
                      }`}>
                        {t(passwordStrength.level)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ 
                          width: passwordStrength.level === "strong" ? "100%" : 
                                 passwordStrength.level === "medium" ? "66%" : "33%" 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t("confirmPassword")}</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={confirmPassword && confirmPassword !== newPassword ? "border-destructive" : ""}
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-destructive">{t("passwordsDoNotMatch")}</p>
                )}
              </div>
            </div>
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
            </div>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? t("changingPassword") : t("changePassword")}
            </Button>
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
            <Button 
              variant="outline" 
              className="gap-2 text-destructive border-destructive/50 hover:bg-destructive/10"
              onClick={async () => {
                await signOut();
                navigate("/auth");
              }}
            >
              <LogOut className="w-4 h-4" />
              {t("logoutAllDevices")}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2" disabled={isDeletingAccount}>
                  <Trash2 className="w-4 h-4" />
                  {isDeletingAccount ? t("deletingAccount") : t("deleteAccount")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("deleteAccountConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("deleteAccountConfirmMessage")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
