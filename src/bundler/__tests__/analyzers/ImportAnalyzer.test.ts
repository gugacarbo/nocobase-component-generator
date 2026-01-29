import { describe, it, expect } from "vitest";
import { ImportAnalyzer } from "../../analyzers/ImportAnalyzer";

describe("ImportAnalyzer", () => {
	describe("extractImports()", () => {
		it("deve extrair informações completas de imports", () => {
			const code = `
				import { useState, useEffect } from 'react';
				import helpers from './utils';
				import z from 'zod'
				import type { FC } from 'react';
				`;
			const imports = ImportAnalyzer.extractImports(code);

			expect(imports).toHaveLength(4);

			const reactImport = imports.find(i => i.moduleName === "react");
			expect(reactImport?.importedNames).toHaveLength(2);
			expect(reactImport?.importedNames).toContain("useState");
			expect(reactImport?.importedNames).toContain("useEffect");
			expect(reactImport?.isExternal).toBe(true);
			expect(reactImport?.isDefault).toBe(false);
			expect(reactImport?.hasNamedImports).toBe(true);
			expect(reactImport?.isTypeOnly).toBe(false);

			const antdImport = imports.find(i => i.moduleName === "antd");
			expect(antdImport).toBeUndefined();

			const localImport = imports.find(i => i.moduleName === "./utils");
			expect(localImport?.isExternal).toBe(false);
			expect(localImport?.isDefault).toBe(true);
			expect(localImport?.importedNames).toContain("helpers");
			expect(localImport?.hasNamedImports).toBe(false);
			expect(localImport?.isTypeOnly).toBe(false);

			const zodImport = imports.find(i => i.moduleName === "zod");
			expect(zodImport?.isExternal).toBe(true);
			expect(zodImport?.isDefault).toBe(true);
			expect(zodImport?.importedNames).toContain("z");
			expect(zodImport?.hasNamedImports).toBe(false);
			expect(zodImport?.isTypeOnly).toBe(false);

			const typeImport = imports.find(
				i => i.moduleName === "react" && i.isTypeOnly,
			);
			expect(typeImport?.importedNames).toContain("FC");
			expect(typeImport?.isTypeOnly).toBe(true);
		});

		it("deve detectar type-only imports", () => {
			const code = `import type { FC } from 'react';`;
			const imports = ImportAnalyzer.extractImports(code);

			expect(imports[0].isTypeOnly).toBe(true);
		});

		it("deve detectar default imports", () => {
			const code = `import React from 'react';`;
			const imports = ImportAnalyzer.extractImports(code);

			expect(imports[0].isDefault).toBe(true);
			expect(imports[0].importedNames).toContain("React");
		});
	});

	describe("analyzeExternalImports", () => {
		it("deve agregar imports externos de múltiplos arquivos", () => {
			const files = new Map<string, string>([
				["file1.tsx", `import { useState, useEffect } from 'react';`],
				[
					"file2.tsx",
					`import { Button } from 'antd'; import { useState } from 'react';`,
				],
			]);

			const externalImports = ImportAnalyzer.analyzeExternalImports(files);

			expect(externalImports.get("react")).toContain("useState");
			expect(externalImports.get("react")).toContain("useEffect");
			expect(externalImports.get("antd")).toContain("Button");
		});

		it("deve ignorar type imports", () => {
			const files = new Map<string, string>([
				[
					"file1.tsx",
					`import type { FC } from 'react'; import { useState } from 'react';`,
				],
			]);

			const externalImports = ImportAnalyzer.analyzeExternalImports(files);

			expect(externalImports.get("react")?.has("FC")).toBeFalsy();
			expect(externalImports.get("react")?.has("useState")).toBe(true);
		});
	});

	describe("generateImportStatements()", () => {
		it("deve gerar statements de import formatados", () => {
			const imports = new Map<string, Set<string>>([
				["react", new Set(["useState", "useEffect"])],
				["antd", new Set(["Button", "Input"])],
			]);

			const statements = ImportAnalyzer.generateImportStatements(imports);

			expect(statements).toContain(
				"import { useEffect, useState } from 'react'",
			);
			expect(statements).toContain("import { Button, Input } from 'antd'");
		});

		it("deve retornar string vazia para mapa vazio", () => {
			const imports = new Map<string, Set<string>>();
			const statements = ImportAnalyzer.generateImportStatements(imports);

			expect(statements).toBe("");
		});
	});

	describe("removeUnusedImports()", () => {
		it("deve remover imports não utilizados", () => {
			const code = `
					import { useState, useEffect, useCallback } from 'react';

					const Component = () => {
						const [state, setState] = useState(0);
						return <div>{state}</div>;
					};
				`;

			const usedIdentifiers = new Set(["useState"]);
			const result = ImportAnalyzer.removeUnusedImports(code, usedIdentifiers);

			expect(result).toContain("useState");
			expect(result).not.toContain("useEffect");
			expect(result).not.toContain("useCallback");
		});
	});
});
