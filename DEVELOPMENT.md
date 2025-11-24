# Development Guide

## Quick Start

### Prerequisites
- **Node.js 20+** (use `nvm` for version management)
- **npm** or **yarn**
- **Git**
- **Firebase account** (free tier is sufficient)

---

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/SaherMahtab/QuizCard.git
cd QuizCard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name (e.g., "quizcard-dev")
4. Disable Google Analytics (optional for dev)
5. Click "Create Project"

#### Enable Authentication
1. In Firebase Console → Authentication → Get Started
2. Enable "Email/Password" sign-in method

#### Create Firestore Database
1. In Firebase Console → Firestore Database → Create Database
2. Select "Start in test mode" (for development)
3. Choose a location closest to you
4. Click "Enable"

#### Get Firebase Config
1. In Firebase Console → Project Settings (gear icon)
2. Scroll to "Your apps" → Click Web icon (`</>`)
3. Register app with nickname (e.g., "QuizCard Dev")
4. Copy the `firebaseConfig` object

### 4. Environment Configuration
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your Firebase credentials
nano .env
```

Add your Firebase config:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 5. Start Development Server
```bash
# Use Node 20
nvm use 20

# Start app
npm start
```

App opens at: http://localhost:3000

---

## 🛠️ Development Workflow

### Branch Strategy
```bash
# Always start from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Work on your feature...

# Commit changes
git add .
git commit -m "feat: add your feature description"

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Branch Naming Convention
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

Examples:
- `feature/add-dark-mode`
- `fix/quiz-timer-bug`
- `docs/update-readme`

---

## Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, missing semicolons)
- `refactor`: Code change that neither fixes bug nor adds feature
- `test`: Adding tests
- `chore`: Build process or auxiliary tools

### Examples
```bash
feat(quiz): add timer pause functionality
fix(auth): resolve login redirect issue
docs: update CONTRIBUTING.md with examples
style(dashboard): improve button spacing
refactor(quiz): extract timer logic into custom hook
```

---

## Testing Locally

### Manual Testing Checklist

#### Teacher Flow
- [ ] Sign up as teacher
- [ ] Create a quiz with 3-5 questions
- [ ] View quiz code
- [ ] Download QR code
- [ ] Edit quiz
- [ ] View analytics (after student attempt)
- [ ] Delete quiz

#### Student Flow
- [ ] Sign up as student
- [ ] Enter quiz code to join
- [ ] Play complete quiz
- [ ] View results
- [ ] Check leaderboard
- [ ] View score history

#### Cross-Browser Testing
Test on:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Debugging

### Common Issues

**Issue: "Cannot find module 'node:path'"**
```bash
# Solution: Use Node 20+
nvm install 20
nvm use 20
npm start
```

**Issue: Firebase connection errors**
```bash
# Check .env file has correct values
cat .env

# Verify Firebase project is active
# Check Firebase Console → Project Settings
```

**Issue: "Quiz not found"**
```bash
# Ensure quiz code is uppercase
# Check Firestore has quiz document with matching quizCode
```

**Issue: Build fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## Building for Production
```bash
# Create optimized build
npm run build

# Build output in /build directory
ls build/
```

---

## Code Style

### ESLint
Project uses ESLint for code quality:
```bash
# Run linter
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### Code Formatting
- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Use arrow functions for components

### Component Structure
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Component definition
export default function MyComponent() {
  // 1. Hooks
  const navigate = useNavigate();
  const [state, setState] = useState(null);

  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // 3. Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // 4. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

## Useful Commands
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests (when implemented)
npm test

# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Clear React cache
rm -rf node_modules/.cache
```

---

## Learning Resources

### React
- [React Docs](https://react.dev)
- [React Router](https://reactrouter.com)

### Material-UI
- [MUI Docs](https://mui.com)
- [MUI Components](https://mui.com/material-ui/getting-started/)

### Firebase
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)

---

## Getting Help

### Before Asking
1. Check existing [Issues](https://github.com/SaherMahtab/QuizCard/issues)
2. Search [Discussions](https://github.com/SaherMahtab/QuizCard/discussions)
3. Review documentation

### How to Ask
1. Open a GitHub Discussion (Q&A category)
2. Provide:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment (OS, browser, Node version)

---

## Next Steps

1. **Make your first contribution**
   - Find a `good first issue`
   - Comment that you're working on it
   - Submit a PR

2. **Join the community**
   - Star the repository
   - Watch for updates
   - Participate in discussions

3. **Share your experience**
   - Write about using QuizCard
   - Share with your network
   - Suggest improvements

---

**Happy Coding! 🚀**
