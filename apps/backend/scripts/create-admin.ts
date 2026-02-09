import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/database';

/**
 * Create admin user script
 * Run with: ts-node create-admin.ts
 */

async function createAdmin() {
  try {
    console.log('👑 Creating admin user...');

    // Admin credentials
    const adminData = {
      email: 'admin@dsa-platform.com',
      username: 'admin',
      password: 'Admin@123!',
      firstName: 'Platform',
      lastName: 'Administrator',
      isVerified: true,
      isPremium: true,
      level: 10,
      xp: 10000,
    };

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: adminData.email },
          { username: adminData.username },
        ],
      },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      console.log('   Use the login credentials below to access admin account.');
      
      // Show login info
      console.log('\n🔐 Admin Login Credentials:');
      console.log(`   Email: ${adminData.email}`);
      console.log(`   Password: ${adminData.password}`);
      console.log(`   Login URL: http://localhost:5173/login`);
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        ...adminData,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        level: true,
        xp: true,
        isVerified: true,
        isPremium: true,
        createdAt: true,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Level: ${admin.level}`);
    console.log(`   XP: ${admin.xp}`);

    // Show login info
    console.log('\n🔐 Admin Login Credentials:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log(`   Login URL: http://localhost:5173/login`);

    // Create initial session for admin
    const jwt = await import('jsonwebtoken');
    const { generateToken, generateRefreshToken } = await import('../src/middleware/auth');

    const accessToken = generateToken({
      userId: admin.id,
      email: admin.email,
      username: admin.username,
    });

    const refreshToken = generateRefreshToken({ userId: admin.id });

    // Store refresh token in database
    await prisma.session.create({
      data: {
        userId: admin.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    console.log('\n🎫 Admin Session Created:');
    console.log(`   Access Token: ${accessToken.substring(0, 20)}...`);
    console.log(`   Refresh Token: ${refreshToken.substring(0, 20)}...`);

    console.log('\n🚀 Admin user is ready to use!');
    console.log('   You can now log in with the credentials above.');
    console.log('   The admin has elevated privileges (Level 10, Premium, Verified).');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  createAdmin();
}

export { createAdmin };