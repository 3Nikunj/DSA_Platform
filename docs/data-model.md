# Data Model (Prisma)

## Datasource
- Provider: `sqlite` (`apps/backend/prisma/schema.prisma:8-11`)
- URL: `DATABASE_URL` from environment (example `.env.example` uses Postgres; see alignment note)

## Models
- `User`
  - Core: `id`, `email`, `username`, `password`, names, avatar, bio
  - Preferences: `theme`, `language`
  - Gamification: `level`, `xp`, `coins`, `streak`
  - Status: `isActive`, `isVerified`, `isPremium`
  - Timestamps: `createdAt`, `updatedAt`, `lastLogin?`
  - Relations: `progress[]`, `achievements[]`, `submissions[]`, `challenges[]`, `competitions[]`, `sessions[]`
  - Table name: `users`

- `Session`
  - Fields: `id`, `userId`, `token` (unique), `expiresAt`, `createdAt`
  - Relation: `user` (cascade)
  - Table: `sessions`

- `Category`
  - Fields: `id`, `name` (unique), `description?`, `icon?`, `color?`, `order`
  - Relation: `algorithms[]`
  - Table: `categories`

- `Algorithm`
  - Content: `name`, `slug` (unique), `description`, `explanation`, `pseudocode?`
  - Metadata: `difficulty`, `timeComplexity`, `spaceComplexity`
  - Rewards: `xpReward`, `coinReward`
  - Status: `isPublished`
  - Relations: `categoryId` → `Category`, `progress[]`, `submissions[]`, `challenges[]`
  - Timestamps: `createdAt`, `updatedAt`
  - Table: `algorithms`

- `Progress`
  - Keys: `id`, `userId`, `algorithmId`
  - Status: `status`, `completedAt?`, `timeSpent`, `attempts`
  - Metrics: `bestScore?`, `averageScore?`
  - Timestamps: `createdAt`, `updatedAt`
  - Relations: `user` (cascade), `algorithm` (cascade)
  - Unique: `@@unique([userId, algorithmId])`
  - Table: `progress`

- `Submission`
  - Keys: `id`, `userId`, `algorithmId`
  - Code: `code`, `language`
  - Results: `status`, `score?`, `executionTime?`, `memoryUsage?`
  - Tests: `testsPassed`, `testsTotal`
  - Error: `error?`
  - Timestamp: `createdAt`
  - Relations: `user`, `algorithm`
  - Table: `submissions`

- `Achievement`
  - Identity: `id`, `name` (unique), `description`, `icon`
  - Type: `type`, `requirement` (JSON string)
  - Rewards: `xpReward`, `coinReward`
  - Metadata: `isHidden`, `rarity`
  - Timestamp: `createdAt`
  - Relation: `userAchievements[]`
  - Table: `achievements`

- `UserAchievement`
  - Keys: `id`, `userId`, `achievementId`
  - Progress: `progress`, `isCompleted`, `unlockedAt?`
  - Timestamp: `createdAt`
  - Relations: `user` (cascade), `achievement` (cascade)
  - Unique: `@@unique([userId, achievementId])`
  - Table: `user_achievements`

- `Challenge`
  - Identity: `id`, `title`, `description`
  - Details: `algorithmId?`, `difficulty`, `testCases` (JSON string)
  - Constraints: `timeLimit`, `memoryLimit`
  - Rewards: `xpReward`, `coinReward`
  - Status: `isActive`
  - Timestamps: `createdAt`, `updatedAt`
  - Relations: `algorithm?`, `attempts[]`
  - Table: `challenges`

- `ChallengeAttempt`
  - Keys: `id`, `userId`, `challengeId`
  - Submission: `code`, `language`
  - Results: `status`, `score?`, `executionTime?`, `memoryUsage?`
  - Tests: `testsPassed`, `testsTotal`
  - Timestamp: `createdAt`
  - Relations: `user` (cascade), `challenge` (cascade)
  - Table: `challenge_attempts`

- `Competition`
  - Identity: `id`, `title`, `description`
  - Timing: `startTime`, `endTime`
  - Rules: `maxParticipants?`, `isPublic`
  - Prizes: `prizes?` (JSON string)
  - Status: `status`
  - Timestamps: `createdAt`, `updatedAt`
  - Relation: `participants[]`
  - Table: `competitions`

- `CompetitionParticipant`
  - Keys: `id`, `userId`, `competitionId`
  - Performance: `score`, `rank?`
  - Status: `isActive`
  - Timestamp: `joinedAt`
  - Relations: `user` (cascade), `competition` (cascade)
  - Unique: `@@unique([userId, competitionId])`
  - Table: `competition_participants`

## Alignment Note
- `.env.example` configures `DATABASE_URL` for Postgres, while Prisma uses `sqlite`. Migration steps are documented in `docs/dev-setup.md`.