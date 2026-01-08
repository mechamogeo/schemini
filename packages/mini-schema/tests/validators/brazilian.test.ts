import { describe, expect, it } from "vitest";
import { ValidationError } from "../../src/errors";
import { s } from "../../src/schema";
import { isValidCEP, isValidCNPJ, isValidCPF } from "../../src/validators";

describe("Brazilian Validators", () => {
  describe("CPF", () => {
    describe("isValidCPF function", () => {
      it("should accept valid CPF without formatting", () => {
        // Valid CPFs (generated for testing)
        expect(isValidCPF("52998224725")).toBe(true);
        expect(isValidCPF("11144477735")).toBe(true);
      });

      it("should accept valid CPF with formatting", () => {
        expect(isValidCPF("529.982.247-25")).toBe(true);
        expect(isValidCPF("111.444.777-35")).toBe(true);
      });

      it("should reject CPF with wrong check digits", () => {
        expect(isValidCPF("52998224726")).toBe(false);
        expect(isValidCPF("11144477700")).toBe(false);
      });

      it("should reject CPF with wrong length", () => {
        expect(isValidCPF("1234567890")).toBe(false);
        expect(isValidCPF("123456789012")).toBe(false);
        expect(isValidCPF("")).toBe(false);
      });

      it("should reject CPF with all same digits", () => {
        expect(isValidCPF("00000000000")).toBe(false);
        expect(isValidCPF("11111111111")).toBe(false);
        expect(isValidCPF("99999999999")).toBe(false);
      });
    });

    describe("s.string().cpf()", () => {
      it("should accept valid CPF", () => {
        const schema = s.string().cpf();
        expect(schema.parse("52998224725")).toBe("52998224725");
        expect(schema.parse("529.982.247-25")).toBe("529.982.247-25");
      });

      it("should reject invalid CPF", () => {
        const schema = s.string().cpf();
        expect(() => schema.parse("12345678901")).toThrow(ValidationError);
      });

      it("should return invalid_string error with cpf format", () => {
        const schema = s.string().cpf();
        const result = schema.safeParse("12345678901");

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.code).toBe("invalid_string");
          expect(result.error.issues[0]?.expected).toBe("cpf");
        }
      });
    });
  });

  describe("CNPJ", () => {
    describe("isValidCNPJ function", () => {
      it("should accept valid CNPJ without formatting", () => {
        // Valid CNPJs (generated for testing)
        expect(isValidCNPJ("11222333000181")).toBe(true);
        expect(isValidCNPJ("11444777000161")).toBe(true);
      });

      it("should accept valid CNPJ with formatting", () => {
        expect(isValidCNPJ("11.222.333/0001-81")).toBe(true);
        expect(isValidCNPJ("11.444.777/0001-61")).toBe(true);
      });

      it("should reject CNPJ with wrong check digits", () => {
        expect(isValidCNPJ("11222333000182")).toBe(false);
        expect(isValidCNPJ("11444777000100")).toBe(false);
      });

      it("should reject CNPJ with wrong length", () => {
        expect(isValidCNPJ("1122233300018")).toBe(false);
        expect(isValidCNPJ("112223330001811")).toBe(false);
        expect(isValidCNPJ("")).toBe(false);
      });

      it("should reject CNPJ with all same digits", () => {
        expect(isValidCNPJ("00000000000000")).toBe(false);
        expect(isValidCNPJ("11111111111111")).toBe(false);
        expect(isValidCNPJ("99999999999999")).toBe(false);
      });
    });

    describe("s.string().cnpj()", () => {
      it("should accept valid CNPJ", () => {
        const schema = s.string().cnpj();
        expect(schema.parse("11222333000181")).toBe("11222333000181");
        expect(schema.parse("11.222.333/0001-81")).toBe("11.222.333/0001-81");
      });

      it("should reject invalid CNPJ", () => {
        const schema = s.string().cnpj();
        expect(() => schema.parse("12345678901234")).toThrow(ValidationError);
      });

      it("should return invalid_string error with cnpj format", () => {
        const schema = s.string().cnpj();
        const result = schema.safeParse("12345678901234");

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.code).toBe("invalid_string");
          expect(result.error.issues[0]?.expected).toBe("cnpj");
        }
      });
    });
  });

  describe("CEP", () => {
    describe("isValidCEP function", () => {
      it("should accept valid CEP without formatting", () => {
        expect(isValidCEP("01310100")).toBe(true);
        expect(isValidCEP("12345678")).toBe(true);
      });

      it("should accept valid CEP with formatting", () => {
        expect(isValidCEP("01310-100")).toBe(true);
        expect(isValidCEP("12345-678")).toBe(true);
      });

      it("should reject CEP with wrong length", () => {
        expect(isValidCEP("1234567")).toBe(false);
        expect(isValidCEP("123456789")).toBe(false);
        expect(isValidCEP("")).toBe(false);
      });

      it("should reject CEP with all zeros", () => {
        expect(isValidCEP("00000000")).toBe(false);
        expect(isValidCEP("00000-000")).toBe(false);
      });
    });

    describe("s.string().cep()", () => {
      it("should accept valid CEP", () => {
        const schema = s.string().cep();
        expect(schema.parse("01310100")).toBe("01310100");
        expect(schema.parse("01310-100")).toBe("01310-100");
      });

      it("should reject invalid CEP", () => {
        const schema = s.string().cep();
        expect(() => schema.parse("1234567")).toThrow(ValidationError);
        expect(() => schema.parse("00000000")).toThrow(ValidationError);
      });

      it("should return invalid_string error with cep format", () => {
        const schema = s.string().cep();
        const result = schema.safeParse("invalid");

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.code).toBe("invalid_string");
          expect(result.error.issues[0]?.expected).toBe("cep");
        }
      });
    });
  });

  describe("combinations", () => {
    it("should work with other string validators", () => {
      const schema = s.string().nonempty().cpf();
      expect(schema.parse("52998224725")).toBe("52998224725");
      expect(() => schema.parse("")).toThrow(ValidationError);
    });
  });
});
