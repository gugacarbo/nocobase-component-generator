import { baseCtx as ctx } from "@/nocobase/ctx";
import { useForm } from "@/nocobase/utils/useForm";
import { CloseOutlined } from "@ant-design/icons";
import { Form, Select, Tag, Spin, Alert, Button } from "antd";
import { useState, useEffect, useCallback, useMemo } from "react";
import { defaultProps } from "./defaultProps";
import { getUserSelectedIds } from "./get-user-selected-ids";
import { SetorDemanda } from "@components/CRM/@types";

type OptionType = {
	key: string | number;
	value: string | number;
	label: string;
	color: string;
};

function MultipleSelectFilter() {
	const {
		fieldId,
		fieldLabel,
		optionIdKey,
		apiEndpoint,
		apiMethod,
		defaultColor,
		placeholderLoading,
		placeholderDefault,
		notFoundMessage,
		errorMessage,
		invalidDataMessage,
	} = defaultProps;

	const [options, setOptions] = useState<SetorDemanda[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const form = useForm();

	useEffect(() => {
		const fetchOptions = async () => {
			try {
				setLoading(true);
				setError(null);

				// Busca as opções do select
				const response = await ctx.api.request({
					url: apiEndpoint,
					method: apiMethod,
				});

				const data = response?.data?.data;

				if (!Array.isArray(data)) {
					throw new Error(invalidDataMessage);
				}

				setOptions(data);

				const userSelectedIds = await getUserSelectedIds();

				// Define os valores iniciais no formulário
				if (data?.length > 0 && userSelectedIds?.length > 0) {
					const validInitialIds = userSelectedIds.filter(id =>
						data.some(option => option[optionIdKey] === id),
					);
					const initialSelectedOptions = data.filter(option =>
						validInitialIds.includes(option[optionIdKey]),
					);

					form.setFieldValue(fieldId, initialSelectedOptions);
				}

				form.submit();
			} catch (err) {
				console.error("Erro ao buscar opções:", err);
				setError(errorMessage);
				setOptions([]);
			} finally {
				setLoading(false);
			}
		};

		fetchOptions();
	}, []);

	const selectOptions: OptionType[] = useMemo(
		() =>
			options?.map(option => ({
				key: option.id,
				value: option.id,
				label: option.f_setor,
				color: option.f_cor_setor || defaultColor,
			})),
		[options],
	);

	const renderTag = useCallback(
		({
			label,
			closable,
			onClose,
		}: {
			value: string;
			label: React.ReactNode;
			closable: boolean;
			onClose: () => void;
		}) => {
			return (
				<Tag
					// color={color}
					// closable={closable}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 2,
						marginRight: 3,
						marginBottom: 2,
						borderRadius: 6,
						fontWeight: 500,
					}}
				>
					{label}
					{closable ? (
						<span
							onMouseDown={e => e.stopPropagation()}
							onClick={onClose}
							style={{
								cursor: "pointer",
							}}
						>
							<CloseOutlined />
						</span>
					) : null}
				</Tag>
			);
		},
		[],
	);
	const filterOption = useCallback((input: string, option?: OptionType) => {
		if (!option) return false;
		const searchValue = input.toLowerCase();
		const optionLabel = option.label?.toLowerCase() || "";
		return optionLabel.includes(searchValue);
	}, []);

	const renderOption = useCallback((option: OptionType) => {
		const color = option.color;

		return (
			<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
				<div
					style={{
						width: 12,
						height: 12,
						borderRadius: "50%",
						backgroundColor: color,
						border: "2px solid #d9d9d9",
						boxSizing: "border-box",
					}}
				/>
				<span>{option.label}</span>
			</div>
		);
	}, []);

	if (error) {
		return (
			<Form.Item name={fieldId} label={fieldLabel}>
				<Alert
					message={error}
					type="error"
					showIcon
					action={
						<Button
							size="small"
							type="text"
							onClick={() => window.location.reload()}
						>
							Recarregar
						</Button>
					}
				/>
			</Form.Item>
		);
	}

	return (
		<Form
			form={form}
			initialValues={
				{
					// [fieldId]: userSelectedIds,
				}
			}
		>
			<Form.Item name={fieldId} label={fieldLabel}>
				<Select
					//bundle-only: {...ctx.model.props}

					allowClear
					showSearch
					value={
						Array.isArray(form.getFieldValue(fieldId))
							? form.getFieldValue(fieldId)
							: [form.getFieldValue(fieldId)]
					}
					mode="multiple"
					maxTagCount="responsive"
					optionFilterProp="label"
					filterOption={filterOption}
					onChange={ids => {
						const selectedOptions = options.filter(o =>
							ids.includes(o[optionIdKey as keyof SetorDemanda] as string),
						);
						form.setFieldValue(fieldId, selectedOptions);
					}}
					tagRender={renderTag}
					loading={loading}
					placeholder={loading ? placeholderLoading : placeholderDefault}
					style={{ width: "100%" }}
					notFoundContent={loading ? <Spin size="small" /> : notFoundMessage}
				>
					{selectOptions?.map(option => (
						<Select.Option
							key={option.key}
							value={option.value}
							label={option.label}
						>
							{renderOption(option)}
						</Select.Option>
					))}
				</Select>
			</Form.Item>
		</Form>
	);
}
export default MultipleSelectFilter;
