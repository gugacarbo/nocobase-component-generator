import { Input, Select, Checkbox, DatePicker } from "antd";
import { CamposTipo } from "./types";

export function renderField({
	field,
	formData,
	handleChange,
}: {
	field: CamposTipo;
	formData: Record<string, any>;
	handleChange: (fieldName: string, value: any) => void;
}) {
	const { name, label, type, placeholder, options } = field;
	const fieldValue = formData[name] ?? "";

	const commonProps = {
		placeholder: placeholder || `Digite ${label?.toLowerCase()}`,
		value: fieldValue,
		style: { width: "100%" },
	};

	switch (type) {
		case "text":
		case "email":
		case "tel":
			return (
				<Input
					{...commonProps}
					type={type}
					onChange={e => handleChange(name, e.target.value)}
				/>
			);

		case "number":
			return (
				<Input
					{...commonProps}
					type="number"
					onChange={e => handleChange(name, e.target.value)}
				/>
			);

		case "textarea":
			return (
				<Input.TextArea
					{...commonProps}
					rows={4}
					onChange={e => handleChange(name, e.target.value)}
				/>
			);

		case "select":
			return (
				<Select
					{...commonProps}
					onChange={val => handleChange(name, val)}
					options={options?.map(opt => ({ label: opt, value: opt })) || []}
				/>
			);

		case "date":
			return (
				<DatePicker
					style={{ width: "100%" }}
					placeholder={placeholder}
					value={fieldValue ? fieldValue : null}
					onChange={(_, dateString) => handleChange(name, dateString)}
				/>
			);

		case "checkbox":
			return (
				<Checkbox
					checked={fieldValue === true}
					onChange={e => handleChange(name, e.target.checked)}
				>
					{placeholder || label}
				</Checkbox>
			);

		default:
			return (
				<Input
					{...commonProps}
					onChange={e => handleChange(name, e.target.value)}
				/>
			);
	}
}
