import { Router } from "express";
import { authGuard } from "../../middleware/authGuard.js";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from "./notification.controller.js";

const router = Router();

// All routes require authentication
router.use(authGuard);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);

export const notificationRoutes = router;
