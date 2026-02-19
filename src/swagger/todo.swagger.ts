/**
 * @swagger
 * tags:
 *  - name: Todos
 *    description: Todo management API
 */

/**
 * @swagger
 * /api/todos:
 *  post:
 *      summary: creates a todo
 *  tags:
 *      -Todos
 *  requestBody:
 *      required: true
 *  content:
 *      application/json:
 *      schema:
 *          type: object
 *          properties:
 *              title:
 *                  type: string
 *              description:
 *                  type: string
 *              categoryId:
 *                  type: string
 *  Responses:
 *      201:
 *          description: Todo created
 *      400:
 *          description: Validation Error
 *      401:
 *          description: Forbidden
 *      403:
 *          description: Unauthorized
 *
 */
