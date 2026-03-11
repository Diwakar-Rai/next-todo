/**
 * @swagger
 * tags:
 *  - name: Profile
 *    description: User Profile Management
 */

/**
 * @swagger
 * /api/profile:
 *      get:
 *          summary: Get current user profile
 *          tags:
 *              - Profile
 *          responses:
 *              200:
 *                  description: User Profile
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Profile'
 *              401:
 *                  description: Unauthorized
 *
 */

/**
 * @swagger
 * /api/profile:
 *  put:
 *      summary: Update user profile
 *      tags:
 *          - Profile
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/UpdateProfileRequest'
 *      responses:
 *          200:
 *              description: Profile updated
 *          400:
 *              description: Validation error
 *          401:
 *              description: Unauthorized
 */

/**
 * @swagger
 * /api/profile/password:
 *   patch:
 *     summary: Change user password
 *     tags:
 *       - Profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Invalid password
 *       401:
 *         description: Unauthorized
 */
