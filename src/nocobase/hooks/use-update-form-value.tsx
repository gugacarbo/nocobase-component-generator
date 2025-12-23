import { useEffect } from "react";

function useUpdateFormValue(handler: EventListener) {
	useEffect(() => {
		if (!handler) return;
		//bundle-only: ctx?.element?.addEventListener?.("js-field:value-change", handler);
		//bundle-only: return () =>ctx?.element?.removeEventListener?.("js-field:value-change", handler);
	}, []);
}

export { useUpdateFormValue };
