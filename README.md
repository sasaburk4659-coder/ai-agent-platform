# OmniAgent — Your All-Capable AI Agent Platform

A fully-featured AI agent web application with authentication, coin-based task execution, and admin management. Built with React, TypeScript, tRPC, and Express.

## Features

### 🔐 Authentication
- **Google OAuth Integration**: Sign in with Google
- **Manual Registration**: Create accounts with username, email, and password
- **User Limit**: Maximum 5 users per IP address
- **Role-Based Access**: Admin and user roles

### 💰 Coin System
- **Daily Rewards**: Earn 300 coins every day
- **Dynamic Cost Estimation**: AI analyzes tasks and estimates coin cost
- **Coin Transactions**: Track all coin earnings and spending
- **Admin Management**: Manually add coins to users

### 🤖 AI Agent
- **Task Execution**: Execute various tasks using AI
- **Cost Estimation**: Intelligent cost calculation before execution
- **Task History**: View all executed tasks
- **Capabilities**: Minecraft mods, email, account management, automation

### 👨‍💼 Admin Panel
- **User Management**: View all users and their coin balances
- **Coin Distribution**: Add coins to users with custom reasons
- **System Statistics**: Monitor total users, coins, and completed tasks
- **Admin-Only Access**: Secured with role-based access control

## Tech Stack

### Frontend
- **React 19**: Modern UI framework
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first styling
- **shadcn/ui**: Component library
- **tRPC**: End-to-end type-safe APIs

### Backend
- **Express 4**: Web server
- **tRPC**: RPC framework
- **Drizzle ORM**: Database ORM
- **MySQL**: Database
- **bcryptjs**: Password hashing
- **JWT**: Session management

### Infrastructure
- **Vite**: Build tool
- **Vitest**: Testing framework
- **pnpm**: Package manager

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- MySQL database
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-agent-platform
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```
   DATABASE_URL=mysql://user:password@localhost:3306/ai_agent
   JWT_SECRET=your-secret-key
   VITE_OAUTH_PORTAL_URL=https://oauth.example.com
   VITE_APP_ID=your-app-id
   ```

4. **Run database migrations**
   ```bash
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open in browser**
   Navigate to `http://localhost:3000`

## Usage

### User Registration
1. Visit the login page
2. Choose "Register" tab
3. Enter username, email, and password
4. Or sign up with Google

### Claiming Daily Rewards
1. Log in to your account
2. Click "Claim Daily (300)" button
3. Receive 300 coins

### Executing Tasks
1. Describe your task in the chat
2. Click "Estimate" to get AI cost estimation
3. Review the estimated cost
4. Click "Execute" to run the task
5. Coins are deducted from your balance

### Admin Panel
1. Log in as admin (sasaburk4659@gmail.com or admin role)
2. Navigate to Admin Panel
3. View all users and their coin balances
4. Select a user and add coins with a reason

## Database Schema

### Users Table
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email
- `passwordHash`: Hashed password
- `openId`: OAuth identifier
- `coins`: Current coin balance
- `role`: 'admin' or 'user'
- `ipAddress`: Registration IP
- `loginMethod`: 'oauth' or 'manual'

### Coin Transactions Table
- `id`: Primary key
- `userId`: User reference
- `amount`: Transaction amount
- `type`: 'earn', 'spend', or 'admin_adjust'
- `description`: Transaction reason
- `createdAt`: Timestamp

### Agent Tasks Table
- `id`: Primary key
- `userId`: User reference
- `taskType`: Type of task
- `prompt`: Task description
- `result`: Task result
- `status`: 'pending', 'processing', 'completed', 'failed'
- `coinsCost`: Cost in coins

## API Endpoints

### Authentication
- `POST /api/trpc/auth.register` - Register new user
- `POST /api/trpc/auth.login` - Login with credentials
- `GET /api/trpc/auth.me` - Get current user
- `POST /api/trpc/auth.logout` - Logout

### Coins
- `GET /api/trpc/coins.getBalance` - Get user's coin balance
- `POST /api/trpc/coins.claimDaily` - Claim daily reward
- `POST /api/trpc/coins.estimateCost` - Estimate task cost

### Agent
- `POST /api/trpc/agent.executeTask` - Execute a task
- `GET /api/trpc/agent.getTasks` - Get user's tasks

### Admin
- `GET /api/trpc/admin.getAllUsers` - Get all users
- `POST /api/trpc/admin.addCoinsToUser` - Add coins to user
- `GET /api/trpc/admin.getSystemStats` - Get system statistics

## Development

### Running Tests
```bash
pnpm test
```

### Building for Production
```bash
pnpm build
```

### Starting Production Server
```bash
pnpm start
```

## Design

The application features a futuristic cyberpunk design with:
- Dark navy background (#0a0e27)
- Neon cyan (#00d9ff) and electric purple (#9d4edd) accents
- Glowing text effects and animations
- Smooth transitions and micro-interactions
- Responsive layout for all devices

## Security

- Passwords are hashed with bcryptjs
- JWT tokens for session management
- Role-based access control
- Input validation with Zod
- HTTPS enforced in production

## Admin Account

The email `sasaburk4659@gmail.com` is automatically set as admin on first registration.

## Deployment

### Manus Platform
1. Create a checkpoint: `webdev_save_checkpoint`
2. Click "Publish" in the UI
3. Select your GitHub repository
4. Deploy automatically

### Manual Deployment
1. Build the project: `pnpm build`
2. Deploy the `dist` folder to your hosting
3. Set environment variables on your server
4. Run database migrations
5. Start the server: `pnpm start`

## License

MIT

## Support

For issues and feature requests, please open an issue on GitHub.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

---

Built with ❤️ using Manus AI Platform
