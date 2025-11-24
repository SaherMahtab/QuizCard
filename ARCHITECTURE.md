# QuizCard Architecture

## 📚 Overview

QuizCard is a full-stack web application built with React and Firebase, designed to provide an interactive quiz platform for educational institutions.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Material-UI (MUI)** - Component library
- **React Router v6** - Client-side routing
- **Styled Components** - CSS-in-JS styling

### Backend
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - NoSQL database
- **Firebase Hosting** - Asset hosting (optional)

### Deployment
- **Vercel** - Hosting and CI/CD
- **GitHub Actions** - Automated testing (planned)

---

## 📁 Project Structure
```
quiz-card/
├── public/                      # Static files
│   ├── index.html              # HTML template
│   └── favicon.ico             # App icon
│
├── src/
│   ├── components/             # Reusable components
│   │   └── Common/
│   │       ├── DarkModeToggle.js
│   │       └── ProtectedRoute.js
│   │
│   ├── contexts/               # React Context providers
│   │   └── AuthContext.js     # Authentication state
│   │
│   ├── firebase/               # Firebase configuration
│   │   ├── config.js          # Firebase initialization
│   │   └── config.example.js  # Template for contributors
│   │
│   ├── pages/                  # Page components
│   │   ├── Auth/              # Authentication pages
│   │   │   ├── Login.js
│   │   │   └── Signup.js
│   │   │
│   │   ├── Teacher/           # Teacher-specific pages
│   │   │   ├── Dashboard.js
│   │   │   ├── CreateQuiz.js
│   │   │   ├── EditQuiz.js
│   │   │   ├── MyQuizzes.js
│   │   │   └── QuizAnalytics.js
│   │   │
│   │   └── Student/           # Student-specific pages
│   │       ├── Dashboard.js
│   │       ├── PlayQuiz.js
│   │       ├── Leaderboard.js
│   │       └── ScoreHistory.js
│   │
│   ├── App.js                  # Root component with routes
│   └── index.js                # Entry point
│
├── .env                        # Environment variables (not in git)
├── .env.example               # Template for env variables
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies
└── README.md                  # Project documentation
```

---

## 🗄️ Data Model

### Firestore Collections

#### **users**
```javascript
{
  uid: string,              // Firebase Auth UID
  email: string,            // User email
  name: string,             // Display name
  role: string,             // "teacher" or "student"
  createdAt: timestamp
}
```

#### **quizzes**
```javascript
{
  id: string,               // Auto-generated
  teacherId: string,        // Creator's UID
  title: string,            // Quiz title
  subject: string,          // Subject/category
  quizCode: string,         // 6-character unique code (e.g., "ABC123")
  timePerQuestion: number,  // Seconds per question
  questions: [              // Array of question objects
    {
      questionText: string,
      options: string[],    // 4 options
      correctAnswer: number // Index (0-3)
    }
  ],
  createdAt: timestamp
}
```

#### **scores**
```javascript
{
  id: string,               // Auto-generated
  studentId: string,        // Student's UID
  quizId: string,           // Reference to quiz
  quizTitle: string,        // Cached quiz title
  score: number,            // Correct answers count
  totalQuestions: number,   // Total questions
  answers: [                // Array of answer objects
    {
      questionIndex: number,
      selectedAnswer: number,
      correctAnswer: number,
      isCorrect: boolean,
      timeTaken: number     // Seconds
    }
  ],
  completedAt: string       // ISO timestamp
}
```

---

## 🔐 Authentication Flow

### User Registration
1. User fills signup form (name, email, password, role)
2. Firebase creates authentication account
3. User document created in Firestore
4. User redirected to role-specific dashboard

### User Login
1. User enters credentials
2. Firebase authenticates
3. AuthContext provides user state
4. ProtectedRoute checks authentication + role
5. User redirected to appropriate dashboard

### Protected Routes
- `/teacher/*` - Requires teacher role
- `/student/*` - Requires student role
- Implemented via `ProtectedRoute` component

---

