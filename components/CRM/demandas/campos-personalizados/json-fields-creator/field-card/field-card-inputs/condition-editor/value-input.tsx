import { Input, Select } from "antd";
import { Field } from "../../../../types";

interface ValueInputProps {
	targetField: Field | undefined;
	value: any;
	onChange: (value: any) => void;
}

export function ValueInput({ targetField, value, onChange }: ValueInputProps) {
	if (!targetField) {
		return (
			<Input
				style={{ width: "100%" }}
				placeholder="Valor"
				value={value ?? ""}
				onChange={e => onChange(e.target.value)}
			/>
		);
	}

	if (targetField.type === "checkbox") {
		return (
			<Select
				style={{ width: "100%" }}
				value={value}
				onChange={onChange}
				options={[
					{ label: "Sim", value: true },
					{ label: "Não", value: false },
				]}
				placeholder="Selecione"
			/>
		);
	}

	if (
		(targetField.type === "select" ||
			targetField.type === "radio" ||
			targetField.type === "checkbox-group") &&
		targetField.options
	) {
		return (
			<Select
				style={{ width: "100%" }}
				value={value}
				onChange={onChange}
				options={targetField.options.map(opt => ({ label: opt, value: opt }))}
				placeholder="Selecione"
			/>
		);
	}

	if (targetField.type === "number") {
		return (
			<Input
				type="number"
				style={{ width: "100%" }}
				placeholder="Valor"
				value={value ?? ""}
				onChange={e => onChange(Number(e.target.value))}
			/>
		);
	}

	return (
		<Input
			style={{ width: "100%" }}
			placeholder="Valor"
			value={value ?? ""}
			onChange={e => onChange(e.target.value)}
		/>
	);
}
