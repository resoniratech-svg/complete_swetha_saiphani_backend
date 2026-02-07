
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ALLOWED_DOCTORS = [
    "Dr.B.Sai Phani Chandra",
    "Dr.D.Hari Prakash",
    "Dr.Roshan Kumar Jaiswal",
    "Dr.Swetha Pendyala",
    "Dr.Ravikanti Nagaraju"
];

async function main() {
    try {
        console.log("Starting doctor cleanup...");

        // Fetch all users with role DOCTOR
        const doctors = await prisma.user.findMany({
            where: {
                role: 'DOCTOR'
            },
            include: {
                staff: true
            }
        });

        console.log(`Found ${doctors.length} doctors in database.`);

        for (const doc of doctors) {
            // Construct full name from staff profile or fallback to "Unknown"
            const fullName = doc.staff
                ? `${doc.staff.firstName} ${doc.staff.lastName}`.trim()
                : "Unknown";

            // Check if exact match (case insensitive roughly, but allowed list is specific)
            // We'll normalize to lowercase for comparison to be safe
            const isAllowed = ALLOWED_DOCTORS.some(allowed =>
                allowed.toLowerCase() === fullName.toLowerCase()
            );

            if (!isAllowed) {
                console.log(`⚠️ Identifying UNAUTHORIZED doctor: "${fullName}" (ID: ${doc.id}) - DELETING...`);
                // Delete the user (cascade will handle staff/refresh tokens)
                await prisma.user.delete({
                    where: { id: doc.id }
                });
                console.log(`✅ Deleted "${fullName}"`);
            } else {
                console.log(`✓ Keeping valid doctor: "${fullName}"`);
            }
        }

        console.log("Cleanup complete.");

    } catch (error) {
        console.error("Error during cleanup:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
