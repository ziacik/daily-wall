import { NativeModules, Platform } from 'react-native';

// Interface defining the shape of our native module
interface WallpaperModuleInterface {
	generateWallpaper: () => Promise<boolean>;
	scheduleDailyWallpaper: () => Promise<boolean>;
	cancelDailyWallpaper: () => Promise<boolean>;
	isDailyWallpaperScheduled: () => Promise<boolean>;
	// API key management methods
	setApiKey: (apiKey: string) => Promise<boolean>;
	getApiKey: () => Promise<string>;
	isApiKeyConfigured: () => Promise<boolean>;
	// Wallpaper preview methods
	getCurrentWallpaperPath: () => Promise<string | null>;
	hasCurrentWallpaper: () => Promise<boolean>;
}

// Get the native module
const NativeWallpaperModule = NativeModules.WallpaperModule;

// Create a module with default implementation for platforms where it's not available
const WallpaperModule: WallpaperModuleInterface =
	Platform.OS === 'android' && NativeWallpaperModule
		? NativeWallpaperModule
		: {
				// Default implementations that return rejected promises on unsupported platforms
				generateWallpaper: async () => {
					return Promise.reject(
						new Error('WallpaperModule is only available on Android')
					);
				},
				scheduleDailyWallpaper: async () => {
					return Promise.reject(
						new Error('WallpaperModule is only available on Android')
					);
				},
				cancelDailyWallpaper: async () => {
					return Promise.reject(
						new Error('WallpaperModule is only available on Android')
					);
				},
				isDailyWallpaperScheduled: async () => {
					return Promise.reject(
						new Error('WallpaperModule is only available on Android')
					);
				},
				setApiKey: async () => {
					return Promise.reject(
						new Error('WallpaperModule is only available on Android')
					);
				},
				getApiKey: async () => {
					return Promise.reject(
						new Error('WallpaperModule is only available on Android')
					);
				},
				isApiKeyConfigured: async () => {
					return Promise.reject(
						new Error('WallpaperModule is only available on Android')
					);
				},
				getCurrentWallpaperPath: async () => {
					return Promise.reject(
						new Error('WallpaperModule is only available on Android')
					);
				},
				hasCurrentWallpaper: async () => {
					return Promise.reject(
						new Error('WallpaperModule is only available on Android')
					);
				},
		  };

export default WallpaperModule;
