import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { BusinessSettings, ServiceItem } from '../types';
import { getBusinessSettings, updateBusinessSettings, getServices } from '../services/db';
import { DEFAULT_BUSINESS_SETTINGS, INITIAL_SERVICES } from '../services/defaultData';

interface SettingsContextType {
  settings: BusinessSettings;
  services: ServiceItem[];
  enabledServices: ServiceItem[];
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<BusinessSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [fetchedSettings, fetchedServices] = await Promise.all([
        getBusinessSettings(),
        getServices(),
      ]);
      setSettings(fetchedSettings);
      setServices(fetchedServices);
    } catch (err) {
      console.warn('Failed to load settings or services:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateSettings = async (newSettings: Partial<BusinessSettings>) => {
    const updated = await updateBusinessSettings(newSettings);
    setSettings(updated);
  };

  const enabledServices = services.filter((s) => s.enabled);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        services,
        enabledServices,
        isLoading,
        refreshSettings: loadData,
        updateSettings: handleUpdateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
