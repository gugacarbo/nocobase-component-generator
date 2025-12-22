import { MockContext } from "./context";

export const MockProvider = ({ children }: { children: React.ReactNode }) => {
	return <MockContext.Provider value={{}}>{children}</MockContext.Provider>;
};
