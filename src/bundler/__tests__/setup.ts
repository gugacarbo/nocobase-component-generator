import { vi } from "vitest";
import * as fs from "fs";
import * as path from "path";

export const TEST_FIXTURES_DIR = path.join(__dirname, "fixtures");

export function createMockFileSystem(files: Record<string, string>) {
	const mockFs = new Map(Object.entries(files));

	vi.spyOn(fs, "existsSync").mockImplementation((filePath: fs.PathLike) => {
		const normalizedPath = String(filePath).replace(/\\/g, "/");
		return (
			mockFs.has(normalizedPath) ||
			Array.from(mockFs.keys()).some(k => k.startsWith(normalizedPath + "/"))
		);
	});

	vi.spyOn(fs, "readFileSync").mockImplementation(
		(filePath: fs.PathOrFileDescriptor) => {
			const normalizedPath = String(filePath).replace(/\\/g, "/");
			const content = mockFs.get(normalizedPath);
			if (content === undefined) {
				throw new Error(
					`ENOENT: no such file or directory, open '${filePath}'`,
				);
			}
			return content;
		},
	);

	vi.spyOn(fs, "statSync").mockImplementation((filePath: fs.PathLike) => {
		const normalizedPath = String(filePath).replace(/\\/g, "/");
		const isFile = mockFs.has(normalizedPath);
		const isDir =
			!isFile &&
			Array.from(mockFs.keys()).some(k => k.startsWith(normalizedPath + "/"));

		if (!isFile && !isDir) {
			throw new Error(`ENOENT: no such file or directory, stat '${filePath}'`);
		}

		return {
			isFile: () => isFile,
			isDirectory: () => isDir,
		} as fs.Stats;
	});

	vi.spyOn(fs, "readdirSync").mockImplementation(((dirPath: fs.PathLike) => {
		const normalizedPath = String(dirPath).replace(/\\/g, "/");
		const entries = new Set<string>();

		for (const key of mockFs.keys()) {
			if (key.startsWith(normalizedPath + "/")) {
				const relativePath = key.slice(normalizedPath.length + 1);
				const firstSegment = relativePath.split("/")[0];
				entries.add(firstSegment);
			}
		}

		return Array.from(entries) as unknown as fs.Dirent[];
	}) as any);

	return mockFs;
}

export function resetMocks() {
	vi.restoreAllMocks();
}