## 🎮 Quiz Flow

### Teacher Workflow
1. **Create Quiz**
   - Navigate to Create Quiz page
   - Enter quiz details (title, subject, time limit)
   - Add questions with 4 options
   - System generates unique 6-character quiz code
   - Quiz saved to Firestore

2. **Share Quiz**
   - Teacher views quiz in "My Quizzes"
   - Copy quiz code or download QR code
   - Share with students via any medium

3. **View Analytics**
   - See all student attempts
   - View question-wise statistics
   - Identify difficult questions

### Student Workflow
1. **Join Quiz**
   - Enter quiz code OR scan QR code
   - If not logged in, redirect to login (code saved)
   - After login, redirect to quiz

2. **Play Quiz**
   - See quiz details (title, subject, question count)
   - Start quiz → Timer begins
   - Answer questions (timer per question)
   - Submit final answers

3. **View Results**
   - See score immediately
   - View leaderboard
   - Check score history

---

## 🔄 State Management

### Global State (AuthContext)
- **currentUser**: Firebase user object
- **userRole**: "teacher" or "student"
- **login()**: Authenticate user
- **signup()**: Create new account
- **logout()**: Sign out user

### Local State (Component Level)
Each page manages its own state using React hooks:
- `useState` for local data
- `useEffect` for data fetching
- `useNavigate` for programmatic navigation

---

## 🎨 Styling Architecture

### Approach
- **Material-UI (MUI)** for base components
- **Styled Components** for custom styling
- **Theme Provider** for dark/light mode

### Key Styled Components
- `GradientBackground` - Page backgrounds
- `GlassAppBar` - Glassmorphism app bars
- `StyledCard` - Consistent card styling
- Custom buttons with animations

### Theme
```javascript
{
  palette: {
    mode: 'light' | 'dark',
    primary: { main: '#3b82f6' },
    secondary: { main: '#8b5cf6' }
  }
}
```

---

## 🚀 Deployment Architecture

### Development
```
Local (npm start) → React Dev Server (localhost:3000)
```

### Production
```
GitHub Push → Vercel CI/CD → Build → Deploy
```

### Environment Variables
Required in Vercel dashboard:
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`

---

## 🔧 Key Features Implementation

### QR Code Generation
- Library: `qrcode.react`
- Generates QR with quiz URL: `/student/play/{quizCode}`
- Students scan → Opens URL → Redirects to login if needed → Opens quiz

### Real-time Leaderboard
- Fetches all scores for a quiz
- Sorts by score (descending)
- Highlights current user's rank
- No WebSocket - reads from Firestore

### Quiz Timer
- `useEffect` with `setTimeout`
- Decrements every second
- Auto-submits when time expires
- Per-question timer, not total quiz timer

---

## 🛡️ Security Considerations

### Firestore Security Rules
```javascript
// Recommended rules (simplified)
match /quizzes/{quizId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == resource.data.teacherId;
}

