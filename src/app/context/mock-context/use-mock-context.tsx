import { useContext } from "react";
import { MockContext } from "./context";

export function useMockContext() {
	return useContext(MockContext);
}
