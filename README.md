# Food Log Web App

A comprehensive food logging application for tracking daily nutrition and health metrics. Built with React, TypeScript, Firebase, and optimized for mobile devices (especially iPhone).

## 🌟 Features

### Core Functionality
- **Daily Food Logging**: Track meals (breakfast, lunch, dinner) and snacks with detailed categories
- **Health Metrics**: Monitor bowel movements, exercise, water intake, sleep quality, and hours
- **PDF Export**: Generate professional reports for healthcare providers
- **Date Range Exports**: Export single day or custom date ranges
- **Cloud Storage**: Firebase Firestore integration with offline fallback
- **User Authentication**: Secure sign-up, sign-in, and password reset

### Food Categories
- Meat & Dairy
- Vegetables & Fruits  
- Breads, Cereals & Grains
- Fats (oils, butter, margarine)
- Candy, Sweets & Junk Food
- Water intake per meal
- Other drinks

### Mobile-First Design
- iPhone optimized interface
- Touch-friendly buttons and inputs
- Responsive design for all screen sizes
- PWA-ready architecture

## 🚀 Live Demo

**Production URL**: https://food-76tg8ueai-markuskreitzers-projects.vercel.app

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase Authentication, Firestore Database  
- **PDF Generation**: jsPDF
- **Testing**: Vitest, React Testing Library
- **Deployment**: Vercel
- **Build Tool**: Vite

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project (for full functionality)

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/nostoslabs/food-log-app.git
cd food-log-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Add a web app to your project
4. Enable Authentication (Email/Password method)
5. Create a Firestore database in production mode
6. Copy the configuration values to your `.env.local` file

### 5. Run the development server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📱 Usage

### Basic Usage
1. **Without Account**: Use local storage for data persistence
2. **With Account**: Sign up to sync data across devices and enable cloud backup

### Daily Logging
1. Navigate through dates using the arrow buttons
2. Fill in meals, snacks, and health metrics
3. Data auto-saves as you type (when signed in)
4. Use the manual save button for immediate cloud sync

### Exporting Data
1. Click "Export for Doctor" button
2. Select date range (today, this week, this month, or custom)
3. Choose format (PDF or text)
4. Download the professional report

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npx vercel --prod
```

### Manual Deployment
1. Run `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables on your hosting platform

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── common/          # Reusable UI components
│   ├── export/          # PDF export components
│   └── food-log/        # Food logging components
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── services/            # Firebase and external services
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── __tests__/           # Test files
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🔒 Security

- Environment variables for sensitive configuration
- Firebase security rules for data protection
- Input validation and sanitization
- HTTPS enforcement
- Authentication best practices

## 📊 Future Enhancements

- [ ] React Native mobile app conversion
- [ ] Nutrition API integration
- [ ] Barcode scanning for packaged foods
- [ ] Meal planning features
- [ ] Advanced analytics and trends
- [ ] Healthcare provider portal
- [ ] Apple Health/Google Fit integration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for healthcare professionals and patients
- Inspired by the need for comprehensive dietary tracking
- Designed with mobile-first principles for everyday use

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

Made with ❤️ by [Nostos Labs](https://github.com/nostoslabs)