match /scores/{scoreId} {
  allow read: if request.auth != null;
  allow create: if request.auth.uid == request.resource.data.studentId;
}
```

### Client-Side Security
- No sensitive data in frontend code
- Environment variables for Firebase config
- Role-based route protection
- One attempt per student per quiz

---

## 📊 Performance Optimizations

### Current
- Component-level code splitting (planned)
- Lazy loading for routes (planned)
- Optimized re-renders with React.memo

### Planned
- Image optimization
- Service worker for offline support
- Firestore query optimization with indexes

---

## 🧪 Testing Strategy (Planned)

### Unit Tests
- Component rendering
- Utility functions
- Context providers

### Integration Tests
- Authentication flow
- Quiz creation flow
- Score submission

### E2E Tests
- Complete user workflows
- Cross-browser testing

---

## 🤝 Contributing

To understand how to contribute, see:
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [DEVELOPMENT.md](DEVELOPMENT.md) - Setup instructions
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community standards

---

## 📞 Questions?

- Open an issue on GitHub
- Join discussions
- Check existing documentation

---

**Last Updated**: November 2025
EOFcat > ARCHITECTURE.md << 'EOF'
# QuizCard Architecture

## 📚 Overview

QuizCard is a full-stack web application built with React and Firebase, designed to provide an interactive quiz platform for educational institutions.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Material-UI (MUI)** - Component library
- **React Router v6** - Client-side routing
- **Styled Components** - CSS-in-JS styling

### Backend
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - NoSQL database
- **Firebase Hosting** - Asset hosting (optional)

### Deployment
- **Vercel** - Hosting and CI/CD
- **GitHub Actions** - Automated testing (planned)

---

## 📁 Project Structure
```
quiz-card/
├── public/                      # Static files
│   ├── index.html              # HTML template
│   └── favicon.ico             # App icon
│
├── src/
│   ├── components/             # Reusable components
│   │   └── Common/
│   │       ├── DarkModeToggle.js
│   │       └── ProtectedRoute.js
│   │
│   ├── contexts/               # React Context providers
│   │   └── AuthContext.js     # Authentication state
│   │
│   ├── firebase/               # Firebase configuration
│   │   ├── config.js          # Firebase initialization
│   │   └── config.example.js  # Template for contributors
│   │
│   ├── pages/                  # Page components
│   │   ├── Auth/              # Authentication pages
│   │   │   ├── Login.js
│   │   │   └── Signup.js
│   │   │
│   │   ├── Teacher/           # Teacher-specific pages
│   │   │   ├── Dashboard.js
│   │   │   ├── CreateQuiz.js
│   │   │   ├── EditQuiz.js
│   │   │   ├── MyQuizzes.js
│   │   │   └── QuizAnalytics.js
│   │   │
│   │   └── Student/           # Student-specific pages
│   │       ├── Dashboard.js
│   │       ├── PlayQuiz.js
│   │       ├── Leaderboard.js
│   │       └── ScoreHistory.js
│   │
│   ├── App.js                  # Root component with routes
│   └── index.js                # Entry point
│
├── .env                        # Environment variables (not in git)
├── .env.example               # Template for env variables
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies
└── README.md                  # Project documentation
```

---

## 🗄️ Data Model

### Firestore Collections

#### **users**
```javascript
{
  uid: string,              // Firebase Auth UID
  email: string,            // User email
  name: string,             // Display name
  role: string,             // "teacher" or "student"
  createdAt: timestamp
}
```

#### **quizzes**
```javascript
{
  id: string,               // Auto-generated
  teacherId: string,        // Creator's UID
  title: string,            // Quiz title
  subject: string,          // Subject/category
  quizCode: string,         // 6-character unique code (e.g., "ABC123")
  timePerQuestion: number,  // Seconds per question
  questions: [              // Array of question objects
    {
      questionText: string,
      options: string[],    // 4 options
      correctAnswer: number // Index (0-3)
    }
  ],
  createdAt: timestamp
}
```

#### **scores**
```javascript
{
  id: string,               // Auto-generated
  studentId: string,        // Student's UID
  quizId: string,           // Reference to quiz
  quizTitle: string,        // Cached quiz title
  score: number,            // Correct answers count
  totalQuestions: number,   // Total questions
  answers: [                // Array of answer objects
    {
      questionIndex: number,
      selectedAnswer: number,
      correctAnswer: number,
      isCorrect: boolean,
      timeTaken: number     // Seconds
    }
  ],
  completedAt: string       // ISO timestamp
}
```

---

## 🔐 Authentication Flow

### User Registration
1. User fills signup form (name, email, password, role)
2. Firebase creates authentication account
3. User document created in Firestore
4. User redirected to role-specific dashboard

### User Login
1. User enters credentials
2. Firebase authenticates
3. AuthContext provides user state
4. ProtectedRoute checks authentication + role
5. User redirected to appropriate dashboard

### Protected Routes
- `/teacher/*` - Requires teacher role
- `/student/*` - Requires student role
- Implemented via `ProtectedRoute` component

---

## 🎮 Quiz Flow

### Teacher Workflow
1. **Create Quiz**
   - Navigate to Create Quiz page
   - Enter quiz details (title, subject, time limit)
   - Add questions with 4 options
   - System generates unique 6-character quiz code
   - Quiz saved to Firestore

2. **Share Quiz**
   - Teacher views quiz in "My Quizzes"
   - Copy quiz code or download QR code
   - Share with students via any medium

3. **View Analytics**
   - See all student attempts
   - View question-wise statistics
   - Identify difficult questions

### Student Workflow
1. **Join Quiz**
   - Enter quiz code OR scan QR code
   - If not logged in, redirect to login (code saved)
   - After login, redirect to quiz

2. **Play Quiz**
   - See quiz details (title, subject, question count)
   - Start quiz → Timer begins
   - Answer questions (timer per question)
   - Submit final answers

3. **View Results**
   - See score immediately
   - View leaderboard
   - Check score history

---

## 🔄 State Management

### Global State (AuthContext)
- **currentUser**: Firebase user object
- **userRole**: "teacher" or "student"
- **login()**: Authenticate user
- **signup()**: Create new account
- **logout()**: Sign out user

### Local State (Component Level)
Each page manages its own state using React hooks:
- `useState` for local data
- `useEffect` for data fetching
- `useNavigate` for programmatic navigation

---

## 🎨 Styling Architecture

### Approach
- **Material-UI (MUI)** for base components
- **Styled Components** for custom styling
- **Theme Provider** for dark/light mode

### Key Styled Components
- `GradientBackground` - Page backgrounds
- `GlassAppBar` - Glassmorphism app bars
- `StyledCard` - Consistent card styling
- Custom buttons with animations

### Theme
```javascript
{
  palette: {
    mode: 'light' | 'dark',
    primary: { main: '#3b82f6' },
    secondary: { main: '#8b5cf6' }
  }
}
```

---

## 🚀 Deployment Architecture

### Development
```
Local (npm start) → React Dev Server (localhost:3000)
```

### Production
```
GitHub Push → Vercel CI/CD → Build → Deploy
```

### Environment Variables
Required in Vercel dashboard:
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`

---

## 🔧 Key Features Implementation

### QR Code Generation
- Library: `qrcode.react`
- Generates QR with quiz URL: `/student/play/{quizCode}`
- Students scan → Opens URL → Redirects to login if needed → Opens quiz

### Real-time Leaderboard
- Fetches all scores for a quiz
- Sorts by score (descending)
- Highlights current user's rank
- No WebSocket - reads from Firestore

### Quiz Timer
- `useEffect` with `setTimeout`
- Decrements every second
- Auto-submits when time expires
- Per-question timer, not total quiz timer

---

## 🛡️ Security Considerations

### Firestore Security Rules
```javascript
// Recommended rules (simplified)
match /quizzes/{quizId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == resource.data.teacherId;
}

match /scores/{scoreId} {
  allow read: if request.auth != null;
  allow create: if request.auth.uid == request.resource.data.studentId;
}
```

### Client-Side Security
- No sensitive data in frontend code
- Environment variables for Firebase config
- Role-based route protection
- One attempt per student per quiz

---

## 📊 Performance Optimizations

### Current
- Component-level code splitting (planned)
- Lazy loading for routes (planned)
- Optimized re-renders with React.memo

### Planned
- Image optimization
- Service worker for offline support
- Firestore query optimization with indexes

---

## 🧪 Testing Strategy (Planned)

### Unit Tests
- Component rendering
- Utility functions
- Context providers

### Integration Tests
- Authentication flow
- Quiz creation flow
- Score submission

### E2E Tests
- Complete user workflows
- Cross-browser testing

---

## 🤝 Contributing

To understand how to contribute, see:
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [DEVELOPMENT.md](DEVELOPMENT.md) - Setup instructions
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community standards

---

## 📞 Questions?

- Open an issue on GitHub
- Join discussions
- Check existing documentation

---

**Last Updated**: November 2025
