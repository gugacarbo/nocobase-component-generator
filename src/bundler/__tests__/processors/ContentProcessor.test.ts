import { describe, it, expect } from "vitest";
import { ContentProcessor } from "../../processors/ContentProcessor";
import { FileInfo } from "../../core/types";

describe("ContentProcessor", () => {
	describe("getOutputFileName", () => {
		it("deve converter PascalCase para kebab-case", () => {
			expect(ContentProcessor.getOutputFileName("MyComponent")).toBe(
				"my-component",
			);
			expect(ContentProcessor.getOutputFileName("UserProfileCard")).toBe(
				"user-profile-card",
			);
		});

		it("deve retornar nome padrão quando componente é null", () => {
			expect(ContentProcessor.getOutputFileName(null)).toBe(
				"bundled-component",
			);
		});
	});

	describe("cleanContent", () => {
		it("deve remover imports", () => {
			const code = `
import { useState } from 'react';
import { Button } from 'antd';

const Component = () => <div>Hello</div>;
`;
			const cleaned = ContentProcessor.cleanContent(code, "test.tsx", false);

			expect(cleaned).not.toContain("import");
			expect(cleaned).toContain("Component");
		});

		it("deve remover exports", () => {
			const code = `
export const MyComponent = () => <div>Hello</div>;
export default MyComponent;
`;
			const cleaned = ContentProcessor.cleanContent(code, "test.tsx", false);

			expect(cleaned).not.toContain("export");
			expect(cleaned).toContain("MyComponent");
		});

		it("deve remover tipos quando solicitado", () => {
			const code = `
interface Props {
	title: string;
}

const Component = ({ title }: Props) => <div>{title}</div>;
`;
			const cleaned = ContentProcessor.cleanContent(code, "test.tsx", true);

			expect(cleaned).not.toContain("interface");
			expect(cleaned).not.toContain(": Props");
		});

		it("deve normalizar linhas vazias múltiplas", () => {
			const code = `
const a = 1;



const b = 2;
`;
			const cleaned = ContentProcessor.cleanContent(code, "test.tsx", false);

			expect(cleaned).not.toContain("\n\n\n");
		});
	});

	describe("extractDefaultProps", () => {
		it("deve extrair defaultProps do código", () => {
			const code = `
const defaultProps = {
	title: 'Default Title',
	count: 0,
};

const Component = () => <div>Hello</div>;
`;
			const result = ContentProcessor.extractDefaultProps(code);

			expect(result.defaultProps).toContain("defaultProps");
			expect(result.defaultProps).toContain("title: 'Default Title'");
			expect(result.contentWithout).not.toContain("defaultProps = {");
			expect(result.contentWithout).toContain("Component");
		});

		it("deve lidar com código sem defaultProps", () => {
			const code = `const Component = () => <div>Hello</div>;`;
			const result = ContentProcessor.extractDefaultProps(code);

			expect(result.defaultProps).toBe("");
			expect(result.contentWithout).toBe(code);
		});

		it("deve remover export de defaultProps", () => {
			const code = `
export const defaultProps = {
	title: 'Default',
};
`;
			const result = ContentProcessor.extractDefaultProps(code);

			expect(result.defaultProps).not.toContain("export");
			expect(result.defaultProps).toContain("const defaultProps");
		});
	});

	describe("getFileContents", () => {
		it("deve retornar mapa de conteúdos dos arquivos ordenados", () => {
			const files = new Map<string, FileInfo>([
				[
					"file1.tsx",
					{
						path: "file1.tsx",
						content: "content1",
						imports: [],
						relativePath: "file1.tsx",
					},
				],
				[
					"file2.tsx",
					{
						path: "file2.tsx",
						content: "content2",
						imports: [],
						relativePath: "file2.tsx",
					},
				],
			]);
			const sortedFiles = ["file1.tsx", "file2.tsx"];

			const contents = ContentProcessor.getFileContents(files, sortedFiles);

			expect(contents.get("file1.tsx")).toBe("content1");
			expect(contents.get("file2.tsx")).toBe("content2");
		});
	});

	describe("concatenateFiles", () => {
		it("deve concatenar múltiplos arquivos", () => {
			const fileInfoMap = new Map<string, FileInfo>([
				[
					"file1.tsx",
					{
						path: "file1.tsx",
						content: "const A = 1;",
						imports: [],
						relativePath: "file1.tsx",
					},
				],
				[
					"file2.tsx",
					{
						path: "file2.tsx",
						content: "const B = 2;",
						imports: [],
						relativePath: "file2.tsx",
					},
				],
			]);
			const sortedFiles = ["file1.tsx", "file2.tsx"];

			const result = ContentProcessor.concatenateFiles(
				sortedFiles,
				fileInfoMap,
				false,
			);

			expect(result).toContain("const A = 1");
			expect(result).toContain("const B = 2");
		});

		it("deve ignorar arquivos de mock/test", () => {
			const fileInfoMap = new Map<string, FileInfo>([
				[
					"component.tsx",
					{
						path: "component.tsx",
						content: "const Component = () => null;",
						imports: [],
						relativePath: "component.tsx",
					},
				],
				[
					"component.mock.tsx",
					{
						path: "component.mock.tsx",
						content: "const MockComponent = () => null;",
						imports: [],
						relativePath: "component.mock.tsx",
					},
				],
			]);
			const sortedFiles = ["component.tsx", "component.mock.tsx"];

			const result = ContentProcessor.concatenateFiles(
				sortedFiles,
				fileInfoMap,
				false,
			);

			expect(result).toContain("Component");
			expect(result).not.toContain("MockComponent");
		});
	});
});
