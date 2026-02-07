#!/bin/bash
set -e

echo "🏥 Starting Swetha Saiphani Clinics Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."

# Extract host and port from DATABASE_URL if DB_HOST/DB_PORT are not set
if [ -n "$DATABASE_URL" ]; then
    # Simple regex to extract host and port from postgresql://user:pass@host:port/db
    DB_HOST_FROM_URL=$(echo $DATABASE_URL | sed -e 's|.*@||' -e 's|/.*||' -e 's|:.*||')
    DB_PORT_FROM_URL=$(echo $DATABASE_URL | sed -e 's|.*:||' -e 's|/.*||')
    
    CHECK_HOST=${DB_HOST:-$DB_HOST_FROM_URL}
    CHECK_PORT=${DB_PORT:-${DB_PORT_FROM_URL:-5432}}
else
    CHECK_HOST=${DB_HOST:-localhost}
    CHECK_PORT=${DB_PORT:-5432}
fi

echo "Checking connectivity to $CHECK_HOST:$CHECK_PORT"
TIMEOUT=30
COUNTER=0
until nc -z $CHECK_HOST $CHECK_PORT || [ $COUNTER -eq $TIMEOUT ]; do
  echo "Database at $CHECK_HOST:$CHECK_PORT is unavailable - sleeping ($COUNTER/$TIMEOUT)"
  sleep 2
  COUNTER=$((COUNTER + 2))
done

if [ $COUNTER -eq $TIMEOUT ]; then
  echo "❌ Error: Database connection timeout after $TIMEOUT seconds."
  echo "Please check if your database is running and the credentials are correct."
  exit 1
fi
echo "✅ Database is available"

# Run Prisma migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Generate Prisma client (in case it's not already generated)
echo "🔧 Generating Prisma client..."
npx prisma generate

# Start the application
echo "🚀 Starting server on port ${PORT:-8080}..."
node dist/server.js
