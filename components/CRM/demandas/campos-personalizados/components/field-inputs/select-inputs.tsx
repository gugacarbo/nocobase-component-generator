import { Select, Radio, Checkbox, Switch } from "antd";
import { FieldInputProps } from "./types";

export function SelectInput({
	value,
	placeholder,
	onChange,
	options = [],
}: FieldInputProps) {
	return (
		<Select
			style={{ width: "100%" }}
			placeholder={placeholder}
			value={value}
			onChange={onChange}
			options={options.map(opt => ({ label: opt, value: opt }))}
		/>
	);
}

export function RadioInput({ value, onChange, options = [] }: FieldInputProps) {
	return (
		<Radio.Group
			value={value}
			onChange={e => onChange(e.target.value)}
			options={options.map(opt => ({ label: opt, value: opt }))}
		/>
	);
}

export function CheckboxGroupInput({
	value,
	onChange,
	options = [],
}: FieldInputProps) {
	return (
		<Checkbox.Group
			style={{ width: "100%" }}
			value={Array.isArray(value) ? value : []}
			onChange={checkedValues => onChange(checkedValues)}
			options={options.map(opt => ({ label: opt, value: opt }))}
		/>
	);
}

export function SwitchInput({ value, onChange }: FieldInputProps) {
	return <Switch checked={value === true} onChange={onChange} />;
}
