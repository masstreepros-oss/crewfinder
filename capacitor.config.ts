import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.crewfinder.app',
  appName: 'CrewFinder',
  webDir: 'www',
  server: {
    url: 'https://crewfinder.pages.dev',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0B1F14',
    preferredContentMode: 'mobile',
    scheme: 'CrewFinder',
  },
  android: {
    backgroundColor: '#0B1F14',
    allowMixedContent: false,
    captureInput: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0B1F14',
      showSpinner: false,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0B1F14',
    },
  },
};

export default config;
