import { Router } from 'express';
import { createBill, getBills, getBillById, updateBillStatus, getBillingStats } from './billing.controller.js';
import { authGuard } from '../../middleware/authGuard.js';
import { roleGuard } from '../../middleware/roleGuard.js';
import { UserRole } from '@prisma/client';

const router = Router();

// Authentication required for all billing routes
router.use(authGuard);

// Role guard for ADMIN and RECEPTIONIST only
const billingRoleGuard = roleGuard(UserRole.ADMIN, UserRole.RECEPTIONIST);

// All billing operations restricted to ADMIN and RECEPTIONIST only
router.post('/', billingRoleGuard, createBill);
router.get('/', billingRoleGuard, getBills);
router.get('/stats', billingRoleGuard, getBillingStats);
router.get('/:id', billingRoleGuard, getBillById);
router.patch('/:id/status', billingRoleGuard, updateBillStatus);

export default router;
