/**
 * Validation Middleware - Express 5 Compatible
 * Path: src/middlewares/validate.middleware.js
 * 
 * Factory middleware untuk validasi request dengan Joi
 * Compatible dengan Express 5 (read-only req.query)
 */

/**
 * Validate middleware factory
 * 
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {"body"|"query"|"params"|"headers"} target - Target object to validate (default: "body")
 * @returns {Function} Express middleware function
 */
export function validate(schema, target = "body") {
  return (req, res, next) => {
    // Validate the target object
    const { value, error } = schema.validate(req[target], {
      abortEarly: false,      // Collect all errors
      allowUnknown: false,    // Don't allow unknown fields
      stripUnknown: true,     // Remove unknown fields
    });

    // Handle validation errors
    if (error) {
      const details = error.details?.map(d => d.message) || [error.message];
      
      console.log('Validation errors:', details);
      
      return res.status(400).json({
        code: 400,
        message: "Validation Error",
        data: { errors: details },
        metadata: null,
      });
    }

    // EXPRESS 5 COMPATIBILITY FIX:
    // req.query and req.params are READ-ONLY in Express 5
    // DO NOT try to reassign them - this causes errors
    // 
    // For body - we can safely reassign
    // For query/params - just validate, don't reassign
    
    if (target === "body" || target === "headers") {
      // Safe to reassign body and headers
      req[target] = value;
    }
    
    // For query and params: validation passed, but we don't reassign
    // The controller can use req.query/req.params directly
    // Joi already validated them, so they're safe to use

    next();
  };
}

export default validate;