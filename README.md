# Done. - iMessage AI Task Agent

An intelligent iMessage bot that captures tasks from natural language, decomposes them into actionable steps, and sends periodic follow-ups to keep you on track.

## Features

- **Natural Language Task Capture**: Send tasks as messages like "Write a blog post, do research, and get feedback"
- **AI-Powered Decomposition**: Uses OpenAI/Anthropic to break tasks into specific, actionable steps
- **Smart Prioritization**: Automatically assigns priority levels (high, medium, low)
- **Persistent Follow-ups**: Sends periodic reminders to nudge task completion
- **User Conversations**: Maintains separate task histories for each contact
- **CLI Interface**: Demo and testing interface with rich task management commands

## Architecture

The agent consists of five core modules:

### 1. TaskManager (`lib/agent/task-manager.ts`)

- In-memory task storage (swappable for database later)
- Task CRUD operations
- User task tracking
- Status management and progress tracking

### 2. AIProcessor (`lib/agent/ai-processor.ts`)

- Natural language understanding using Vercel AI SDK
- Task decomposition into structured steps
- Dynamic message generation for status updates and follow-ups
- Sentiment analysis for user interactions

### 3. IMessageHandler (`lib/agent/imessage-handler.ts`)

- Message receive/send operations
- Conversation context management
- Mock implementation ready for `@photon-ai/imessage-kit` integration
- Message queue and asynchronous processing

### 4. FollowupEngine (`lib/agent/followup-engine.ts`)

- Schedules follow-up reminders
- Automatic follow-up processing on schedule
- Escalating reminder cadence (24h, 48h, etc.)
- Follow-up history and cancellation

### 5. DoneAgent (`lib/agent/done-agent.ts`)

- Main orchestrator coordinating all modules
- Message routing and response generation
- Statistics and monitoring
- Lifecycle management (start/stop)

## Setup

### Prerequisites

- Node.js 18+ (for `tsx` support)
- macOS (for actual iMessage integration via Full Disk Access)
- OpenAI API key OR Anthropic API key

### Installation

```bash
# Install dependencies
pnpm install

# Add environment variables
# For OpenAI:
export OPENAI_API_KEY=sk-...

# Or for Anthropic:
export ANTHROPIC_API_KEY=sk-...

# Optional: specify AI provider
export AI_PROVIDER=openai  # or "anthropic"
```

## Running the Agent

### Interactive CLI Demo

```bash
# Run the agent with interactive CLI
pnpm agent

# Or use tsx directly
tsx lib/agent/agent.ts
```

### CLI Commands

```
help                           - Show available commands
status                         - Show agent status
demo                           - Run a demo conversation
send <phone> <message>         - Simulate incoming message
tasks [phone_number]           - List all tasks (or tasks for specific user)
stats                          - Show agent statistics
followups                       - Show pending follow-ups
process-followups              - Process pending follow-ups
clear                          - Clear the screen
exit                           - Stop the agent and exit
```

### Example Demo Session

```bash
$ pnpm agent

╔════════════════════════════════════╗
║     Done. iMessage Agent v1.0      ║
║  AI-Powered Task Automation on Mac  ║
╚════════════════════════════════════╝

[v0] Initializing Done. Agent...
[v0] Agent fully started and listening...

agent> demo
[v0] Running demo conversation...

[Demo] From +1-555-123-4567: "Write a blog post about AI, do research, and get feedback"
[v0] Processing message with AI...
[v0] Decomposing task...

agent> tasks
Tasks by User:
──────────────────────────────────────────────────────────────
+1-555-123-4567:
  Total: 1 | Completed: 0
  • Write a blog post about AI (0/3 steps) [pending]

agent> exit
[v0] Shutting down...
```

## Usage in Production

### Integrating with Your App

```typescript
import { DoneAgent } from "@/lib/agent";

const agent = new DoneAgent({
  aiProvider: "openai",
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
  followUpInterval: 24,
  maxTasksPerUser: 50,
  enableFollowUps: true,
});

// Start the agent
await agent.start();

// Listen to incoming messages (automatically handled via callbacks)

// Query tasks
const userTasks = agent.getUserTasks("+1-555-123-4567");

// Get statistics
const stats = agent.getStats();
```

### Upgrading to Production iMessage

When ready to deploy with real iMessage:

1. Install `@photon-ai/imessage-kit`:

```bash
pnpm add @photon-ai/imessage-kit
```

2. Update `IMessageHandler` to use real iMessage APIs
3. Ensure Full Disk Access is granted to your app
4. Replace in-memory storage with a real database (PostgreSQL, etc.)
5. Add proper error handling and logging

## Configuration

### AgentConfig Options

```typescript
interface AgentConfig {
  aiProvider: "openai" | "anthropic"; // LLM provider
  apiKey: string; // API key for provider
  model: string; // Model to use (e.g., "gpt-4-turbo")
  systemPrompt: string; // Custom system prompt
  followUpInterval: number; // Hours between follow-ups (default: 24)
  maxTasksPerUser: number; // Max tasks per user (default: 50)
  enableFollowUps: boolean; // Enable automatic follow-ups
}
```

## Data Persistence

### Current (MVP)

Tasks and follow-ups are stored in memory using JavaScript `Map` objects. Data is lost when the agent restarts.

### Production Ready

Replace `TaskManager` to use a database:

- PostgreSQL with Neon or Supabase
- Row-level security (RLS) for multi-user support
- Indexed queries for performance
- Scheduled jobs for follow-ups

## Roadmap

- [ ] Real iMessage integration with `@photon-ai/imessage-kit`
- [ ] Database persistence (PostgreSQL)
- [ ] Web dashboard for task viewing
- [ ] Task templates and categories
- [ ] Collaborative tasks with multiple users
- [ ] Analytics and productivity insights
- [ ] Natural language commands (complete step, reschedule, etc.)
- [ ] Integration with calendar systems
- [ ] Advanced NLP with entity extraction

## Development

### Project Structure

```
lib/agent/
├── agent.ts                 # CLI entry point
├── done-agent.ts           # Main orchestrator
├── task-manager.ts         # Task storage and management
├── ai-processor.ts         # AI/LLM integration
├── imessage-handler.ts     # iMessage communication
├── followup-engine.ts      # Reminder scheduling
├── types.ts                # TypeScript interfaces
└── index.ts                # Module exports
```

### Testing

```bash
# Run the demo conversation
agent> demo

# Simulate a message
agent> send +1-555-123-4567 "Buy groceries and meal prep for the week"

# View created tasks
agent> tasks

# Check follow-ups
agent> followups
```

### Debugging

Enable debug logging by checking the console output. All `console.log("[v0] ...")` statements are debug outputs.

## License

MIT - Created with v0 for Vercel

## Support

For issues or questions:

1. Check the embedded demo (`pnpm agent` then `demo`)
2. Review the CLI help (`help` command in the agent)
3. Check the code comments in each module

---

**Done.** - Capture tasks. Execute with focus. Follow-up with confidence.
