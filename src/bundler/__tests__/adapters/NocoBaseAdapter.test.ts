import { describe, it, expect } from "vitest";
import { NocoBaseAdapter } from "@bundler/adapters/NocoBaseAdapter";
import { APP_CONFIG } from "@/config/config";

describe("NocoBaseAdapter", () => {
	describe("processComments", () => {
		it("deve manter código com //bundle-only", () => {
			const code = `
                    const a = 1;
                    //bundle-only: const b = 2;
                    const c = 3;
                `;

			const result = NocoBaseAdapter.processComments(code);

			expect(result).not.toContain("//bundle-only: const b = 2;");
			expect(result).toContain("const b = 2;");
		});

		it("deve remover código com //no-bundle", () => {
			const code = `
                const a = 1;
                //no-bundle: const debug = true;
                const c = 3;
            `;

			const result = NocoBaseAdapter.processComments(code);

			expect(result).not.toContain("const debug = true;");
			expect(result).toContain("const a = 1;");
			expect(result).toContain("const c = 3;");
		});

		it("deve processar múltiplas diretivas de comentários", () => {
			const code = `
                //bundle-only: const prod = true;
                //bundle-only: const prod2 = false;
                //no-bundle: const dev = true;
                //no-bundle: const dev2 = false;
                const both = true;
            `;

			const result = NocoBaseAdapter.processComments(code);

			expect(result).toContain("const prod = true;");
			expect(result).toContain("const prod2 = false;");
			expect(result).not.toContain("const dev = true;");
			expect(result).not.toContain("const dev2 = false;");
			expect(result).toContain("const both = true;");
		});
	});

	describe("transformImports", () => {
		it("deve tratar imports para bibliotecas do contexto", () => {
			const code = `
                    import { useState, useEffect } from 'react';
                    const Component = () => null };
                `;

			const result = NocoBaseAdapter.transformImports(code);

			expect(result).not.toContain(
				"import { useState, useEffect } from 'react'",
			);
		});

		it("deve adicionar destructuring do ctx.libs", () => {
			const code = `
                import { Button } from 'antd';
                import { Label } from 'antd';
                const Component = () => null;
            `;

			const result = NocoBaseAdapter.transformImports(code);

			expect(result).toContain("const { Button, Label } = ctx.libs.antd");
			expect(result).not.toContain("const { Button } = ctx.libs.antd");
			expect(result).not.toContain("const { Label } = ctx.libs.antd");
		});

		it("deve tratar múltiplas bibliotecas", () => {
			const code = `
                import { useState } from 'react';
                import { useContext } from 'react';
                import { Button } from 'antd';
                import { Label } from 'antd';
                import { Icon } from '@ant-design/icons'

                const Component = () => null;
            `;

			const result = NocoBaseAdapter.transformImports(code);

			expect(result).not.toContain("import");
			expect(result).toContain(
				"const { useState, useContext } = ctx.libs.React",
			);
			expect(result).toContain("const { Button, Label } = ctx.libs.antd");
			expect(result).toContain("const { Icon } = ctx.libs.antdIcons");
			expect(result).toContain("const Component = () => null;");
		});
	});

	describe("generateRender", () => {
		it("deve gerar ctx.render com o componente", () => {
			const componentName = "MyComponent";

			const render = NocoBaseAdapter.generateRender(componentName);

			expect(render).toContain(`ctx.render(<${componentName}  />);`);
			expect(render).toContain(componentName);
		});

		it("deve incluir defaultProps no componente quando fornecido", () => {
			const componentName = "Test";
			const defaultProps = JSON.stringify({
				value: 1,
			});

			const render = NocoBaseAdapter.generateRender(
				componentName,
				defaultProps,
			);

			expect(render).toContain("ctx.render(<Test {...defaultProps} />);");
		});

		it("deve gerar sem defaultProps quando não fornecido", () => {
			const render = NocoBaseAdapter.generateRender("Widget");

			expect(render).toContain("ctx.render(<Widget  />");
			expect(render).not.toContain("{...defaultProps}");
		});
	});

	describe("generateBundleHeader", () => {
		it("deve gerar header com data", () => {
			const header = NocoBaseAdapter.generateBundleHeader();

			expect(header).toContain(
				"// Componente gerado pelo NocoBase Component Generator",
			);
			expect(header).toContain("Data:");
		});
	});

	//! May Remove
	describe("generateExport", () => {
		it("deve gerar export statement para bundle Typescript", () => {
			const exportStmt = NocoBaseAdapter.generateExport("MyComponent");

			expect(exportStmt).toContain("export { MyComponent }");
		});
	});

	describe("shouldIgnoreFile", () => {
		it("deve retornar true para arquivos de teste e mock", () => {
			expect(NocoBaseAdapter.shouldIgnoreFile("component.test.ts")).toBe(true);
			expect(NocoBaseAdapter.shouldIgnoreFile("component.test.js")).toBe(true);
			expect(NocoBaseAdapter.shouldIgnoreFile("component.mock.ts")).toBe(true);
			expect(NocoBaseAdapter.shouldIgnoreFile("component.mock.js")).toBe(true);
			expect(NocoBaseAdapter.shouldIgnoreFile("component.mock.tsx")).toBe(true);
			expect(NocoBaseAdapter.shouldIgnoreFile("component.mock.jsx")).toBe(true);
		});

		it("deve retornar false para arquivos normais", () => {
			expect(NocoBaseAdapter.shouldIgnoreFile("component.ts")).toBe(false);
			expect(NocoBaseAdapter.shouldIgnoreFile("component.js")).toBe(false);
			expect(NocoBaseAdapter.shouldIgnoreFile("component.tsx")).toBe(false);
			expect(NocoBaseAdapter.shouldIgnoreFile("component.jsx")).toBe(false);
			expect(NocoBaseAdapter.shouldIgnoreFile("component.json")).toBe(false);
		});
	});

	describe("shouldIgnoreModule", () => {
		it("deve retornar false para módulos normais (IGNORED_MODULES vazio por padrão)", () => {
			expect(NocoBaseAdapter.shouldIgnoreModule("react")).toBe(false);
			expect(NocoBaseAdapter.shouldIgnoreModule("@nocobase/test")).toBe(false);
		});
	});

	describe("getLibraryKey", () => {
		it("deve retornar chave para biblioteca conhecida", () => {
			const keyMaps = APP_CONFIG.bundler.LIBRARY_MAPPINGS;
			for (const [libName, expectedKey] of Object.entries(keyMaps)) {
				const key = NocoBaseAdapter.getLibraryKey(libName);
				expect(key).toBe(expectedKey);
			}
		});
	});
});
