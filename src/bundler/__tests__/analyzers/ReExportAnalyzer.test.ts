import { describe, it, expect } from "vitest";
import { ReExportAnalyzer } from "../../analyzers/ReExportAnalyzer";

describe("ReExportAnalyzer", () => {
	describe("extractReExports", () => {
		it("deve extrair re-exports nomeados", () => {
			const code = `export { MyComponent } from './MyComponent';`;
			const reExports = ReExportAnalyzer.extractReExports(code);

			expect(reExports).toHaveLength(1);
			expect(reExports[0].exportedName).toBe("MyComponent");
			expect(reExports[0].originalName).toBe("MyComponent");
			expect(reExports[0].sourceModule).toBe("./MyComponent");
		});

		it("deve extrair re-exports com alias", () => {
			const code = `export { MyComponent as RenamedComponent } from './MyComponent';`;
			const reExports = ReExportAnalyzer.extractReExports(code);

			expect(reExports).toHaveLength(1);
			expect(reExports[0].exportedName).toBe("RenamedComponent");
			expect(reExports[0].originalName).toBe("MyComponent");
		});

		it("deve extrair star exports", () => {
			const code = `export * from './utils';`;
			const reExports = ReExportAnalyzer.extractReExports(code);

			expect(reExports).toHaveLength(1);
			expect(reExports[0].exportedName).toBe("*");
			expect(reExports[0].originalName).toBe("*");
			expect(reExports[0].sourceModule).toBe("./utils");
		});

		it("deve extrair múltiplos re-exports", () => {
			const code = `
				export { ComponentA, ComponentB } from './components';
				export { helper } from './utils';
			`;
			const reExports = ReExportAnalyzer.extractReExports(code);

			expect(reExports).toHaveLength(3);
		});

		it("deve ignorar exports de módulos externos", () => {
			const code = `export { useState } from 'react';`;
			const reExports = ReExportAnalyzer.extractReExports(code);

			expect(reExports).toHaveLength(0);
		});
	});

	describe("isBarrelFile", () => {
		it("deve identificar barrel file simples", () => {
			const code = `
				export { 
					MyComponent,
					MyComponent2,
					MyComponent3,
				 } from './MyComponent';
				export { helper } from './utils';
			`;

			expect(ReExportAnalyzer.isBarrelFile(code)).toBe(true);
		});

		it("deve identificar barrel file com star exports", () => {
			const code = `
				export * from './components';
				export * from './utils';
			`;

			expect(ReExportAnalyzer.isBarrelFile(code)).toBe(true);
		});

		it("deve identificar barrel file com type exports", () => {
			const code = `
				export type { MyType } from './types';
				export { Component } from './Component';
			`;

			expect(ReExportAnalyzer.isBarrelFile(code)).toBe(true);
		});

		it("deve rejeitar arquivo com código além de exports", () => {
			const code = `
				export { Component } from './Component';
				
				const helper = () => 42;
			`;

			expect(ReExportAnalyzer.isBarrelFile(code)).toBe(false);
		});

		it("deve rejeitar arquivo vazio", () => {
			expect(ReExportAnalyzer.isBarrelFile("")).toBe(false);
			expect(ReExportAnalyzer.isBarrelFile("   ")).toBe(false);
		});

		it("deve ignorar comentários ao verificar barrel file", () => {
			const code = `
				// This is a barrel file
				export { Component } from './Component';
				/* Another comment */
				export { helper } from './utils';
			`;

			expect(ReExportAnalyzer.isBarrelFile(code)).toBe(true);
		});
	});
});
