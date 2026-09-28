const { z } = require("zod");

const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input.",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req[source] = result.data;
    next();
  };
};

const schemas = {
  register: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(8).max(128),
  }).strict(),

  login: z.object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).max(128),
  }).strict(),

  forgotPassword: z.object({
    email: z.string().trim().toLowerCase().email().max(254),
  }).strict(),

  resetPassword: z.object({
    password: z.string().min(8).max(128),
  }).strict(),

  paymentReference: z.object({
    paymentReference: z.string().trim().regex(
      /^SPV-[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      "Invalid payment reference."
    ),
  }).strict(),

  submitTransaction: z.object({
    paymentReference: z.string().trim().regex(
      /^SPV-[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      "Invalid payment reference."
    ),
    transactionHash: z.string().trim().regex(
      /^[a-f0-9]{64}$/i,
      "Invalid transaction hash."
    ),
  }).strict(),

  paymentAmount: z.object({
    amount: z.coerce.number().finite().positive(),
  }).strict(),

  documentId: z.object({
    documentId: z.string().regex(
      /^[a-f0-9]{24}$/i,
      "Invalid document ID."
    ),
  }).strict(),

  token: z.object({
    token: z.string().min(32).max(512),
  }).strict(),
};

module.exports = {
  validate,
  schemas,
};

