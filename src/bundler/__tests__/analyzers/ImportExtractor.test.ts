import { describe, it, expect } from "vitest";
import { ImportAnalyzer } from "../../analyzers/ImportAnalyzer";

describe("ImportAnalyzer - ExtractDetailed", () => {
	describe("extractDetailed", () => {
		it("deve extrair imports nomeados", () => {
			const code = `import { useState, useEffect } from 'react';`;
			const imports = ImportAnalyzer.extractDetailed(code);

			expect(imports).toHaveLength(1);
			expect(imports[0].path).toBe("react");
			expect(imports[0].names).toContain("useState");
			expect(imports[0].names).toContain("useEffect");
			expect(imports[0].defaultName).toBeNull();
		});

		it("deve extrair import default", () => {
			const code = `import React from 'react';`;
			const imports = ImportAnalyzer.extractDetailed(code);

			expect(imports).toHaveLength(1);
			expect(imports[0].path).toBe("react");
			expect(imports[0].defaultName).toBe("React");
			expect(imports[0].names).toHaveLength(0);
		});

		it("deve extrair import misto (default + nomeado)", () => {
			const code = `import React, { useState, useEffect } from 'react';`;
			const imports = ImportAnalyzer.extractDetailed(code);

			expect(imports).toHaveLength(1);
			expect(imports[0].path).toBe("react");
			expect(imports[0].defaultName).toBe("React");
			expect(imports[0].names).toContain("useState");
			expect(imports[0].names).toContain("useEffect");
		});

		it("deve extrair import namespace", () => {
			const code = `import * as React from 'react';`;
			const imports = ImportAnalyzer.extractDetailed(code);

			expect(imports).toHaveLength(1);
			expect(imports[0].path).toBe("react");
			expect(imports[0].namespaceAlias).toBe("React");
		});

		it("deve detectar type imports", () => {
			const code = `import type { FC, ReactNode } from 'react';`;
			const imports = ImportAnalyzer.extractDetailed(code);

			expect(imports).toHaveLength(1);
			expect(imports[0].isTypeOnly).toBe(true);
			expect(imports[0].names).toContain("FC");
			expect(imports[0].names).toContain("ReactNode");
		});

		it("deve extrair múltiplos imports", () => {
			const code = `
				import { useState } from 'react';
				import { Button, Input } from 'antd';
				import { formatDate } from './utils';
			`;
			const imports = ImportAnalyzer.extractDetailed(code);

			expect(imports).toHaveLength(3);
			expect(imports.map(i => i.path)).toEqual(["react", "antd", "./utils"]);
		});
	});

	describe("extractLocal", () => {
		it("deve retornar apenas imports locais", () => {
			const code = `
				import { useState } from 'react';
				import { Button } from 'antd';
				import { formatDate } from './utils';
				import { helper } from '../helpers';
				import { config } from '@/config';
			`;
			const imports = ImportAnalyzer.extractLocal(code);

			expect(imports).toHaveLength(3);
			expect(imports.map(i => i.path)).toEqual([
				"./utils",
				"../helpers",
				"@/config",
			]);
		});
	});

	describe("extractWithNames", () => {
		it("deve retornar mapa de imports com nomes", () => {
			const code = `
				import { formatDate, capitalize } from './utils';
				import Helper from './helper';
			`;
			const importsMap = ImportAnalyzer.extractWithNames(code);

			expect(importsMap.get("./utils")).toEqual(["formatDate", "capitalize"]);
			expect(importsMap.get("./helper")).toEqual(["Helper"]);
		});
	});

	describe("groupByModule", () => {
		it("deve agrupar imports do mesmo módulo", () => {
			const imports = [
				{
					path: "react",
					names: ["useState"],
					defaultName: null,
					namespaceAlias: null,
					isTypeOnly: false,
				},
				{
					path: "react",
					names: ["useEffect"],
					defaultName: null,
					namespaceAlias: null,
					isTypeOnly: false,
				},
			];

			const grouped = ImportAnalyzer.groupByModule(imports);

			expect(grouped.size).toBe(1);
			expect(grouped.get("react")?.names).toContain("useState");
			expect(grouped.get("react")?.names).toContain("useEffect");
		});
	});
});
