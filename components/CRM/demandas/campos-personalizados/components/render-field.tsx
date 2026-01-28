import { CamposTipo } from "@components/CRM/@types";

import {
	TextInput,
	EmailInput,
	TelInput,
	NumberInput,
	TextAreaInput,
	DateInput,
} from "./field-inputs/text-inputs";

import {
	SelectInput,
	RadioInput,
	CheckboxGroupInput,
	SwitchInput,
} from "./field-inputs/select-inputs";

interface RenderFieldProps {
	field: CamposTipo;
	formData: Record<string, any>;
	handleChange: (fieldName: string, value: any) => void;
}

export function renderField({
	field,
	formData,
	handleChange,
}: RenderFieldProps) {
	const { name, label, type, placeholder, options } = field;
	const value = formData[name] ?? "";
	const defaultPlaceholder = placeholder || `Digite ${label?.toLowerCase()}`;
	const onChange = (val: any) => handleChange(name, val);

	switch (type) {
		case "email":
			return (
				<EmailInput
					value={value}
					placeholder={defaultPlaceholder}
					onChange={onChange}
				/>
			);

		case "text":
			return (
				<TextInput
					value={value}
					placeholder={defaultPlaceholder}
					onChange={onChange}
				/>
			);

		case "tel":
			return (
				<TelInput
					value={value}
					placeholder={defaultPlaceholder}
					onChange={onChange}
				/>
			);

		case "number":
			return (
				<NumberInput
					value={value}
					placeholder={defaultPlaceholder}
					onChange={onChange}
				/>
			);

		case "textarea":
			return (
				<TextAreaInput
					value={value}
					placeholder={defaultPlaceholder}
					onChange={onChange}
				/>
			);

		case "select":
			return (
				<SelectInput
					value={value}
					placeholder={defaultPlaceholder}
					onChange={onChange}
					options={options}
				/>
			);

		case "date":
			return (
				<DateInput
					value={value}
					placeholder={defaultPlaceholder}
					onChange={onChange}
				/>
			);

		case "checkbox":
			return <SwitchInput value={value} onChange={onChange} />;

		case "radio":
			return <RadioInput value={value} onChange={onChange} options={options} />;

		case "checkbox-group":
			return (
				<CheckboxGroupInput
					value={value}
					onChange={onChange}
					options={options}
				/>
			);

		default:
			return (
				<TextInput
					value={value}
					placeholder={defaultPlaceholder}
					onChange={onChange}
				/>
			);
	}
}
