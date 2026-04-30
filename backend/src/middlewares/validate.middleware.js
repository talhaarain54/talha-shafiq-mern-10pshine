import logger from "../utils/logger.js";

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    if (err.issues || err.errors) {
      const errorList = err.issues || err.errors;
      
      const messages = errorList.map(e => e.message).join(", ");
      logger.warn(`Validation Failed: ${messages}`);

      return res.status(400).json({
        success: false,
        errors: errorList.map((e) => ({
          field: e.path[e.path.length - 1], 
          message: e.message,
        })),
      });
    }

    next(err);
  }
};

export default validate;