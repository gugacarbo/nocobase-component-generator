import { describe, it, expect } from "vitest";
import { ModuleResolver } from "../../resolvers/ModuleResolver";

describe("ModuleResolver", () => {
	describe("isExternal", () => {
		it("deve retornar true para módulos npm", () => {
			expect(ModuleResolver.isExternal("react")).toBe(true);
			expect(ModuleResolver.isExternal("antd")).toBe(true);
			expect(ModuleResolver.isExternal("@ant-design/icons")).toBe(true);
			expect(ModuleResolver.isExternal("lodash")).toBe(true);
		});

		it("deve retornar false para caminhos relativos", () => {
			expect(ModuleResolver.isExternal("./utils")).toBe(false);
			expect(ModuleResolver.isExternal("../components")).toBe(false);
			expect(ModuleResolver.isExternal("/absolute/path")).toBe(false);
		});

		it("deve retornar false para aliases", () => {
			expect(ModuleResolver.isExternal("@/utils")).toBe(false);
			expect(ModuleResolver.isExternal("@components/Button")).toBe(false);
		});
	});

	describe("isLocal", () => {
		it("deve retornar true para caminhos relativos", () => {
			expect(ModuleResolver.isLocal("./utils")).toBe(true);
			expect(ModuleResolver.isLocal("../helpers")).toBe(true);
		});

		it("deve retornar true para aliases", () => {
			expect(ModuleResolver.isLocal("@/utils")).toBe(true);
			expect(ModuleResolver.isLocal("@components/Button")).toBe(true);
		});

		it("deve retornar false para módulos npm", () => {
			expect(ModuleResolver.isLocal("react")).toBe(false);
			expect(ModuleResolver.isLocal("antd")).toBe(false);
		});
	});
});
