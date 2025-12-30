# HealthFlow - Modern Clinic Booking System

A beautiful, modern healthcare booking platform built with React, featuring a sophisticated design system and comprehensive features for patients, doctors, and administrators.

## Features

### For Patients
- Easy appointment booking with doctor search and filtering
- Medical records management and history
- Health metrics tracking with AI-powered insights
- Family member management
- Real-time messaging with healthcare providers
- Smart notifications for appointments and updates

### For Doctors
- Comprehensive dashboard with appointment overview
- Schedule management and availability settings
- Patient management and medical record access
- Prescription creation and management
- Analytics and performance insights
- Video consultation capabilities

### For Administrators
- System-wide analytics and reporting
- User and doctor management
- Doctor approval workflow
- Revenue and usage tracking
- System configuration

## Tech Stack

- **Framework**: React 18.3 with Vite
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Charts**: Recharts

## Design System

- **Color Palette**: Warm, organic wellness theme with sage greens and terra cotta accents
- **Typography**: Crimson Pro (display) + Plus Jakarta Sans (body)
- **Components**: Comprehensive UI library with Card, Button, Input, Modal, Toast, etc.
- **Animations**: Smooth transitions and micro-interactions throughout
- **Dark Mode**: Full dark mode support

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Quick Demo Login

The app comes with pre-configured demo accounts:

**Patient Account:**
- Email: `john.anderson@email.com`
- Password: `password`

**Doctor Account:**
- Email: `sarah.mitchell@healthflow.com`
- Password: `password`

**Admin Account:**
- Email: `admin@healthflow.com`
- Password: `password`

## Project Structure

```
src/
├── api/                    # Mock API layer
│   ├── mockApi.js         # API service functions
│   └── mockData.js        # Mock data for all entities
├── components/
│   ├── layout/            # Layout components (Navbar, Sidebar, etc.)
│   └── ui/                # Reusable UI components
├── lib/
│   └── utils.js           # Utility functions
├── pages/                 # Page components
│   ├── auth/              # Authentication pages
│   ├── patient/           # Patient-specific pages
│   ├── doctor/            # Doctor-specific pages
│   └── admin/             # Admin-specific pages
├── store/                 # State management
│   ├── authStore.js       # Authentication state
│   └── uiStore.js         # UI state (theme, modals, toasts)
├── App.jsx                # Main app component with routing
├── main.jsx               # App entry point
└── index.css              # Global styles and Tailwind imports
```

## Mock API

The application uses a comprehensive mock API layer that simulates real backend functionality:

- **Authentication**: Login, register, logout, token management
- **Users**: Profile management, search, role-based access
- **Appointments**: CRUD operations, status management, filtering
- **Medical Records**: Patient history, diagnoses, vital signs
- **Prescriptions**: Medication management, prescription creation
- **Health Metrics**: Vital sign tracking, trend analysis
- **Family Members**: Dependent management
- **Messages**: Real-time chat simulation
- **Notifications**: System notifications and alerts
- **AI Analysis**: Health insights and recommendations

All API calls include realistic delays to simulate network requests.

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Features Implemented

✅ Landing page with marketing content
✅ Authentication (Login/Register)
✅ Patient Dashboard
✅ Responsive design with dark mode
✅ Mock API layer with all entities
✅ State management (Auth + UI)
✅ Comprehensive UI component library
✅ Protected routes with role-based access

## Coming Soon

- Complete appointment booking flow
- Full medical records interface
- Health metrics dashboard with charts
- Family member management
- Real-time messaging interface
- Doctor dashboard and tools
- Admin panel and analytics

## License

MIT License

## Credits

Built by HealthFlow Team
# clinic-booking-systemc-frontend
