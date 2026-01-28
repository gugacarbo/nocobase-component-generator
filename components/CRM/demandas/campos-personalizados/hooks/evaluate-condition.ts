import { FieldCondition, ShowWhenCondition } from "../types";

export function evaluateCondition(
	condition: FieldCondition,
	formData: Record<string, any>,
): boolean {
	const fieldValue = formData[condition.field];
	const { operator, value } = condition;

	switch (operator) {
		case "equals":
			return fieldValue === value;

		case "notEquals":
			return fieldValue !== value;

		case "contains":
			if (Array.isArray(fieldValue)) {
				return fieldValue.includes(value);
			}
			if (typeof fieldValue === "string") {
				return fieldValue.includes(String(value));
			}
			return false;

		case "notContains":
			if (Array.isArray(fieldValue)) {
				return !fieldValue.includes(value);
			}
			if (typeof fieldValue === "string") {
				return !fieldValue.includes(String(value));
			}
			return true;

		case "isEmpty":
			return (
				fieldValue === null ||
				fieldValue === undefined ||
				fieldValue === "" ||
				(Array.isArray(fieldValue) && fieldValue.length === 0)
			);

		case "isNotEmpty":
			return !(
				fieldValue === null ||
				fieldValue === undefined ||
				fieldValue === "" ||
				(Array.isArray(fieldValue) && fieldValue.length === 0)
			);

		case "greaterThan":
			return Number(fieldValue) > Number(value);

		case "lessThan":
			return Number(fieldValue) < Number(value);

		default:
			return true;
	}
}

export function evaluateShowWhen(
	showWhen: ShowWhenCondition | undefined,
	formData: Record<string, any>,
): boolean {
	if (!showWhen || !showWhen.conditions || showWhen.conditions.length === 0) {
		return true;
	}

	const results = showWhen.conditions.map(condition =>
		evaluateCondition(condition, formData),
	);

	if (showWhen.logic === "or") {
		return results.some(Boolean);
	}

	return results.every(Boolean);
}
