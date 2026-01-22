# ChatBot Awareness Platform

An intelligent chatbot system for IT security policy management, document handling, and user onboarding. Built with modern technologies and designed for easy deployment.

## 🏗️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Node.js 20 + NestJS
- **Database**: PostgreSQL 15 with Prisma ORM
- **AI Integration**: Ollama (Llama 3.1) with Hugging Face fallback
- **Storage**: Local uploads directory (configurable)
- **Deployment**: Docker-ready, optimized for Railway platform

## 🚀 Features

### 🔐 User Authentication & Authorization
- **Secure Login/Registration**: JWT-based authentication system
- **Role-Based Access Control**: User, Admin, HR, and IT Security roles
- **User Profile Management**: Update personal information and credentials
- **Protected Routes**: Secure access to sensitive features

### 🗄️ Document Management
- **Local Uploads**: Files stored under `backend/uploads`
- **File Upload System**: Support for PDF, TXT, MD files up to 25MB
- **Document Processing**: PDF/DOCX text extraction and indexing
- **Smart Downloads**: Access files via secure download endpoints
- **Document Search**: Find documents by content and metadata
- **CRUD Operations**: Create, read, update, and delete documents

### 🤖 AI-Powered Chat Assistant
- **Security Onboarding Assistance**: Guided help with security awareness topics
- **Policy Search**: Intelligent document and policy retrieval
- **Context-Aware Responses**: AI understands uploaded documents
- **Multiple AI Backends**: Ollama (Llama 3.1) with Hugging Face fallback
- **Chat History**: Persistent conversation tracking

### 👥 Admin Dashboard
- **User Management**: Create, update, deactivate user accounts
- **Role Assignment**: Manage user permissions and access levels
- **Audit Logging**: Track all system activities and user actions
- **System Monitoring**: View platform usage and health metrics

### 🎨 Modern User Interface
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dashboard Layout**: Tabbed interface for different functions
- **File Upload**: Drag-and-drop with progress indicators
- **Real-time Updates**: Live chat and status updates

## 🏗️ System Architecture

The platform follows a modern microservices architecture with Docker containerization:

```mermaid
graph TB
    subgraph "Client Layer"
        U[👤 Users<br/>Web Browser]
    end

    subgraph "Docker Container Network"
        subgraph "Frontend Container<br/>:3000"
            FE[🖥️ Next.js Frontend<br/>React 19 + TypeScript<br/>Tailwind CSS + Radix UI]
        end

        subgraph "Backend Container<br/>:8080"
            BE[⚙️ NestJS Backend<br/>JWT Auth + RBAC<br/>File Processing]
        end

        subgraph "Database Container<br/>:5433"
            DB[(🗄️ PostgreSQL 15<br/>Prisma ORM<br/>User Data<br/>Documents<br/>Audit Logs)]
        end

        subgraph "AI Container<br/>:11434"
            AI[🤖 Ollama Server<br/>Llama 3.1 Model<br/>AI Chat Engine]
        end
    end

    subgraph "Persistent Storage"
        PV1[📦 postgres-data<br/>Database Files]
        PV2[📦 ollama-data<br/>AI Models]
        PV3[📦 uploads-data<br/>Document Files]
    end

    subgraph "External Services"
        HF[🤗 Hugging Face API<br/>Fallback AI Service]
    end

    %% User interactions
    U -->|HTTPS Requests| FE
    FE -->|API Calls| BE

    %% Backend connections
    BE -->|SQL Queries| DB
    BE -->|AI Requests| AI
    BE -->|Fallback AI| HF
    BE -->|File Storage| PV3

    %% Database storage
    DB -.->|Persist| PV1

    %% AI model storage
    AI -.->|Persist| PV2

    %% User flows
    U -.->|"1. Login/Register"| FE
    FE -.->|"2. Authentication"| BE
    BE -.->|"3. User Verification"| DB
    U -.->|"4. Upload Documents"| FE
    FE -.->|"5. File Processing"| BE
    BE -.->|"6. Store Metadata"| DB
    U -.->|"7. Chat with AI"| FE
    FE -.->|"8. Process Chat"| BE
    BE -.->|"9. AI Response"| AI

    %% Styling
    classDef containerStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef storageStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef externalStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef userStyle fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px

    class FE,BE,DB,AI containerStyle
    class PV1,PV2,PV3 storageStyle
    class HF externalStyle
    class U userStyle
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: TanStack React Query v5
- **Authentication**: JWT with React Context
- **File Upload**: React Dropzone
- **Icons**: Lucide React

### Backend
- **Language**: Node.js 20+
- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with middleware
- **File Processing**: PDF, DOC, DOCX text extraction
- **AI Integration**: 
  - Ollama API (Llama 3.1)
  - Hugging Face Inference API
  - Fallback response system
- **CORS**: Multi-origin support for Docker/local development

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15 with persistent volumes
- **AI Model Server**: Ollama container with GPU support
- **File Storage**: Volume-mounted uploads with backup support
- **Health Checks**: Container health monitoring

## 📦 Quick Start with Docker (Recommended)

### Prerequisites
- [Docker Desktop](https://docs.docker.com/get-docker/) installed
- At least 4GB of available RAM

### 🚀 Setup Instructions:
```bash
# Clone the repository
git clone <repository-url>
cd chatapp-stk

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up --build -d

