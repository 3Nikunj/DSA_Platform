#!/bin/bash

# PostgreSQL Migration Script for DSA Learning Platform
# This script helps migrate from SQLite to PostgreSQL for production deployment

echo "🔧 DSA Learning Platform - PostgreSQL Migration Script"
echo "=================================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate environment variables
validate_env() {
    if [ -z "$DATABASE_URL" ]; then
        echo "❌ Error: DATABASE_URL environment variable is not set"
        echo "Please set your PostgreSQL connection string:"
        echo "export DATABASE_URL=\"postgresql://username:password@host:port/database?schema=public\""
        exit 1
    fi
    
    if [ -z "$JWT_SECRET" ] || [ -z "$JWT_REFRESH_SECRET" ]; then
        echo "❌ Error: JWT secrets are not configured"
        echo "Please set JWT_SECRET and JWT_REFRESH_SECRET environment variables"
        exit 1
    fi
}

# Function to backup SQLite database
backup_sqlite() {
    echo "📦 Backing up SQLite database..."
    if [ -f "prisma/dev.db" ]; then
        cp prisma/dev.db "prisma/dev.db.backup.$(date +%Y%m%d_%H%M%S)"
        echo "✅ SQLite database backed up successfully"
    else
        echo "⚠️  No SQLite database found, skipping backup"
    fi
}

# Function to update Prisma schema to PostgreSQL
update_schema() {
    echo "🔄 Updating Prisma schema to PostgreSQL..."
    
    # Backup current schema
    cp prisma/schema.prisma prisma/schema.prisma.sqlite.backup
    
    # Update provider to PostgreSQL
    sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
    
    # Add directUrl for connection pooling if not present
    if ! grep -q "directUrl" prisma/schema.prisma; then
        sed -i '/url      = env("DATABASE_URL")/a\  directUrl = env("DATABASE_URL")' prisma/schema.prisma
    fi
    
    echo "✅ Prisma schema updated to PostgreSQL"
}

# Function to generate Prisma client
generate_client() {
    echo "🎯 Generating Prisma client for PostgreSQL..."
    npm run db:generate
    
    if [ $? -eq 0 ]; then
        echo "✅ Prisma client generated successfully"
    else
        echo "❌ Failed to generate Prisma client"
        exit 1
    fi
}

# Function to create and run migrations
create_migrations() {
    echo "🚀 Creating and running PostgreSQL migrations..."
    
    # Create initial migration
    npm run db:migrate
    
    if [ $? -eq 0 ]; then
        echo "✅ PostgreSQL migrations completed successfully"
    else
        echo "❌ Failed to run migrations"
        echo "Please check your PostgreSQL connection and try again"
        exit 1
    fi
}

# Function to seed database (optional)
seed_database() {
    read -p "🌱 Do you want to seed the database with sample data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Seeding database..."
        npm run db:seed
        echo "✅ Database seeded successfully"
    else
        echo "⏭️  Skipping database seeding"
    fi
}

# Function to verify connection
verify_connection() {
    echo "🔍 Verifying PostgreSQL connection..."
    
    # Create a simple test script
    cat > test-connection.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to PostgreSQL');
    
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('Current database time:', result[0].now);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
EOF

    node test-connection.js
    local result=$?
    rm test-connection.js
    
    return $result
}

# Function to update environment configuration
update_env_config() {
    echo "⚙️  Updating environment configuration..."
    
    # Check if .env file exists
    if [ -f ".env" ]; then
        # Backup current .env
        cp .env .env.sqlite.backup
        
        # Update DATABASE_URL comment
        sed -i 's/# Database Configuration - SQLite for development/# Database Configuration - PostgreSQL for production/' .env
        
        echo "✅ Environment configuration updated"
        echo "Please ensure your DATABASE_URL is set correctly in the .env file"
    else
        echo "⚠️  No .env file found. Please create one with your PostgreSQL configuration."
    fi
}

# Function to create Supabase-specific configuration
setup_supabase() {
    echo "🎯 Setting up Supabase-specific configuration..."
    
    # Add SSL mode for Supabase
    if [[ "$DATABASE_URL" == *"supabase.co"* ]]; then
        echo "Detected Supabase URL, adding SSL configuration..."
        
        # Update schema.prisma for Supabase
        if ! grep -q "directUrl" prisma/schema.prisma; then
            sed -i '/url      = env("DATABASE_URL")/a\  directUrl = env("DATABASE_URL")' prisma/schema.prisma
        fi
        
        echo "✅ Supabase configuration completed"
        echo "Make sure your DATABASE_URL includes ?sslmode=require for production"
    fi
}

# Main migration process
main() {
    echo "Starting PostgreSQL migration process..."
    echo
    
    # Validate prerequisites
    if ! command_exists node; then
        echo "❌ Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command_exists npm; then
        echo "❌ npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Validate environment
    validate_env
    
    # Confirm migration
    echo "⚠️  WARNING: This will migrate your database from SQLite to PostgreSQL"
    echo "   - SQLite data will be backed up"
    echo "   - Prisma schema will be updated"
    echo "   - New PostgreSQL migrations will be created"
    echo
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Migration cancelled."
        exit 0
    fi
    
    # Execute migration steps
    backup_sqlite
    update_env_config
    update_schema
    setup_supabase
    generate_client
    
    echo
    echo "🔍 Testing PostgreSQL connection..."
    if verify_connection; then
        echo "✅ PostgreSQL connection verified"
        create_migrations
        seed_database
        
        echo
        echo "🎉 PostgreSQL migration completed successfully!"
        echo
        echo "Next steps:"
        echo "1. Update your deployment configuration to use PostgreSQL"
        echo "2. Test your application thoroughly"
        echo "3. Update any environment-specific configurations"
        echo "4. Consider setting up database backups"
        echo
        echo "To rollback to SQLite if needed:"
        echo "- Restore .env.sqlite.backup"
        echo "- Restore prisma/schema.prisma.sqlite.backup"
        echo "- Run: npm run db:generate"
        
    else
        echo "❌ PostgreSQL connection failed"
        echo "Please check your DATABASE_URL and try again"
        echo "Migration has been reverted to SQLite"
        
        # Revert changes
        echo "Reverting changes..."
        cp prisma/schema.prisma.sqlite.backup prisma/schema.prisma
        npm run db:generate
        
        exit 1
    fi
}

# Run the migration
main "$@"