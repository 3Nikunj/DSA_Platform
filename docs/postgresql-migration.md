# PostgreSQL Migration Guide for DSA Learning Platform

This guide explains how to migrate the DSA Learning Platform from SQLite to PostgreSQL for production deployment.

## Overview

The application currently uses SQLite for development but is designed to work with PostgreSQL in production. This guide provides step-by-step instructions for migrating to PostgreSQL.

## Prerequisites

- PostgreSQL 12+ server (local or cloud)
- Node.js 18+ and npm 9+
- Basic understanding of database management

## Migration Options

### Option 1: Using Supabase (Recommended)

Supabase provides a free tier PostgreSQL database that's perfect for production deployment.

1. **Create Supabase Account**
   - Visit [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Get Connection Details**
   - Go to your Supabase project dashboard
   - Navigate to Settings → Database
   - Find the Connection String section
   - Copy the PostgreSQL connection string

3. **Update Environment Variables**
   ```bash
   # In your backend .env file, update:
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-ID].supabase.co:5432/postgres?sslmode=require"
   ```

4. **Run Migration Script**
   ```bash
   chmod +x scripts/migrate-to-postgres.sh
   ./scripts/migrate-to-postgres.sh
   ```

### Option 2: Using Local PostgreSQL

1. **Install PostgreSQL**
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create Database and User**
   ```sql
   CREATE DATABASE dsa_learning_platform;
   CREATE USER dsa_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE dsa_learning_platform TO dsa_user;
   ```

3. **Update Environment Variables**
   ```bash
   DATABASE_URL="postgresql://dsa_user:your_secure_password@localhost:5432/dsa_learning_platform"
   ```

4. **Run Migration Script**
   ```bash
   ./scripts/migrate-to-postgres.sh
   ```

### Option 3: Using Cloud PostgreSQL (AWS RDS, Google Cloud SQL, etc.)

1. **Create PostgreSQL Instance**
   - Follow your cloud provider's documentation
   - Ensure SSL is enabled for security
   - Note the connection details

2. **Configure Security**
   - Set up firewall rules to allow connections from your application
   - Configure SSL certificates if required

3. **Update Environment Variables**
   ```bash
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
   ```

## Manual Migration Steps

If you prefer to do the migration manually:

### Step 1: Backup SQLite Data
```bash
cp apps/backend/prisma/dev.db apps/backend/prisma/dev.db.backup
```

### Step 2: Update Prisma Schema
```bash
# Edit apps/backend/prisma/schema.prisma
# Change: provider = "sqlite"
# To: provider = "postgresql"
```

### Step 3: Update Environment Configuration
```bash
# Update apps/backend/.env
DATABASE_URL="your_postgresql_connection_string"
```

### Step 4: Generate Prisma Client
```bash
cd apps/backend
npm run db:generate
```

### Step 5: Create and Run Migrations
```bash
cd apps/backend
npm run db:migrate
```

### Step 6: Seed Database (Optional)
```bash
cd apps/backend
npm run db:seed
```

## Connection String Examples

### Supabase
```
postgresql://postgres:[PASSWORD]@[PROJECT-ID].supabase.co:5432/postgres?sslmode=require
```

### Local PostgreSQL
```
postgresql://username:password@localhost:5432/dsa_learning_platform
```

### With Connection Pooling (Supabase)
```
postgresql://postgres:[PASSWORD]@[PROJECT-ID].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```

## Environment Variables Required

Make sure these environment variables are set in your production environment:

```bash
# Database
DATABASE_URL="your_postgresql_connection_string"

# JWT Secrets (generate strong random strings)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Redis (optional but recommended)
REDIS_URL="redis://localhost:6379"

# Other required variables
NODE_ENV="production"
FRONTEND_URL="https://your-frontend-domain.com"
PORT="5000"
```

## Security Considerations

1. **SSL/TLS**: Always use SSL connections in production
2. **Strong Passwords**: Use strong database passwords
3. **Network Security**: Restrict database access to your application servers
4. **Regular Backups**: Set up automated database backups
5. **Connection Pooling**: Use connection pooling for better performance

## Performance Optimization

1. **Connection Pooling**: Configure appropriate connection pool sizes
2. **Indexes**: Ensure proper database indexes are in place
3. **Query Optimization**: Monitor and optimize slow queries
4. **Caching**: Use Redis for caching frequently accessed data

## Troubleshooting

### Common Issues

1. **Connection Timeouts**
   - Check firewall rules
   - Verify connection string format
   - Ensure PostgreSQL is accepting external connections

2. **SSL Certificate Issues**
   - Add `?sslmode=require` to connection string
   - For self-signed certificates, use `?sslmode=no-verify`

3. **Authentication Failures**
   - Verify username and password
   - Check PostgreSQL authentication configuration
   - Ensure user has proper permissions

4. **Migration Failures**
   - Check PostgreSQL version compatibility
   - Verify all environment variables are set
   - Review migration logs for specific errors

### Getting Help

If you encounter issues:

1. Check the [Prisma documentation](https://www.prisma.io/docs)
2. Review PostgreSQL logs
3. Check your cloud provider's documentation
4. Create an issue in the project repository

## Rollback Procedure

If you need to rollback to SQLite:

1. Stop the application
2. Restore the SQLite schema backup: `cp prisma/schema.prisma.sqlite.backup prisma/schema.prisma`
3. Update `.env` to use SQLite: `DATABASE_URL="file:./dev.db"`
4. Regenerate Prisma client: `npm run db:generate`
5. Restart the application

## Next Steps

After successful migration:

1. Test all application functionality
2. Set up monitoring and alerting
3. Configure automated backups
4. Set up staging environment
5. Plan for scaling and performance optimization