# Setup AI model (required for AI features)
docker-compose exec ollama ollama pull llama3.1
```

### 🌐 Access Your Application
Once running, visit:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Database**: localhost:5433
- **Ollama AI**: http://localhost:11434

## 🏗️ Project Structure

```
chatapp-stk/
├── app/                          # Next.js App Router
├── components/                   # React components
├── lib/                         # Utility libraries
├── backend/                     # NestJS backend server
│   ├── src/                     # NestJS source code
│   ├── prisma/                  # Prisma schema + seed
│   ├── package.json             # Backend dependencies
│   ├── uploads/                 # Local uploads directory
│   └── Dockerfile               # Backend container configuration
├── Docker Configuration
│   ├── docker-compose.yml       # Multi-service orchestration
│   ├── Dockerfile.frontend      # Frontend container configuration
│   ├── backend/Dockerfile       # Backend container configuration
│   ├── .dockerignore           # Frontend build optimization
│   ├── backend/.dockerignore   # Backend build optimization
│   └── .env.example            # Environment configuration template
└── Configuration Files
    ├── next.config.ts           # Next.js configuration
    ├── package.json             # Frontend dependencies
    ├── tsconfig.json            # TypeScript configuration
    ├── components.json          # UI components config
    └── postcss.config.mjs       # PostCSS configuration
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/register` | User registration |

### Chat & AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send chat message and get AI response |

### Document Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/documents` | List all documents (paginated) |
| `POST` | `/api/documents` | Upload new document |
| `GET` | `/api/documents/:id` | Get document details |
| `PUT` | `/api/documents/:id` | Update document |
| `DELETE` | `/api/documents/:id` | Delete document |
| `GET` | `/api/documents/:id/download` | Download original file |

### User Management (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | List all users |
| `PUT` | `/api/users/:id` | Update user |
| `PUT` | `/api/users/:id/role` | Update user role |
| `DELETE` | `/api/users/:id` | Deactivate user |

### Audit & Monitoring
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/audit-logs` | View system audit logs |
| `GET` | `/api/health` | Backend health check |

## 📁 Local File Storage

The NestJS backend stores uploaded documents locally in the `backend/uploads` directory by default. Configure the location using `UPLOADS_DIR` and ensure it is writable in your deployment environment.

### 🔄 Supported File Types

| File Type | MIME Type | Max Size | Description |
|-----------|-----------|----------|--------------|
| PDF | `application/pdf` | 25MB | PDF documents |
| TXT | `text/plain` | 25MB | Plain text files |
| MD | `text/markdown` | 25MB | Markdown files |

Files outside these types will be rejected with HTTP 400.

## 🚀 Development Setup

### Local Development (without Docker)

1. **Prerequisites**:
   - Node.js 20+
   - PostgreSQL 15+

2. **Database Setup**:
   ```bash
   createdb chatbot_db
   ```

3. **Backend Setup**:
   ```bash
   cd backend
   cp .env.example .env

   npm install
   npm run prisma:generate
   npm run prisma:migrate
   npm run start:dev
   ```

4. **Frontend Setup**:
   ```bash
   npm install
   npm run dev
   ```

### Environment Configuration

#### Local Development Environment (.env)
```bash
# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# Backend Configuration
DATABASE_URL=postgresql://chatbot_user:chatbot_password@postgres:5432/chatbot_db
UPLOADS_DIR=uploads
SKIP_DATABASE=false

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AI Configuration (enabled)
AI_ENABLED=true
OLLAMA_URL=https://90b90cad6d42.ngrok-free.app
HF_TOKEN=your-hugging-face-token-here  # Optional: for Hugging Face fallback

# Server Configuration
PORT=8080
FRONTEND_URL=http://localhost:3000
```

## 🤖 AI Integration

The chatbot uses a robust multi-tier AI system with intelligent fallbacks:

1. **Ollama (Primary)**: Llama 3.1 model running locally in Docker container - provides fast, private AI responses
2. **Hugging Face (Fallback)**: Cloud-based inference API when Ollama is unavailable
3. **Mock Responses (Last Resort)**: Intelligent predefined responses ensure the chat always works

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access**: Granular permission system

### Data Protection
- **Input Validation**: Comprehensive request sanitization
- **File Upload Security**: Type validation, size limits, virus scanning
- **CORS Configuration**: Secure cross-origin resource sharing
- **SQL Injection Prevention**: Parameterized queries with Prisma

## ☁️ Railway Deployment (FREE)

### Backend Service (Railway)
```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secure-random-jwt-secret-minimum-32-characters
AI_ENABLED=true
PORT=8080
UPLOADS_DIR=uploads
FRONTEND_URL=https://your-frontend-service.up.railway.app
```

### Frontend Service (Railway)
```env
NEXT_PUBLIC_API_URL=https://your-backend-service.up.railway.app
NODE_ENV=production
```

## 🛠️ Troubleshooting

```bash
# Local development
docker-compose logs -f [service-name]
docker-compose ps
curl http://localhost:8080/api/health
```

## 📄 Documentation

- **Environment Setup**: Use `.env.example` as template for local development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Commit with conventional commit messages
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines
- Follow TypeScript/NestJS best practices
- Write tests for new features
- Update documentation
- Ensure Docker builds work
- Test with different user roles

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Getting Help
1. Check the [Docker Guide](DOCKER.md) for setup issues
2. Review logs with `docker-compose logs -f`
3. Use the `/debug` page for environment variable issues
4. Open an issue in the repository
5. Contact your IT team for security-specific questions

### System Requirements
- **Minimum**: 4GB RAM, 2 CPU cores, 10GB disk space
- **Recommended**: 8GB RAM, 4 CPU cores, 50GB disk space
- **Docker**: Version 20.10+ with Compose V2

---

## 👤 Author

**Revanza**
- 🌐 Website: [https://revanza.vercel.app](https://revanza.vercel.app)
- 📧 Email: revanza.raytama@gmail.com
- 💼 GitHub: [@revanza-git](https://github.com/revanza-git)

Built with ❤️ using Next.js, NestJS, and Docker.
