function generateReadme() {
  return `# Tribe Chat

A single-room chat application built with Expo React Native, featuring real-time messaging, reactions, and offline support.

## Features

### Core Features
- 💬 Real-time messaging with offline support
- 👥 Participant profiles with detailed info
- 🎭 Message reactions with participant details
- 💾 Persistent data with AsyncStorage
- 🌓 Dark/Light mode with system theme support
- 📱 Cross-platform (iOS, Android)

### Message Features
- 📝 Message editing indicators
- 🔄 Message reactions
- 💭 Reply to messages
- 🏷️ @mentions support
- 📅 Date separators
- 🖼️ Image attachments

### Technical Features
- ♾️ Infinite scroll for message history
- 🔄 Real-time updates via polling
- 📶 Offline message queue
- ⚡ Optimized rendering
- 🎨 Modern UI with NativeWind

## Tech Stack

- Expo
- React Native
- TypeScript
- NativeWind (TailwindCSS)
- Zustand (State Management)
- React Native Reusables
- Bottom Sheet
- React Native Reanimated

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator
- Expo Go app on your physical device (optional)

### Installation

1. Clone the repository
\`\`\`
git clone https://github.com/yourusername/tribe-chat.git
cd tribe-chat
\`\`\`

2. Install dependencies
\`\`\`
npm install
# or
yarn install
\`\`\`

3. Configure environment variables
\`\`\`
cp .env.example .env
\`\`\`
Edit the \`.env\` file with your configuration values.

4. Start the development server
\`\`\`
npx expo start
\`\`\`

### Running on Simulators/Emulators

- **iOS Simulator**
  \`\`\`bash
  npx expo run:ios
  \`\`\`

- **Android Emulator**
  \`\`\`bash
  npx expo run:android
  \`\`\`

### Running on Physical Devices

1. Install Expo Go on your device from the App Store (iOS) or Play Store (Android)
2. Start the development server: \`npx expo start\`
3. Scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app

## Development

### Project Structure

\`\`\`
tribe-chat/
├── app/           # App screens and navigation
├── components/    # Reusable UI components
├── lib/          # Utilities and helpers
├── assets/       # Static assets
└── types/        # TypeScript type definitions
\`\`\`

### Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.`;
} 

module.exports = {
  generateReadme
}