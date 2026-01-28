export interface Field {
	name: string;
	label: string;
	type: string;
	required: boolean;
	placeholder: string;
	options?: string[];
	showWhen?: ShowWhenCondition;
}

export interface FieldType {
	label: string;
	value: string;
	icon?: React.ReactNode;
}

export type ConditionOperator =
	| "equals"
	| "notEquals"
	| "contains"
	| "notContains"
	| "isEmpty"
	| "isNotEmpty"
	| "greaterThan"
	| "lessThan";

export interface FieldCondition {
	field: string;
	operator: ConditionOperator;
	value?: any;
}

export interface ShowWhenCondition {
	conditions: FieldCondition[];
	logic: "and" | "or";
}
