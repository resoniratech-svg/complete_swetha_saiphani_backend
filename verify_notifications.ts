import { prisma } from "./src/config/database";
import { NotificationService } from "./src/modules/notification/notification.service";

async function main() {
    console.log("Starting Notifications API Verification...");

    const notificationService = new NotificationService();

    // 1. Get a test user (Patient)
    const patient = await prisma.user.findFirst({
        where: { role: "PATIENT" },
    });

    if (!patient) {
        console.error("No patient found to test with.");
        return;
    }

    const userId = patient.id;
    console.log(`Using user: ${userId}`);

    // 2. Create a dummy notification
    console.log("Creating test notification...");
    const newNotification = await notificationService.createNotification({
        recipientId: userId,
        title: "Test Notification",
        message: "This is a test notification from verification script.",
        type: "info",
    });
    console.log("Created notification:", newNotification.id);

    // 3. Test getNotifications
    console.log("Fetching notifications...");
    const notifications = await notificationService.getNotifications(userId);
    const found = notifications.find(n => n.id === newNotification.id);

    if (found) {
        console.log("PASS: Notification found in list.");
    } else {
        console.error("FAIL: Created notification not found in list.");
    }

    // 4. Test getUnreadCount
    console.log("Fetching unread count...");
    const countBefore = await notificationService.getUnreadCount(userId);
    console.log("Unread count:", countBefore);

    if (countBefore > 0) {
        console.log("PASS: Unread count > 0");
    } else {
        console.error("FAIL: Unread count should be > 0");
    }

    // 5. Test markAsRead
    console.log("Marking notification as read...");
    const success = await notificationService.markAsRead(newNotification.id, userId);

    if (success) {
        console.log("PASS: Notification marked as read.");
    } else {
        console.error("FAIL: Failed to mark notification as read.");
    }

    // Verify it is read
    const updatedNotification = await prisma.notification.findUnique({
        where: { id: newNotification.id }
    });

    if (updatedNotification?.read) {
        console.log("PASS: Database confirms notification is read.");
    } else {
        console.error("FAIL: Database shows notification is still unread.");
    }

    // 6. Test markAllAsRead
    // Create another unread one first
    await notificationService.createNotification({
        recipientId: userId,
        title: "Another Test",
        message: "Testing mark all as read",
    });

    console.log("Marking ALL as read...");
    const updateCount = await notificationService.markAllAsRead(userId);
    console.log(`Marked ${updateCount} notifications as read.`);

    const countAfter = await notificationService.getUnreadCount(userId);
    if (countAfter === 0) {
        console.log("PASS: Unread count is 0 after markAllAsRead.");
    } else {
        console.error(`FAIL: Unread count is ${countAfter} (expected 0).`);
    }

    console.log("Verification checks completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
