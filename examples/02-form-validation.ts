/**
 * Form Validation Examples
 *
 * Demonstrates how to use @schemini/core for validating form data,
 * including coercion for converting string inputs to proper types.
 */

import { s, ValidationError } from "@schemini/core";

// ============================================================================
// 1. Registration Form with Coercion
// ============================================================================

/**
 * Form inputs are typically strings from HTML forms.
 * Use s.coerce to automatically convert them to proper types.
 */
const registrationSchema = s.object({
  username: s
    .string()
    .min(3)
    .max(20)
    .pattern(/^[a-zA-Z0-9_]+$/),
  email: s.string().email(),
  password: s
    .string()
    .min(8)
    .refine((val) => /[A-Z]/.test(val), "Must contain uppercase")
    .refine((val) => /[a-z]/.test(val), "Must contain lowercase")
    .refine((val) => /[0-9]/.test(val), "Must contain number"),
  age: s.coerce.number().int().min(13).max(120),
  termsAccepted: s.coerce.boolean(),
  newsletter: s.coerce.boolean().optional(),
});

type RegistrationData = s.infer<typeof registrationSchema>;

// Simulating form data (all strings, like from FormData)
const formData = {
  username: "john_doe",
  email: "john@example.com",
  password: "SecurePass123",
  age: "25", // string from input
  termsAccepted: "true", // string from checkbox
  newsletter: "false",
};

const result = registrationSchema.safeParse(formData);

if (result.success) {
  console.log("Registration valid:", result.data);
  // { username: 'john_doe', email: '...', password: '...', age: 25, termsAccepted: true, newsletter: false }
} else {
  console.log("Validation errors:");
  for (const issue of result.error.issues) {
    console.log(`  ${issue.path.join(".")}: ${issue.message}`);
  }
}

// ============================================================================
// 2. Contact Form
// ============================================================================

const contactFormSchema = s.object({
  name: s
    .string()
    .min(1)
    .max(100)
    .transform((v) => v.trim()),
  email: s.string().email(),
  phone: s.string().phone().optional(),
  subject: s.enum(["general", "support", "sales", "feedback"] as const),
  message: s
    .string()
    .min(10)
    .max(5000)
    .transform((v) => v.trim()),
});

type ContactForm = s.infer<typeof contactFormSchema>;

// ============================================================================
// 3. Address Form
// ============================================================================

const addressSchema = s.object({
  street: s.string().min(1).max(200),
  number: s.coerce.number().int().positive(),
  complement: s.string().max(100).optional(),
  neighborhood: s.string().min(1).max(100),
  city: s.string().min(1).max(100),
  state: s.string().min(2).max(2),
  zipCode: s.string().cep(), // Brazilian CEP validation
  country: s.string().default("BR"),
});

type Address = s.infer<typeof addressSchema>;

// ============================================================================
// 4. Payment Form with Brazilian Validators
// ============================================================================

const paymentFormSchema = s.object({
  cardholderName: s.string().min(1),
  // Using refine for card number (Luhn algorithm could be added)
  cardNumber: s.string().pattern(/^\d{16}$/),
  expiryMonth: s.coerce.number().int().min(1).max(12),
  expiryYear: s.coerce.number().int().min(2024).max(2050),
  cvv: s.string().pattern(/^\d{3,4}$/),
  cpf: s.string().cpf(), // Brazilian CPF validation
  billingAddress: addressSchema,
});

type PaymentForm = s.infer<typeof paymentFormSchema>;

// ============================================================================
// 5. Multi-step Form
// ============================================================================

// Step 1: Personal Info
const step1Schema = s.object({
  firstName: s.string().min(1).max(50),
  lastName: s.string().min(1).max(50),
  birthDate: s.string().date(),
  cpf: s.string().cpf(),
});

// Step 2: Contact Info
const step2Schema = s.object({
  email: s.string().email(),
  phone: s.string().phone(),
  alternativePhone: s.string().phone().optional(),
});

// Step 3: Address
const step3Schema = addressSchema;

// Complete form (merge all steps)
const completeFormSchema = s.object({
  ...step1Schema.pick(["firstName", "lastName", "birthDate", "cpf"]).shape,
  ...step2Schema.shape,
  address: step3Schema,
});

// Validate each step independently
function validateStep(step: number, data: unknown) {
  switch (step) {
    case 1:
      return step1Schema.safeParse(data);
    case 2:
      return step2Schema.safeParse(data);
    case 3:
      return step3Schema.safeParse(data);
    default:
      throw new Error("Invalid step");
  }
}

// ============================================================================
// 6. Dynamic Form with Conditional Fields
// ============================================================================

const personTypeSchema = s.enum(["individual", "company"] as const);

// Individual form
const individualSchema = s.object({
  type: s.literal("individual"),
  cpf: s.string().cpf(),
  name: s.string().min(1),
  birthDate: s.string().date(),
});

// Company form
const companySchema = s.object({
  type: s.literal("company"),
  cnpj: s.string().cnpj(),
  companyName: s.string().min(1),
  tradeName: s.string().min(1).optional(),
  foundedDate: s.string().date().optional(),
});

// Union of both forms
const personSchema = s.union([individualSchema, companySchema]);
type Person = s.infer<typeof personSchema>;

// Validate based on type
function validatePerson(data: { type: string; [key: string]: unknown }) {
  return personSchema.safeParse(data);
}

// ============================================================================
// 7. File Upload Form
// ============================================================================

const fileUploadSchema = s.object({
  title: s.string().min(1).max(200),
  description: s.string().max(2000).optional(),
  category: s.enum(["document", "image", "video", "other"] as const),
  // File metadata (actual file handled separately)
  fileName: s.string().min(1),
  fileSize: s
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024), // 10MB max
  mimeType: s.string().pattern(/^[\w-]+\/[\w-]+$/),
  tags: s.array(s.string().min(1).max(50)).max(10).optional(),
});

// ============================================================================
// 8. Helper: Form Error Formatter
// ============================================================================

interface FormError {
  field: string;
  message: string;
}

function formatFormErrors(error: ValidationError): FormError[] {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

// Usage
const badFormData = {
  username: "ab", // too short
  email: "not-an-email",
  password: "weak",
  age: "invalid",
  termsAccepted: "true",
};

const badResult = registrationSchema.safeParse(badFormData);
if (!badResult.success) {
  const errors = formatFormErrors(badResult.error);
  console.log("Form errors:");
  for (const err of errors) {
    console.log(`  ${err.field}: ${err.message}`);
  }
}
