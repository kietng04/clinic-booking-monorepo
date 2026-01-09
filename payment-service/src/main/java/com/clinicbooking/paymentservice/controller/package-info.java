/**
 * REST Controller classes for Payment Service
 * - PaymentController: Main payment REST endpoints (authenticated)
 *   - POST /api/payments: Create payment
 *   - GET /api/payments/{orderId}: Get payment details
 *   - GET /api/payments/appointment/{appointmentId}: Get payment by appointment
 *   - GET /api/payments/user/{userId}: Get user payment history
 *   - POST /api/payments/{orderId}/query: Query Momo payment status
 *   - POST /api/payments/{orderId}/refund: Request refund
 *   - GET /api/payments/{orderId}/refunds: Get refund history
 *
 * - MomoCallbackController: Momo webhook endpoints (public, no auth)
 *   - POST /api/payments/momo/callback: Momo IPN webhook
 *   - GET /api/payments/momo/return: Return URL after payment
 */
package com.clinicbooking.paymentservice.controller;
