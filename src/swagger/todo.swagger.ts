/**
 * @swagger
 * tags:
 *   - name: Todos
 *     description: Todo management API
 */

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Creates a todo
 *     tags:
 *       - Todos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Todo created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /api/todos:
 *  get:
 *      summary: Get todos
 *      tags:
 *          - Todos
 *      description: |
 *          USER -> gets only own todos
 *          ADMIN -> gets all todos
 *          Soft-deleted todos are excluded
 *      responses:
 *          200:
 *              description: List of todos
 *          401:
 *              description: Unauthorized
 */
