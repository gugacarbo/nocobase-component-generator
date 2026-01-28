import { ConditionOperator } from "../types";

export const CONDITION_OPERATORS: {
	value: ConditionOperator;
	label: string;
	needsValue: boolean;
}[] = [
	{ value: "equals", label: "É igual a", needsValue: true },
	{ value: "notEquals", label: "É diferente de", needsValue: true },
	{ value: "contains", label: "Contém", needsValue: true },
	{ value: "notContains", label: "Não contém", needsValue: true },
	{ value: "isEmpty", label: "Está vazio", needsValue: false },
	{ value: "isNotEmpty", label: "Não está vazio", needsValue: false },
	{ value: "greaterThan", label: "Maior que", needsValue: true },
	{ value: "lessThan", label: "Menor que", needsValue: true },
];
