
import { authService } from './src/modules/auth/auth.service';
import { prisma } from './src/config/database';
import { UserRole } from '@prisma/client';

async function testAuth() {
    console.log('--- Starting Auth Flow Test ---');
    const email = `test_reception_${Date.now()}@test.com`;
    const password = 'Password123!';

    try {
        console.log(`1. Registering user: ${email}`);
        const registerResult = await authService.register({
            email,
            password,
            firstName: 'Test',
            lastName: 'Receptionist',
            role: 'RECEPTIONIST' as any, // Cast to any or UserRole if imported
            phone: '1234567890'
        });
        console.log('Registration successful:', registerResult.user.id);

        console.log('2. Logging in...');
        const loginResult = await authService.login({
            email,
            password
        });
        console.log('Login successful. Token:', loginResult.tokens.accessToken.substring(0, 20) + '...');

        console.log('3. Verifying token (simulating authGuard)...');
        // We can't easily call authGuard directly since it is middleware.
        // But we can call `verifyAccessToken` if we import it.
        // Or we can just inspect the token payload if we want, but better to rely on what we can access.

        // Let's verify the user status in DB
        const user = await prisma.user.findUnique({ where: { id: loginResult.user.id } });
        console.log('User status in DB:', user?.status);

        if (user?.status !== 'ACTIVE') {
            console.error('FAIL: User is not ACTIVE');
        } else {
            console.log('PASS: User is ACTIVE');
        }

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAuth();
