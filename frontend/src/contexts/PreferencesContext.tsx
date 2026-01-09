import { createContext, useContext, ReactNode, useMemo, useCallback } from "react";
import { useProfile, Profile } from "@/hooks/useProfile";
import { translations, TranslationKey, Language } from "@/i18n/translations";

interface PreferencesContextType {
  profile: Profile | null | undefined;
  isLoading: boolean;
  language: Language;
  t: (key: TranslationKey) => string;
  formatCurrency: (value: number) => string;
  updateProfile: (updates: Partial<Profile>) => Promise<Profile>;
  isUpdating: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();

  const language: Language = useMemo(() => {
    return (profile?.language as Language) || "pt";
  }, [profile?.language]);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language]?.[key] || translations.pt[key] || key;
    },
    [language]
  );

  const formatCurrency = useCallback(
    (value: number): string => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    },
    []
  );

  return (
    <PreferencesContext.Provider
      value={{
        profile,
        isLoading,
        language,
        t,
        formatCurrency,
        updateProfile,
        isUpdating,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
