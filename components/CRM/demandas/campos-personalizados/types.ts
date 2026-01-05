export interface Field {
	name: string;
	label: string;
	type: string;
	required: boolean;
	placeholder: string;
	options?: string[];
}

export interface FieldType {
	label: string;
	value: string;
	icon?: React.ReactNode;
}
