import { SetorDemanda } from "@components/CRM/@types";
import {
	OPTION_ID_KEY,
	OPTION_COLOR_KEY,
	DEFAULT_COLOR,
	OPTION_LABEL_KEY,
} from "./constants";
import { SelectOptionData } from "./types";

export function getColorById(options: SetorDemanda[], id: any): string {
	const option = options.find(
		opt => opt[OPTION_ID_KEY as keyof typeof opt] === id,
	);
	return (
		(option?.[OPTION_COLOR_KEY as keyof typeof option] as string) ||
		DEFAULT_COLOR
	);
}

export function mapOptionsToSelectData(
	options: SetorDemanda[],
): SelectOptionData[] {
	return (
		options?.map(option => {
			const id = option[OPTION_ID_KEY as keyof typeof option] as string | number;
			return {
				key: id,
				value: id,
				label:
					(option[OPTION_LABEL_KEY as keyof typeof option] as string) ||
					`Item ${id}`,
				color:
					(option[OPTION_COLOR_KEY as keyof typeof option] as string) ||
					DEFAULT_COLOR,
			};
		}) || []
	);
}

export function extractSelectedIds(currentValue: any): any[] {
	if (Array.isArray(currentValue)) {
		return currentValue.map((v: any) =>
			typeof v === "object" ? v[OPTION_ID_KEY] : v,
		);
	}
	return [];
}

export function filterOption(input: string, option: any): boolean {
	const searchValue = input.toLowerCase();
	const optionLabel = option?.label?.toString().toLowerCase() || "";
	return optionLabel.includes(searchValue);
}
