import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.afrocuisto.app',
    appName: 'AfroCuisto',
    webDir: 'dist',
    plugins: {
        StatusBar: {
            style: 'DARK',          // DARK = icônes noires → visibles sur fond blanc
            backgroundColor: '#FFFFFFFF',
            overlaysWebView: false,  // La barre d'état ne superpose PAS le contenu web
        },
    },
};

export default config;
