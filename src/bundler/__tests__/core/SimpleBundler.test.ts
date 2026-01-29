import { describe, it, expect } from "vitest";
import { SimpleBundler } from "../../core/SimpleBundler";

describe("SimpleBundler", () => {
	describe("constructor validation", () => {
		it("deve lançar erro para srcPath vazio", async () => {
			expect(() => new SimpleBundler("", "/output")).toThrow(
				"srcPath não pode ser vazio",
			);
		});

		it("deve lançar erro para outputDir vazio", async () => {
			expect(() => new SimpleBundler("/src", "")).toThrow(
				"outputDir não pode ser vazio",
			);
		});

		it("deve lançar erro para path inexistente", async () => {
			expect(
				() => new SimpleBundler("/path/that/does/not/exist/xyz123", "/output"),
			).toThrow("Path não encontrado");
		});
	});

	describe("bundle process conceptual", () => {
		it("deve existir método bundle", async () => {
			const module = await import("../../core/SimpleBundler");
			const SimpleBundler = module.SimpleBundler;

			expect(SimpleBundler.prototype.bundle).toBeDefined();
			expect(typeof SimpleBundler.prototype.bundle).toBe("function");
		});
	});
});
