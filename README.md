# PDF Chat Application

A Next.js application that enables users to chat with their PDF documents using Groq AI.

## Features

- PDF document upload and processing
- Real-time chat interface with AI responses
- Context-aware conversations based on PDF content
- User authentication
- Dark/Light mode support

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL
- Groq AI API
- PDF to Text Conversion
- Tailwind CSS
- shadcn/ui components

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Groq API key
- GitHub account (for authentication)

## Environment Setup

Create a `.env` file with:

```env
DATABASE_URL=
GITHUB_ID=
GITHUB_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
```

## Installation

```bash
# Clone repository
git clone https://github.com/AyushSingh916/pdfChatApp.git

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

## Usage

1. Login using GitHub
2. Add your Groq API key in "My Account" section
3. Start a new chat or upload a PDF
4. Interact with the AI about the PDF content

## Project Structure

```
├── app/                  # Next.js app router
├── components/          # React components
├── lib/                 # Utility functions
├── prisma/             # Database schema
├── public/             # Static assets
└── types/              # TypeScript types
```

## Key Components

### Chat Interface
- Real-time message updates
- Optimistic UI updates
- PDF upload modal
- Message history

### PDF Processing
- PDF to text conversion
- Context injection into AI prompts
- File upload handling

### Authentication
- GitHub OAuth integration
- Protected routes
- Session management

### Database Schema
```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?

  conversations Conversation[]
  accounts      Account[]
}

model Conversation {
  id        String   @id @default(cuid())
  name      String
  messages  Json
  pdfName   String?  
  pdfText   String?  

  userId    String
  user      User     @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## API Routes

- `/api/updateConversation`: Updates conversation with PDF data
- `/api/auth/*`: Authentication endpoints
- `/chat/*`: Chat functionality endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License
