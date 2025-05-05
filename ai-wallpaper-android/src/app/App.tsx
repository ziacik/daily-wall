import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	SafeAreaView,
	ScrollView,
	StatusBar,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import WallpaperModule from './modules/WallpaperModule';

export const App = () => {
	const [wallpaperStatus, setWallpaperStatus] = useState('idle');
	const [isScheduled, setIsScheduled] = useState(false);
	const [apiKey, setApiKey] = useState('');
	const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);
	const [showApiKey, setShowApiKey] = useState(false);
	const [currentWallpaperUri, setCurrentWallpaperUri] = useState<string | null>(
		null
	);
	const [hasWallpaper, setHasWallpaper] = useState(false);

	// Check configuration when app starts
	useEffect(() => {
		const checkConfig = async () => {
			try {
				// Check schedule status
				const scheduled = await WallpaperModule.isDailyWallpaperScheduled();
				setIsScheduled(scheduled);

				// Check API key status
				const hasApiKey = await WallpaperModule.isApiKeyConfigured();
				setIsApiKeyConfigured(hasApiKey);

				// Load stored API key if any
				if (hasApiKey) {
					const key = await WallpaperModule.getApiKey();
					setApiKey(key);
				}

				// Check for existing wallpaper
				await loadWallpaperPreview();
			} catch (error) {
				console.error('Error checking configuration:', error);
			}
		};

		checkConfig();
	}, []);

	// Function to load the current wallpaper preview
	const loadWallpaperPreview = async () => {
		try {
			// Check if a wallpaper exists
			const hasCurrentWallpaper = await WallpaperModule.hasCurrentWallpaper();
			setHasWallpaper(hasCurrentWallpaper);

			if (hasCurrentWallpaper) {
				// Get the path to the current wallpaper
				const wallpaperPath = await WallpaperModule.getCurrentWallpaperPath();
				setCurrentWallpaperUri(wallpaperPath);
			} else {
				setCurrentWallpaperUri(null);
			}
		} catch (error) {
			console.error('Error loading wallpaper preview:', error);
			setCurrentWallpaperUri(null);
		}
	};

	const generateWallpaper = async () => {
		// Check if API key is configured
		if (!isApiKeyConfigured) {
			Alert.alert(
				'API Key Required',
				'Please configure your OpenAI API key first.'
			);
			return;
		}

		setWallpaperStatus('generating');
		try {
			const success = await WallpaperModule.generateWallpaper();
			if (success) {
				// Load the new wallpaper preview
				await loadWallpaperPreview();
				setWallpaperStatus('success');
			} else {
				setWallpaperStatus('error');
				Alert.alert('Error', 'Failed to generate wallpaper');
			}
		} catch (error) {
			console.error('Error generating wallpaper:', error);
			setWallpaperStatus('error');
			Alert.alert('Error', 'Failed to generate wallpaper: ' + error.message);
		}
	};

	const toggleSchedule = async (value: boolean) => {
		// Check if API key is configured first
		if (value && !isApiKeyConfigured) {
			Alert.alert(
				'API Key Required',
				'Please configure your OpenAI API key first.'
			);
			return;
		}

		try {
			if (value) {
				const success = await WallpaperModule.scheduleDailyWallpaper();
				if (success) {
					setIsScheduled(true);
					Alert.alert('Success', 'Daily wallpaper generation scheduled!');
				} else {
					Alert.alert('Error', 'Failed to schedule daily wallpaper generation');
				}
			} else {
				const success = await WallpaperModule.cancelDailyWallpaper();
				if (success) {
					setIsScheduled(false);
					Alert.alert('Success', 'Daily wallpaper generation cancelled');
				} else {
					Alert.alert('Error', 'Failed to cancel daily wallpaper generation');
				}
			}
		} catch (error) {
			console.error('Error toggling schedule:', error);
			Alert.alert(
				'Error',
				'Failed to toggle wallpaper schedule: ' + error.message
			);
		}
	};

	const saveApiKey = async () => {
		if (!apiKey.trim()) {
			Alert.alert('Error', 'API key cannot be empty');
			return;
		}

		try {
			const success = await WallpaperModule.setApiKey(apiKey.trim());
			if (success) {
				setIsApiKeyConfigured(true);
				Alert.alert('Success', 'API key saved successfully');
			} else {
				Alert.alert('Error', 'Failed to save API key');
			}
		} catch (error) {
			console.error('Error saving API key:', error);
			Alert.alert('Error', 'Failed to save API key: ' + error.message);
		}
	};

	return (
		<>
			<StatusBar barStyle="dark-content" />
			<SafeAreaView style={styles.container}>
				<ScrollView
					contentInsetAdjustmentBehavior="automatic"
					style={styles.scrollView}
				>
					<View style={styles.header}>
						<Text style={styles.title}>AI Wallpaper Generator</Text>
						<Text style={styles.subtitle}>
							Create a new wallpaper every day
						</Text>
					</View>

					<View style={styles.apiKeyContainer}>
						<Text style={styles.infoTitle}>OpenAI API Configuration</Text>
						<Text style={styles.infoText}>
							Enter your OpenAI API key to enable AI-powered wallpaper
							generation. You can get an API key from the OpenAI website.
						</Text>

						<View style={styles.apiKeyInputContainer}>
							<TextInput
								style={styles.apiKeyInput}
								value={apiKey}
								onChangeText={setApiKey}
								placeholder="Enter your OpenAI API key"
								placeholderTextColor="#999"
								secureTextEntry={!showApiKey}
							/>
							<TouchableOpacity
								style={styles.visibilityToggle}
								onPress={() => setShowApiKey(!showApiKey)}
							>
								<Text style={styles.visibilityToggleText}>
									{showApiKey ? 'Hide' : 'Show'}
								</Text>
							</TouchableOpacity>
						</View>

						<TouchableOpacity
							style={styles.saveApiKeyButton}
							onPress={saveApiKey}
						>
							<Text style={styles.buttonText}>Save API Key</Text>
						</TouchableOpacity>

						<Text
							style={[
								styles.apiKeyStatus,
								isApiKeyConfigured && styles.apiKeyConfigured,
							]}
						>
							{isApiKeyConfigured
								? '✓ API key configured'
								: '✗ API key not configured'}
						</Text>
					</View>

					<View style={styles.previewContainer}>
						<Text style={styles.previewText}>Wallpaper Preview</Text>

						{wallpaperStatus === 'generating' ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color="#143055" />
								<Text style={styles.generatingText}>
									Generating wallpaper...
								</Text>
							</View>
						) : hasWallpaper && currentWallpaperUri ? (
							<View style={styles.wallpaperPreview}>
								<Image
									source={{ uri: currentWallpaperUri }}
									style={styles.wallpaperImage}
									resizeMode="contain"
								/>
								{wallpaperStatus === 'success' && (
									<Text style={styles.statusText}>
										Wallpaper generated successfully!
									</Text>
								)}
							</View>
						) : wallpaperStatus === 'error' ? (
							<View style={styles.placeholderContainer}>
								<Text style={[styles.placeholderText, styles.errorText]}>
									Failed to generate wallpaper. Please try again.
								</Text>
							</View>
						) : (
							<View style={styles.placeholderContainer}>
								<Text style={styles.placeholderText}>
									No wallpaper generated yet. Press the button below to generate
									a new wallpaper.
								</Text>
							</View>
						)}
					</View>

					<TouchableOpacity
						style={[
							styles.generateButton,
							(wallpaperStatus === 'generating' || !isApiKeyConfigured) &&
								styles.disabledButton,
						]}
						onPress={generateWallpaper}
						disabled={wallpaperStatus === 'generating' || !isApiKeyConfigured}
					>
						<Text style={styles.generateButtonText}>
							{wallpaperStatus === 'generating'
								? 'Generating...'
								: 'Generate New Wallpaper'}
						</Text>
					</TouchableOpacity>

					<View style={styles.infoContainer}>
						<Text style={styles.infoTitle}>Schedule Daily Wallpapers</Text>
						<Text style={styles.infoText}>
							This app can automatically generate and set a new AI-created
							wallpaper each day. Toggle the switch below to enable or disable
							automatic scheduling.
						</Text>

						<View style={styles.settingItem}>
							<Text style={styles.settingLabel}>
								Daily wallpaper generation
							</Text>
							<Switch
								value={isScheduled}
								onValueChange={toggleSchedule}
								trackColor={{ false: '#767577', true: '#81b0ff' }}
								thumbColor={isScheduled ? '#143055' : '#f4f3f4'}
								disabled={!isApiKeyConfigured}
							/>
						</View>

						<Text style={styles.scheduleStatus}>
							{isScheduled
								? 'Daily wallpaper generation is enabled. A new wallpaper will be created every day.'
								: 'Daily wallpaper generation is disabled.'}
						</Text>

						{!isApiKeyConfigured && (
							<Text style={styles.warningText}>
								API key required for scheduling daily wallpapers.
							</Text>
						)}
					</View>
				</ScrollView>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F5F5F7',
	},
	scrollView: {
		backgroundColor: '#F5F5F7',
	},
	header: {
		padding: 24,
		backgroundColor: '#143055',
		borderBottomLeftRadius: 16,
		borderBottomRightRadius: 16,
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#FFFFFF',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: '#FFFFFF',
		opacity: 0.8,
	},
	apiKeyContainer: {
		marginTop: 24,
		marginHorizontal: 16,
		padding: 16,
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	apiKeyInputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#DDDDDD',
		borderRadius: 8,
		marginTop: 8,
		marginBottom: 16,
	},
	apiKeyInput: {
		flex: 1,
		padding: 12,
		fontSize: 16,
		color: '#333',
	},
	visibilityToggle: {
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	visibilityToggleText: {
		color: '#143055',
		fontWeight: 'bold',
	},
	saveApiKeyButton: {
		backgroundColor: '#143055',
		borderRadius: 8,
		paddingVertical: 12,
		alignItems: 'center',
		marginBottom: 8,
	},
	buttonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
	apiKeyStatus: {
		fontSize: 14,
		color: '#D32F2F',
		textAlign: 'center',
		marginTop: 8,
	},
	apiKeyConfigured: {
		color: '#4CAF50',
	},
	previewContainer: {
		marginTop: 24,
		marginHorizontal: 16,
		padding: 16,
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		minHeight: 300,
	},
	wallpaperPreview: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	previewText: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 12,
	},
	placeholderImage: {
		width: '100%',
		height: 220,
		backgroundColor: '#E0E0E0',
		borderRadius: 8,
	},
	placeholderContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 250,
	},
	placeholderText: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
		padding: 16,
	},
	errorText: {
		color: '#D32F2F',
	},
	statusText: {
		marginTop: 12,
		fontSize: 14,
		color: '#4CAF50',
	},
	generateButton: {
		backgroundColor: '#143055',
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 24,
		marginTop: 24,
		marginHorizontal: 16,
		alignItems: 'center',
	},
	disabledButton: {
		backgroundColor: '#999',
	},
	generateButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
	infoContainer: {
		marginTop: 24,
		marginHorizontal: 16,
		padding: 16,
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		marginBottom: 24,
	},
	infoTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	infoText: {
		fontSize: 14,
		color: '#333',
		lineHeight: 20,
		marginBottom: 16,
	},
	settingItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#F0F0F0',
	},
	settingLabel: {
		fontSize: 16,
		color: '#333',
	},
	scheduleStatus: {
		fontSize: 12,
		color: '#666',
		marginTop: 8,
		fontStyle: 'italic',
	},
	warningText: {
		fontSize: 14,
		color: '#D32F2F',
		marginTop: 8,
	},
	wallpaperImage: {
		width: '100%',
		height: 300,
		borderRadius: 8,
	},
	loadingContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 300,
	},
	generatingText: {
		marginTop: 16,
		fontSize: 16,
		color: '#143055',
	},
});

export default App;
