/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get categories
 *     tags:
 *       - Categories
 *     description: |
 *       USER -> gets only own categories
 *       ADMIN -> gets all categories
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create category
 *     tags:
 *       - Categories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
