import { describe, it, expect } from "vitest";
import { s } from "../../src/schema";
import { ValidationError } from "../../src/errors";

describe("StringType", () => {
  describe("basic validation", () => {
    it("should accept valid string", () => {
      const schema = s.string();

      expect(schema.parse("hello")).toBe("hello");
    });

    it("should accept empty string", () => {
      const schema = s.string();

      expect(schema.parse("")).toBe("");
    });

    it("should reject number", () => {
      const schema = s.string();

      expect(() => schema.parse(123)).toThrow(ValidationError);
    });

    it("should reject null", () => {
      const schema = s.string();

      expect(() => schema.parse(null)).toThrow(ValidationError);
    });

    it("should reject undefined", () => {
      const schema = s.string();

      expect(() => schema.parse(undefined)).toThrow(ValidationError);
    });

    it("should reject object", () => {
      const schema = s.string();

      expect(() => schema.parse({})).toThrow(ValidationError);
    });

    it("should reject array", () => {
      const schema = s.string();

      expect(() => schema.parse([])).toThrow(ValidationError);
    });
  });

  describe("min length validation", () => {
    it("should accept string with exact min length", () => {
      const schema = s.string().min(3);

      expect(schema.parse("abc")).toBe("abc");
    });

    it("should accept string longer than min", () => {
      const schema = s.string().min(3);

      expect(schema.parse("abcdef")).toBe("abcdef");
    });

    it("should reject string shorter than min", () => {
      const schema = s.string().min(3);

      expect(() => schema.parse("ab")).toThrow(ValidationError);
    });

    it("should use custom error message", () => {
      const schema = s.string().min(3, { message: "Too short!" });

      const result = schema.safeParse("ab");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Too short!");
      }
    });
  });

  describe("max length validation", () => {
    it("should accept string with exact max length", () => {
      const schema = s.string().max(5);

      expect(schema.parse("abcde")).toBe("abcde");
    });

    it("should accept string shorter than max", () => {
      const schema = s.string().max(5);

      expect(schema.parse("abc")).toBe("abc");
    });

    it("should reject string longer than max", () => {
      const schema = s.string().max(5);

      expect(() => schema.parse("abcdef")).toThrow(ValidationError);
    });

    it("should use custom error message", () => {
      const schema = s.string().max(5, { message: "Too long!" });

      const result = schema.safeParse("abcdef");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Too long!");
      }
    });
  });

  describe("length validation", () => {
    it("should accept string with exact length", () => {
      const schema = s.string().length(5);

      expect(schema.parse("abcde")).toBe("abcde");
    });

    it("should reject string with different length", () => {
      const schema = s.string().length(5);

      expect(() => schema.parse("abc")).toThrow(ValidationError);
      expect(() => schema.parse("abcdef")).toThrow(ValidationError);
    });
  });

  describe("pattern validation", () => {
    it("should accept matching pattern", () => {
      const schema = s.string().pattern(/^[A-Z]+$/);

      expect(schema.parse("ABC")).toBe("ABC");
    });

    it("should reject non-matching pattern", () => {
      const schema = s.string().pattern(/^[A-Z]+$/);

      expect(() => schema.parse("abc")).toThrow(ValidationError);
    });

    it("should use custom error message", () => {
      const schema = s
        .string()
        .pattern(/^[A-Z]+$/, { message: "Must be uppercase" });

      const result = schema.safeParse("abc");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Must be uppercase");
      }
    });
  });

  describe("email validation", () => {
    it("should accept valid email", () => {
      const schema = s.string().email();

      expect(schema.parse("test@example.com")).toBe("test@example.com");
    });

    it("should accept email with subdomain", () => {
      const schema = s.string().email();

      expect(schema.parse("test@mail.example.com")).toBe(
        "test@mail.example.com",
      );
    });

    it("should reject invalid email", () => {
      const schema = s.string().email();

      expect(() => schema.parse("invalid")).toThrow(ValidationError);
      expect(() => schema.parse("missing@domain")).toThrow(ValidationError);
      expect(() => schema.parse("@nodomain.com")).toThrow(ValidationError);
    });

    it("should use custom error message", () => {
      const schema = s.string().email({ message: "Invalid email address" });

      const result = schema.safeParse("invalid");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Invalid email address");
      }
    });
  });

  describe("uuid validation", () => {
    it("should accept valid UUID v4", () => {
      const schema = s.string().uuid();

      expect(schema.parse("550e8400-e29b-41d4-a716-446655440000")).toBe(
        "550e8400-e29b-41d4-a716-446655440000",
      );
    });

    it("should reject invalid UUID", () => {
      const schema = s.string().uuid();

      expect(() => schema.parse("not-a-uuid")).toThrow(ValidationError);
      expect(() => schema.parse("550e8400-e29b-41d4-a716")).toThrow(
        ValidationError,
      );
    });
  });

  describe("date validation", () => {
    it("should accept valid ISO date", () => {
      const schema = s.string().date();

      expect(schema.parse("2024-01-15")).toBe("2024-01-15");
    });

    it("should reject invalid date format", () => {
      const schema = s.string().date();

      expect(() => schema.parse("01-15-2024")).toThrow(ValidationError);
      expect(() => schema.parse("2024/01/15")).toThrow(ValidationError);
    });
  });

  describe("datetime validation", () => {
    it("should accept valid ISO datetime", () => {
      const schema = s.string().datetime();

      expect(schema.parse("2024-01-15T10:30:00Z")).toBe("2024-01-15T10:30:00Z");
    });

    it("should accept datetime with timezone offset", () => {
      const schema = s.string().datetime();

      expect(schema.parse("2024-01-15T10:30:00+05:30")).toBe(
        "2024-01-15T10:30:00+05:30",
      );
    });

    it("should reject invalid datetime", () => {
      const schema = s.string().datetime();

      expect(() => schema.parse("2024-01-15")).toThrow(ValidationError);
      expect(() => schema.parse("not-a-date")).toThrow(ValidationError);
    });
  });

  describe("chaining validators", () => {
    it("should chain min and max", () => {
      const schema = s.string().min(2).max(5);

      expect(schema.parse("abc")).toBe("abc");
      expect(() => schema.parse("a")).toThrow(ValidationError);
      expect(() => schema.parse("abcdef")).toThrow(ValidationError);
    });

    it("should chain email and min", () => {
      const schema = s.string().email().min(10);

      expect(schema.parse("test@test.com")).toBe("test@test.com");
      expect(() => schema.parse("a@b.co")).toThrow(ValidationError);
    });
  });

  describe("nonempty", () => {
    it("should reject empty string", () => {
      const schema = s.string().nonempty();

      expect(() => schema.parse("")).toThrow(ValidationError);
    });

    it("should accept non-empty string", () => {
      const schema = s.string().nonempty();

      expect(schema.parse("a")).toBe("a");
    });

    it("should use custom message", () => {
      const schema = s.string().nonempty({ message: "Required field" });

      const result = schema.safeParse("");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Required field");
      }
    });
  });
});
