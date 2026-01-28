import { Input } from "antd";
import { FieldInputProps } from "./types";

export function TextInput({ value, placeholder, onChange }: FieldInputProps) {
	return (
		<Input
			style={{ width: "100%" }}
			placeholder={placeholder}
			value={value ?? ""}
			onChange={e => onChange(e.target.value)}
		/>
	);
}

export function EmailInput({ value, placeholder, onChange }: FieldInputProps) {
	return (
		<Input
			type="email"
			style={{ width: "100%" }}
			placeholder={placeholder}
			value={value ?? ""}
			onChange={e => onChange(e.target.value)}
		/>
	);
}

export function TelInput({ value, placeholder, onChange }: FieldInputProps) {
	return (
		<Input
			type="tel"
			style={{ width: "100%" }}
			placeholder={placeholder}
			value={value ?? ""}
			onChange={e => onChange(e.target.value)}
		/>
	);
}

export function NumberInput({ value, placeholder, onChange }: FieldInputProps) {
	return (
		<Input
			type="number"
			style={{ width: "100%" }}
			placeholder={placeholder}
			value={value ?? ""}
			onChange={e => onChange(e.target.value)}
		/>
	);
}

export function TextAreaInput({
	value,
	placeholder,
	onChange,
}: FieldInputProps) {
	return (
		<Input.TextArea
			style={{ width: "100%" }}
			rows={4}
			placeholder={placeholder}
			value={value ?? ""}
			onChange={e => onChange(e.target.value)}
		/>
	);
}

export function DateInput({ value, placeholder, onChange }: FieldInputProps) {
	return (
		<Input
			type="date"
			style={{ width: "100%" }}
			placeholder={placeholder}
			value={value ?? ""}
			onChange={e => onChange(e.target.value)}
		/>
	);
}
