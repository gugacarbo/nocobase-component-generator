import { useForm } from "@/nocobase/utils/useForm";
import { Form, Select } from "antd";

const fieldId = "f_status_5f72cea0b8a";
function MultilpeSelectFilter() {
	const form = useForm();

	const handleChange = () => {
		form.setFieldValue(fieldId, [
			{
				createdAt: "2025-11-28T18:27:19.078Z",
				updatedAt: "2025-12-01T19:49:10.195Z",
				f_order: 1,
				f_status: "Respondido",
				id: 4,
				f_status_cor: "#673ab7",
				updatedById: 70,
				createdById: 70,
			},
			{
				createdAt: "2025-11-28T18:27:19.078Z",
				updatedAt: "2025-12-01T19:49:10.195Z",
				f_order: 2,
				f_status: "Concluído",
				id: 5,
				f_status_cor: "#673ab7",
				updatedById: 70,
				createdById: 70,
			},
		]);
	};
	return (
		<Form form={form} layout="vertical">
			<Form.Item
				name={fieldId}
				// initialValue={formData[field?.name]}
				label={<span style={{ fontWeight: "bold" }}>Select</span>}
			>
				<Select
					mode="multiple"
					allowClear
					showSearch
					maxTagCount="responsive"
					style={{ width: "100%" }}
					// optionFilterProp="label"
					// filterOption={filterOption}
					// value={selectedValueIds}
					onChange={handleChange}
					// tagRender={renderTag}
					// loading={loading}
					// placeholder={loading ? placeholderLoading : placeholderDefault}
					// notFoundContent={loading ? <Spin size="small" /> : notFoundMessage}
				>
					<Select.Option value="1">asd</Select.Option>
					<Select.Option value="2">aaasd</Select.Option>
				</Select>
			</Form.Item>
		</Form>
	);
}

export default MultilpeSelectFilter;
