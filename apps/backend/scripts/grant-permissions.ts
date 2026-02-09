import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.SUPABASE_DATABASE_URL,
    },
  },
});

async function main() {
  try {
    console.log(
      'URL:',
      process.env.SUPABASE_DATABASE_URL?.replace(/:[^:@]+@/, ':****@')
    );
    console.log('Granting permissions...');
    await prisma.$executeRawUnsafe(
      `GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role`
    );
    await prisma.$executeRawUnsafe(
      `GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role`
    );
    await prisma.$executeRawUnsafe(
      `GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role`
    );
    await prisma.$executeRawUnsafe(
      `GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role`
    );
    console.log('Permissions granted successfully.');
  } catch (error) {
    console.error('Error granting permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
