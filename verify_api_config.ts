
import * as fs from 'fs';

const BASE_URL = 'http://localhost:3001';
const LOG_FILE = 'api_check.log';

function log(message: string, ...args: any[]) {
    const msg = message + ' ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + '\n');
}

async function runTest() {
    fs.writeFileSync(LOG_FILE, 'Starting API Check...\n');
    log('Starting API Configuration Check...');

    // 1. Health Check
    try {
        const healthRes = await fetch(`${BASE_URL}/health`);
        const healthData = await healthRes.json();
        log('✅ Health Check: Success', healthData);
    } catch (error: any) {
        log('❌ Health Check: Failed', error.message);
    }

    // 2. Register User (Patient)
    const testUser = {
        email: `test_${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '9999999999',
        role: 'PATIENT'
    };

    let token = '';

    try {
        log(`\nAttempting to register user: ${testUser.email}`);
        const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        if (registerRes.ok) {
            const data: any = await registerRes.json();
            log('✅ Register: Success');
            if (data.data && data.data.tokens) {
                token = data.data.tokens.accessToken;
            }
        } else {
            const text = await registerRes.text();
            log('❌ Register: Failed', registerRes.status, text);
        }
    } catch (error: any) {
        log('❌ Register: Network Error', error.message);
    }

    // 3. Login (if token not received from register)
    if (!token) {
        try {
            log('\nAttempting to login...');
            const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testUser.email,
                    password: testUser.password
                })
            });

            if (loginRes.ok) {
                const data: any = await loginRes.json();
                log('✅ Login: Success');
                token = data.data.tokens.accessToken;
            } else {
                const text = await loginRes.text();
                log('❌ Login: Failed', loginRes.status, text);
                return;
            }
        } catch (error: any) {
            log('❌ Login: Network Error', error.message);
            return;
        }
    }

    // 4. Fetch Profile (GET /api/users/me)
    if (token) {
        try {
            log('\nAttempting to fetch user profile...');
            const meRes = await fetch(`${BASE_URL}/api/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (meRes.ok) {
                const data: any = await meRes.json();
                log('✅ Fetch Profile: Success', data.data.email);
            } else {
                const text = await meRes.text();
                log('❌ Fetch Profile: Failed', meRes.status, text);
            }
        } catch (error: any) {
            log('❌ Fetch Profile: Network Error', error.message);
        }

        // 5. Fetch Patient Profile confirm it exists (GET /api/patients/me)
        try {
            log('\nAttempting to fetch patient profile...');
            const patientMeRes = await fetch(`${BASE_URL}/api/patients/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (patientMeRes.ok) {
                const data = await patientMeRes.json();
                log('✅ Fetch Patient Profile: Success', data);
            } else {
                const text = await patientMeRes.text();
                log('❌ Fetch Patient Profile: Failed', patientMeRes.status, text);
            }
        } catch (error: any) {
            log('❌ Fetch Patient Profile: Network Error', error.message);
        }
    }
}

runTest();
