import { useForm } from "@/nocobase/utils/useForm";
import { Select, Spin } from "antd";
import { useCallback, useMemo } from "react";
import { Error } from "./error";
import { DEFAULT_PROPS, OPTION_ID_KEY } from "./constants";
import { useMultipleSelectData } from "./hooks/use-multiple-select-data";
import { MultipleSelectProps } from "./types";
import {
	extractSelectedIds,
	filterOption,
	getColorById,
	mapOptionsToSelectData,
} from "./utils";
import { SelectTag } from "./components/SelectTag";
import { SelectOptionItem } from "./components/SelectOptionItem";

function MultipleSelect({
	fieldId = DEFAULT_PROPS.fieldId,
	fieldLabel = DEFAULT_PROPS.fieldLabel,
	placeholderDefault = DEFAULT_PROPS.placeholderDefault,
	placeholderLoading = DEFAULT_PROPS.placeholderLoading,
	notFoundMessage = DEFAULT_PROPS.notFoundMessage,
}: MultipleSelectProps) {
	const form = useForm();

	const { options, loading, error } = useMultipleSelectData(fieldId, form);

	const currentValue = form?.getFieldValue(fieldId);

	const selectedValueIds = useMemo(
		() => extractSelectedIds(currentValue),
		[currentValue],
	);

	const selectOptions = useMemo(
		() => mapOptionsToSelectData(options),
		[options],
	);

	const getColor = useCallback(
		(id: any) => getColorById(options, id),
		[options],
	);

	const renderTag = useCallback(
		(props: {
			value: any;
			label: React.ReactNode;
			closable: boolean;
			onClose: (event?: any) => void;
		}) => <SelectTag {...props} getColorById={getColor} />,
		[getColor],
	);

	const renderOption = useCallback(
		(option: { value: any; label: any }) => (
			<SelectOptionItem label={option.label} color={getColor(option.value)} />
		),
		[getColor],
	);

	const handleChange = useCallback(
		(ids: any[]) => {
			if (!form) return;
			const selectedOptionsObjects = options.filter(o =>
				ids.includes(o[OPTION_ID_KEY as keyof typeof o]),
			);
			form.setFieldValue(fieldId, selectedOptionsObjects);
		},
		[options, form, fieldId],
	);

	if (error) return <Error error={error} />;

	if (!form) {
		return <Error error="Formulário não disponível" />;
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
			{fieldLabel && (
				<div style={{ fontSize: 14, color: "rgba(0, 0, 0, 0.85)" }}>
					{fieldLabel}
				</div>
			)}

			<Select
				mode="multiple"
				allowClear
				showSearch
				maxTagCount="responsive"
				optionFilterProp="label"
				filterOption={filterOption}
				value={selectedValueIds}
				onChange={handleChange}
				tagRender={renderTag}
				loading={loading}
				placeholder={loading ? placeholderLoading : placeholderDefault}
				style={{ width: "100%" }}
				notFoundContent={loading ? <Spin size="small" /> : notFoundMessage}
			>
				{selectOptions?.map(option => (
					<Select.Option
						key={String(option.key)}
						value={option.value}
						label={option.label}
					>
						{renderOption(option)}
					</Select.Option>
				))}
			</Select>
		</div>
	);
}

export default MultipleSelect;
