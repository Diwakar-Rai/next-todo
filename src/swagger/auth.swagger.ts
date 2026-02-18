/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication APIs
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Missing fields
 *       409:
 *         description: Email already in use
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user (credentials)
 *     description: |
 *       This endpoint represents the Credentials login flow handled internally by NextAuth.
 *       In production, login is processed via NextAuth callback routes.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
