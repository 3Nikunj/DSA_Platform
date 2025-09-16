# DSA Learning Platform 🚀

An interactive, gamified Data Structures & Algorithms learning platform with animations, games, and advanced algorithm support.

## 🌟 Features

- **Interactive Visualizations**: Step-by-step algorithm animations using Three.js
- **Gamification**: XP points, achievements, leaderboards, and challenges
- **Code Playground**: Real-time coding environment with Monaco Editor
- **Advanced Algorithms**: From basic sorting to complex graph algorithms
- **Social Learning**: Forums, study groups, and peer reviews
- **Adaptive Learning**: AI-powered personalized learning paths

## 🏗️ Architecture

This is a monorepo containing:

```
dsa-learning-platform/
├── apps/
│   ├── frontend/          # React + TypeScript frontend
│   └── backend/           # Node.js + Express backend
├── packages/
│   ├── shared/            # Shared utilities and components
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Common utility functions
└── docs/                  # Documentation
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Three.js** + React Three Fiber for 3D visualizations
- **D3.js** for 2D charts and graphs
- **Monaco Editor** for code editing
- **Material-UI** for UI components
- **Redux Toolkit** for state management

### Backend
- **Node.js** + Express with TypeScript
- **PostgreSQL** for primary database
- **Redis** for caching and sessions
- **Socket.io** for real-time features
- **Docker** for code execution sandboxing
- **JWT** for authentication

### DevOps
- **Docker** + Docker Compose
- **GitHub Actions** for CI/CD
- **ESLint** + Prettier for code quality
- **Jest** for testing

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker (for development)
- PostgreSQL (or use Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/dsa-learning-platform.git
   cd dsa-learning-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 📝 Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build all packages and apps
- `npm run test` - Run tests across all packages
- `npm run lint` - Lint all code
- `npm run lint:fix` - Fix linting issues
- `npm run clean` - Clean all node_modules and build artifacts

## 🎯 Development Roadmap

### Phase 1: Foundation (Months 1-3)
- [x] Project setup and monorepo structure
- [ ] Backend API with authentication
- [ ] Frontend with basic UI components
- [ ] Algorithm visualization engine
- [ ] Basic sorting algorithms

### Phase 2: Gamification (Months 4-6)
- [ ] XP and leveling system
- [ ] Achievement badges
- [ ] Daily challenges
- [ ] Social features

### Phase 3: Advanced Features (Months 7-9)
- [ ] Advanced algorithms
- [ ] Competitive programming features
- [ ] Real-time competitions

### Phase 4: AI & Mobile (Months 10-12)
- [ ] AI-powered recommendations
- [ ] Mobile optimization
- [ ] Advanced analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by platforms like LeetCode, HackerRank, and VisuAlgo
- Built with modern web technologies and best practices
- Designed for educational impact and student success

---

**Happy Learning! 🎓**