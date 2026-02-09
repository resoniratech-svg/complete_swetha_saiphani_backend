
// Detailed test script to verify billing access for RECEPTIONIST
async function main() {
    console.log('=== DETAILED BILLING ACCESS TEST ===\n');

    const loginUrl = 'http://localhost:3001/api/auth/login';
    const billingUrl = 'http://localhost:3001/api/billing';

    try {
        // Login as receptionist
        console.log('[1] Logging in as reception@saiphani.com...');

        const loginRes = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'reception@saiphani.com',
                password: 'Password123!'
            })
        });

        console.log(`    Status: ${loginRes.status}`);
        const loginData = await loginRes.json();

        if (!loginRes.ok) {
            console.log('    ❌ Login FAILED:', loginData.message || JSON.stringify(loginData));
            return;
        }

        console.log('    ✅ Login SUCCESS');
        console.log('    Role from response:', loginData.data?.user?.role || loginData.user?.role);

        const token = loginData.data?.tokens?.accessToken || loginData.tokens?.accessToken;

        if (!token) {
            console.log('    ❌ No token in response');
            return;
        }

        // Test billing GET endpoint
        console.log('\n[2] Testing GET /api/billing...');
        console.log(`    URL: ${billingUrl}`);

        const billingRes = await fetch(billingUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`    Status: ${billingRes.status}`);
        const billingData = await billingRes.json();
        console.log('    Response:', JSON.stringify(billingData, null, 2));

        if (billingRes.status === 403) {
            console.log('\n❌ RECEPTIONIST DENIED ACCESS TO /api/billing');
            console.log('   Error:', billingData.message);
        } else if (billingRes.ok) {
            console.log('\n✅ RECEPTIONIST CAN ACCESS /api/billing!');
        } else {
            console.log('\n⚠ Unexpected response status:', billingRes.status);
        }

    } catch (e) {
        console.error('Request failed:', e);
    }
}

main();
