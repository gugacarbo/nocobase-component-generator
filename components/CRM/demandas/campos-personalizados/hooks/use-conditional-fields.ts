import { useMemo, useCallback } from "react";
import { CamposTipo } from "@components/CRM/@types";
import { evaluateShowWhen } from "./evaluate-condition";

export function useConditionalFields(
	fields: CamposTipo[],
	formData: Record<string, any>,
) {
	const isFieldVisible = useCallback(
		(field: CamposTipo): boolean => {
			return evaluateShowWhen(field.showWhen, formData);
		},
		[formData],
	);

	const visibleFields = useMemo(() => {
		return fields.filter(field => isFieldVisible(field));
	}, [fields, isFieldVisible]);

	const getVisibleFieldNames = useMemo(() => {
		return new Set(visibleFields.map(f => f.name));
	}, [visibleFields]);

	return {
		visibleFields,
		isFieldVisible,
		getVisibleFieldNames,
	};
}
