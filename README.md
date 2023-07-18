# React + NestJS Blog

Minimalistic but fully functional blog application

### Technologies

- React (Frontend)
- Next (BFF)
- NestJS (Backend)
- Prisma (ORM)
- PostgreSQL (DB)
- Nginx (Exposing both frontend and backend services in single domain space (and also static files serving))
- Docker

### Features

- **WYSIWYG Editor** (by TipTap)
- **Authorization** (by NextAuth)
- Comments (Coming soon)

## Internal structure

### Services (Docker containers)

- Frontend (Next.js application)
- Backend (Nest.js application for general API)
- DB (PostgreSQL instance)
- Images (Another Nest.js application for uploading images)
- Nginx router
