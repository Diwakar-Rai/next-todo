/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         ownerId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     RegisterRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */
