# Ionic React Base App

A modern cross-platform mobile application starter template built with Ionic Framework, React, and Tailwind CSS.

## 🚀 Tech Stack

- **[Ionic Framework](https://ionicframework.com/)** (v8.5.0) - Cross-platform UI components
- **[React](https://react.dev/)** (v19.0.0) - UI library
- **[TypeScript](https://www.typescriptlang.org/)** (v5.9.0) - Type safety
- **[Vite](https://vitejs.dev/)** (v5.0.0) - Fast build tool
- **[Capacitor](https://capacitorjs.com/)** (v7.4.4) - Native mobile runtime
- **[Tailwind CSS](https://tailwindcss.com/)** (v4.1.17) - Utility-first CSS framework
- **[React Router](https://reactrouter.com/)** (v5.3.4) - Navigation

## ✨ Features

- 📱 Cross-platform mobile development (iOS, Android, Web)
- 🎨 Tailwind CSS integrated with Ionic components
- 🧭 Side menu navigation with routing
- ⚡ Lightning-fast dev server with Vite HMR
- 🧪 Testing setup with Vitest and Cypress
- 📦 TypeScript for type safety
- 🔧 ESLint for code quality

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- iOS development: Xcode (macOS only)
- Android development: Android Studio

## 🛠️ Installation

```bash
# Install dependencies
npm install
```

## 🏃 Development

```bash
# Start development server
npm run dev

# Run unit tests
npm run test.unit

# Run e2e tests
npm run test.e2e

# Lint code
npm run lint
```

The app will be available at `http://localhost:5173`

## 🏗️ Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Mobile Development

```bash
# Add iOS platform
npx cap add ios

# Add Android platform
npx cap add android

# Sync changes to native projects
npx cap sync

# Open in Xcode
npx cap open ios

# Open in Android Studio
npx cap open android
```

## 🎨 Styling

This project uses **Tailwind CSS v4** alongside Ionic's built-in components. You can use Tailwind utility classes directly:

```tsx
<IonButton className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Styled Button
</IonButton>
```

Tailwind configuration is in `tailwind.config.js` and the PostCSS setup uses `@tailwindcss/postcss`.

## 📂 Project Structure

```
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ExploreContainer.tsx
│   │   └── Menu.tsx
│   ├── pages/          # Page components
│   │   └── Page.tsx
│   ├── theme/          # Ionic theme variables
│   │   └── variables.css
│   ├── App.tsx         # Main app component with routing
│   ├── main.tsx        # Entry point
│   └── index.css       # Tailwind imports
├── public/             # Static assets
├── cypress/            # E2E tests
├── capacitor.config.ts # Capacitor configuration
├── vite.config.ts      # Vite configuration
└── tailwind.config.js  # Tailwind configuration
```

## 🧪 Testing

- **Unit Tests**: Vitest with React Testing Library
- **E2E Tests**: Cypress

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📚 Resources

- [Ionic Documentation](https://ionicframework.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Vite Documentation](https://vitejs.dev)
