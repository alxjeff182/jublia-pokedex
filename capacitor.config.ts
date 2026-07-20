import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jublia.dex',
  appName: 'My Pokedex by Jublia AI',
  webDir: 'www/browser',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
    },
  },
};

export default config;
