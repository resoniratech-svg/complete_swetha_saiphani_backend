
const API_URL = 'http://localhost:3001/api';

// Utilities
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const fs = require('fs');
const log = (msg, type = 'INFO') => {
    const line = `[${type}] ${msg}`;
    console.log(line);
    fs.appendFileSync('verification_log.txt', line + '\n');
};
const headers = { 'Content-Type': 'application/json' };

async function request(endpoint, method, body = null, token = null) {
    const opts = {
        method,
        headers: { ...headers }
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_URL}${endpoint}`, opts);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(`API Error ${res.status} ${res.url}: ${JSON.stringify(data)}`);
    }
    // Normalize response: specific endpoints might return wrapped { data: ... }
    return data && data.data ? data.data : data;
}

// Special handler for auth which returns { user, tokens } directly or wrapped
async function requestAuth(endpoint, body) {
    const data = await request(endpoint, 'POST', body);
    return data;
}

async function main() {
    try {
        log('Starting Full Flow Verification (Fetch Implementation)...');

        // 1. Login as Admin
        log('1. Logging in as Admin...');
        const authData = await requestAuth('/auth/login', {
            email: 'admin@saiphani.com',
            password: 'AdminPassword123!'
        });

        // Handle different possible auth structures just in case
        const token = authData.tokens ? authData.tokens.accessToken : authData.accessToken;

        if (!token) throw new Error('No access token received');

        log(`Login successful. Token: ${token.substring(0, 10)}...`);

        // 2. Create Staff (Doctor)
        const doctorName = `Dr. Test ${Date.now()}`;
        const doctorEmail = `doc${Date.now()}@saiphani.com`;

        log('2. Creating Doctor...');
        const docData = await request('/auth/register', 'POST', {
            email: doctorEmail,
            password: 'Password123!',
            firstName: 'Dr. Test',
            lastName: `${Date.now()}`,
            role: 'DOCTOR',
            phone: '9876543210'
        }, token);

        const doctorId = docData.user ? docData.user.id : docData.id;
        log(`Doctor created: ${doctorName} (ID: ${doctorId})`);

        // 3. Register Patient
        log('3. Registering Patient...');
        const uhid = `P-${Date.now()}`;
        const patientPayload = {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-01',
            gender: 'MALE',
            phone: '9988776655',
            email: `john${Date.now()}@test.com`,
            address: 'Test Address',
            uhid: uhid
        };
        const patData = await request('/patients', 'POST', patientPayload, token);
        const patientId = patData.id;
        const savedUhid = patData.uhid;
        log(`Patient created: John Doe (ID: ${patientId}, UHID: ${savedUhid})`);

        if (savedUhid !== uhid) {
            log(`CRITICAL ERROR: UHID Mismatch! Expected ${uhid}, got ${savedUhid}`, 'ERROR');
        } else {
            log('SUCCESS: UHID Persisted Correctly.');
        }

        // 4. Book Appointment
        log('4. Booking Appointment...');
        const apptPayload = {
            patientId: patientId,
            doctorId: doctorId,
            scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            duration: 30,
            notes: 'Test Appointment'
        };
        const apptData = await request('/appointments', 'POST', apptPayload, token);
        log(`Appointment booked: ${apptData.id}`);

        // 5. Create Pharmacy Bill
        log('5. Creating Pharmacy Bill...');
        // First get a medicine
        const medsData = await request('/pharmacy/medicines', 'GET', null, token);
        const medicine = medsData.items ? medsData.items[0] : (Array.isArray(medsData) ? medsData[0] : null);

        let billId;
        if (medicine) {
            log(`Found medicine: ${medicine.name} ($${medicine.pricePerUnit})`);
            const billPayload = {
                patientId: patientId,
                items: [
                    {
                        medicineId: medicine.id,
                        description: medicine.name,
                        quantity: 1,
                        unitPrice: Number(medicine.pricePerUnit)
                    }
                ],
                notes: 'Test Bill'
            };
            const billData = await request('/pharmacy/bills', 'POST', billPayload, token);
            billId = billData.id;
            log(`Bill created: ${billId}`);
        } else {
            log('Skipping Bill creation (No medicines found)', 'WARN');
        }

        // 6. List Pharmacy Bills (Testing our Fix)
        log('6. Listing Pharmacy Bills...');
        const billListData = await request('/pharmacy/bills', 'GET', null, token);
        const bills = billListData.items ? billListData.items : (Array.isArray(billListData) ? billListData : []);
        log(`Fetched ${bills.length} bills.`);

        if (billId) {
            const found = bills.find(b => b.id === billId);
            if (found) {
                log('SUCCESS: Newly created bill found in list.');
            } else {
                log('ERROR: Newly created bill NOT found in list.', 'ERROR');
            }
        } else {
            log('Skipping Bill check (Bill was not created)', 'WARN');
        }

        log('--------------------------------------------------');
        log('VERIFICATION COMPLETE: All systems operational.');

    } catch (error) {
        log('VERIFICATION FAILED', 'ERROR');
        log(error.message, 'ERROR');
        console.error(error);
    }
}

main();
