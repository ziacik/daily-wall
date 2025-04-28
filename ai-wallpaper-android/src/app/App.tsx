import { useEffect, useState } from 'react';
import {
	Alert,
	SafeAreaView,
	ScrollView,
	StatusBar,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import WallpaperModule from './modules/WallpaperModule';

export const App = () => {
	const [wallpaperStatus, setWallpaperStatus] = useState('idle');
	const [isScheduled, setIsScheduled] = useState(false);

	// Check if wallpaper generation is scheduled when app starts
	useEffect(() => {
		const checkScheduleStatus = async () => {
			try {
				const scheduled = await WallpaperModule.isDailyWallpaperScheduled();
				setIsScheduled(scheduled);
			} catch (error) {
				console.error('Error checking wallpaper schedule:', error);
			}
		};

		checkScheduleStatus();
	}, []);

	const generateWallpaper = async () => {
		setWallpaperStatus('generating');
		try {
			const success = await WallpaperModule.generateWallpaper();
			if (success) {
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

					<View style={styles.previewContainer}>
						{wallpaperStatus === 'success' ? (
							<View style={styles.wallpaperPreview}>
								<Text style={styles.previewText}>Wallpaper Preview</Text>
								{/* Placeholder for wallpaper image */}
								<View style={styles.placeholderImage} />
								<Text style={styles.statusText}>
									Wallpaper generated successfully!
								</Text>
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
									{wallpaperStatus === 'generating'
										? 'Generating wallpaper...'
										: 'Press the button below to generate a new wallpaper'}
								</Text>
							</View>
						)}
					</View>

					<TouchableOpacity
						style={[
							styles.generateButton,
							wallpaperStatus === 'generating' && styles.generatingButton,
						]}
						onPress={generateWallpaper}
						disabled={wallpaperStatus === 'generating'}
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
							/>
						</View>

						<Text style={styles.scheduleStatus}>
							{isScheduled
								? 'Daily wallpaper generation is enabled. A new wallpaper will be created every day.'
								: 'Daily wallpaper generation is disabled.'}
						</Text>
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
	generatingButton: {
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
});

export default App;
