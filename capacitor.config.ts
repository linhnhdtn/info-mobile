import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.canhan.info',
  appName: 'Cá nhân',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: false,
      androidIsEncryption: false,
    },
  },
};

export default config;
