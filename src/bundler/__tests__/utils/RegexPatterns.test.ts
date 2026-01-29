import { describe, it, expect } from "vitest";
import { RegexPatterns } from "../../utils/RegexPatterns";

describe("RegexPatterns", () => {
	describe("IMPORT_STATEMENT", () => {
		it("deve capturar import nomeado simples", () => {
			const code = `import { Button } from 'antd';`;
			const match = code.match(RegexPatterns.IMPORT_STATEMENT);

			expect(match).toBeTruthy();
			expect(match?.[0]).toContain("import { Button } from 'antd'");
		});

		it("deve capturar import nomeado múltiplo", () => {
			const code = `import { useState, useEffect, useCallback } from 'react';`;
			const match = code.match(RegexPatterns.IMPORT_STATEMENT);

			expect(match).toBeTruthy();
		});

		it("deve capturar import default", () => {
			const code = `import React from 'react';`;
			const match = code.match(RegexPatterns.IMPORT_STATEMENT);

			expect(match).toBeTruthy();
		});

		it("deve capturar import com alias", () => {
			const code = `import { Button as AntButton } from 'antd';`;
			const match = code.match(RegexPatterns.IMPORT_STATEMENT);

			expect(match).toBeTruthy();
		});

		it("deve capturar import de namespace", () => {
			const code = `import * as React from 'react';`;
			const match = code.match(RegexPatterns.IMPORT_STATEMENT);

			expect(match).toBeTruthy();
		});

		it("deve capturar import local relativo", () => {
			const code = `import { helper } from './utils';`;
			const match = code.match(RegexPatterns.IMPORT_STATEMENT);

			expect(match).toBeTruthy();
		});
	});

	describe("EXPORT_DEFAULT", () => {
		it("deve capturar export default", () => {
			const code = `export default Component;`;
			const match = code.match(RegexPatterns.EXPORT_DEFAULT);

			expect(match).toBeTruthy();
		});

		it("deve capturar export default com espaços", () => {
			const code = `  export default MyComponent;  `;
			const match = code.match(RegexPatterns.EXPORT_DEFAULT);

			expect(match).toBeTruthy();
		});
	});

	describe("EXPORT_NAMED", () => {
		it("deve detectar export const", () => {
			const code = `export const helper = () => {};`;
			const match = code.match(RegexPatterns.EXPORT_NAMED);

			expect(match).toBeTruthy();
		});

		it("deve detectar export function", () => {
			const code = `export function myFunc() {}`;
			const match = code.match(RegexPatterns.EXPORT_NAMED);

			expect(match).toBeTruthy();
		});

		it("deve detectar export class", () => {
			const code = `export class MyClass {}`;
			const match = code.match(RegexPatterns.EXPORT_NAMED);

			expect(match).toBeTruthy();
		});

		it("deve detectar export async", () => {
			const code = `export async function fetchData() {}`;
			const match = code.match(RegexPatterns.EXPORT_NAMED);

			expect(match).toBeTruthy();
		});
	});

	describe("EXPORT_INLINE", () => {
		it("deve detectar export default inline", () => {
			const code = `export default function Component() {}`;
			const match = code.match(RegexPatterns.EXPORT_INLINE);

			expect(match).toBeTruthy();
		});
	});

	describe("EXPORT_ASYNC", () => {
		it("deve detectar export async", () => {
			const code = `export async function getData() {}`;
			const match = code.match(RegexPatterns.EXPORT_ASYNC);

			expect(match).toBeTruthy();
		});
	});

	describe("EXPORT_BLOCK", () => {
		it("deve capturar export block simples", () => {
			const code = `export { Button };`;
			const match = code.match(RegexPatterns.EXPORT_BLOCK);

			expect(match).toBeTruthy();
		});

		it("deve capturar export block com múltiplos exports", () => {
			const code = `export { Button, Input, Select };`;
			const match = code.match(RegexPatterns.EXPORT_BLOCK);

			expect(match).toBeTruthy();
		});
	});

	describe("INLINE_COMMENT", () => {
		it("deve detectar comentário inline", () => {
			const code = `const x = 1; // comentário`;
			const match = code.match(RegexPatterns.INLINE_COMMENT);

			expect(match).toBeTruthy();
		});

		it("não deve capturar URLs", () => {
			const code = `const url = 'https://example.com';`;
			const match = code.match(RegexPatterns.INLINE_COMMENT);

			expect(match).toBeFalsy();
		});
	});

	describe("MULTIPLE_EMPTY_LINES", () => {
		it("deve detectar múltiplas linhas vazias", () => {
			const code = `line1\n\n\nline2`;
			const match = code.match(RegexPatterns.MULTIPLE_EMPTY_LINES);

			expect(match).toBeTruthy();
		});

		it("não deve detectar linhas únicas vazias", () => {
			const code = `line1\n\nline2`;
			const match = code.match(RegexPatterns.MULTIPLE_EMPTY_LINES);

			expect(match).toBeFalsy();
		});
	});
});
