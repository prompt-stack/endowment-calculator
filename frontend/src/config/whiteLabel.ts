/**
 * @fileoverview White label configuration
 * @layer config
 * @status stable
 */

export interface WhiteLabelConfig {
  // Organization branding
  organizationName: string;
  logoUrl?: string;
  favicon?: string;
  
  // Footer customization
  showPoweredBy: boolean;
  poweredByText?: string;
  poweredByUrl?: string;
  
  // Theme colors (optional overrides)
  primaryColor?: string;
  accentColor?: string;
  
  // Feature flags
  features: {
    downloadPdf: boolean;
    printReport: boolean;
    advancedSettings: boolean;
    portfolioComparison: boolean;
    emailCapture?: boolean;
  };
  
  // Custom disclaimers
  disclaimerText?: string;
  
  // Analytics (optional)
  googleAnalyticsId?: string;
  
  // Custom CSS URL (for advanced customization)
  customCssUrl?: string;
}

// Default configuration
export const defaultConfig: WhiteLabelConfig = {
  organizationName: "Endowment Calculator",
  showPoweredBy: true,
  poweredByText: "Your Organization",
  features: {
    downloadPdf: true,
    printReport: true,
    advancedSettings: true,
    portfolioComparison: true,
    emailCapture: false,
  }
};

// Load configuration from environment or external source
export function loadWhiteLabelConfig(): WhiteLabelConfig {
  // In production, this could load from:
  // 1. Environment variables
  // 2. A JSON config file
  // 3. A database
  // 4. URL parameters for multi-tenant setup
  
  // For now, merge with any env vars
  const config: WhiteLabelConfig = {
    ...defaultConfig,
    organizationName: import.meta.env.VITE_ORG_NAME || defaultConfig.organizationName,
    logoUrl: import.meta.env.VITE_LOGO_URL || defaultConfig.logoUrl,
    poweredByText: import.meta.env.VITE_POWERED_BY || defaultConfig.poweredByText,
    poweredByUrl: import.meta.env.VITE_POWERED_BY_URL || defaultConfig.poweredByUrl,
  };
  
  return config;
}