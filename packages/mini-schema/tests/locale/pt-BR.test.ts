import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { s, setErrorMap, resetErrorMap } from "../../src";
import { ptBR } from "../../src/locale/pt-BR";

describe("locale/pt-BR", () => {
  beforeEach(() => {
    setErrorMap(ptBR);
  });

  afterEach(() => {
    resetErrorMap();
  });

  describe("invalid_type", () => {
    it("should return Portuguese message for type errors", () => {
      const result = s.string().safeParse(123);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Esperado texto, recebido número",
        );
      }
    });
  });

  describe("too_small", () => {
    it("should return Portuguese message for string min length", () => {
      const result = s.string().min(5).safeParse("abc");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Texto deve conter pelo menos 5 caracteres",
        );
      }
    });

    it("should return Portuguese message for number minimum", () => {
      const result = s.number().min(10).safeParse(5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Valor deve ser maior ou igual a 10",
        );
      }
    });

    it("should return Portuguese message for array min length", () => {
      const result = s.array(s.string()).min(2).safeParse(["a"]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Array deve conter pelo menos 2 elementos",
        );
      }
    });
  });

  describe("too_big", () => {
    it("should return Portuguese message for string max length", () => {
      const result = s.string().max(3).safeParse("hello");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Texto deve conter no máximo 3 caracteres",
        );
      }
    });

    it("should return Portuguese message for number maximum", () => {
      const result = s.number().max(5).safeParse(10);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Valor deve ser menor ou igual a 5",
        );
      }
    });
  });

  describe("invalid_string", () => {
    it("should return Portuguese message for invalid email", () => {
      const result = s.string().email().safeParse("invalid");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("E-mail inválido");
      }
    });

    it("should return Portuguese message for invalid UUID", () => {
      const result = s.string().uuid().safeParse("not-a-uuid");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("UUID inválido");
      }
    });

    it("should return Portuguese message for invalid CPF", () => {
      const result = s.string().cpf().safeParse("invalid");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("CPF inválido");
      }
    });
  });

  describe("invalid_enum", () => {
    it("should return Portuguese message for invalid enum", () => {
      const result = s.enum(["a", "b"] as const).safeParse("c");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("Valor inválido");
      }
    });
  });

  describe("invalid_literal", () => {
    it("should return Portuguese message for invalid literal", () => {
      const result = s.literal("expected").safeParse("other");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          "Valor literal inválido",
        );
      }
    });
  });

  describe("invalid_union", () => {
    it("should return Portuguese message for invalid union", () => {
      const result = s.union([s.string(), s.number()]).safeParse(true);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Entrada inválida");
      }
    });
  });
});
