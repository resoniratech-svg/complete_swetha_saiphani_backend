
import { authService } from './src/modules/auth/auth.service';
import { UserRole } from '@prisma/client';

async function main() {
    console.log('Testing register...');
    try {
        const input = {
            email: `debug_${Date.now()}@example.com`,
            password: 'Password123!',
            firstName: 'Debug',
            lastName: 'User',
            phone: '8888888888',
            role: UserRole.PATIENT
        };
        const result = await authService.register(input);
        const fs = require('fs');
        fs.writeFileSync('SUCCESS.log', 'Success: ' + JSON.stringify(result, null, 2));
        console.log('Success:', result);
    } catch (error) {
        console.error('Error:', error);
        const fs = require('fs');
        fs.writeFileSync('debug_error.log', JSON.stringify(error, null, 2) + '\n' + String(error));
    }
}

main();
