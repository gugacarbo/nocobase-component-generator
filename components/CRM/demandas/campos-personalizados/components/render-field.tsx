import { CamposTipo } from "@components/CRM/@types";
import { Input, Select, Checkbox, DatePicker, Radio, Switch } from "antd";

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
		case "email":
			return (
				<Input
					type="email"
					{...commonProps}
					onChange={e => handleChange(name, e.target.value)}
				/>
			);
		case "text":
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
					format="DD/MM/YYYY"
					onChange={(_, dateString) => handleChange(name, dateString)}
				/>
			);

		case "checkbox":
			return (
				<Switch
					checked={fieldValue === true}
					onChange={checked => handleChange(name, checked)}
				/>
			);

		case "radio":
			return (
				<Radio.Group
					onChange={e => handleChange(name, e.target.value)}
					value={fieldValue}
					options={options?.map(opt => ({ label: opt, value: opt })) || []}
				/>
			);

		case "checkbox-group":
			return (
				<Checkbox.Group
					style={{ width: "100%" }}
					onChange={checkedValues => handleChange(name, checkedValues)}
					value={Array.isArray(fieldValue) ? fieldValue : []}
					options={options?.map(opt => ({ label: opt, value: opt })) || []}
				/>
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
