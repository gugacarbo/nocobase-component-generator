import { Tag, Space, Button, Tooltip, TableColumnsType } from "antd";
import { WarningOutlined, EyeOutlined } from "@ant-design/icons";
import { ClienteComProblemas } from "./types";
import { groupRules } from "./utils";

export function createColumns(
	handleOpenCliente: (id: number) => void,
): TableColumnsType<ClienteComProblemas> {
	return [
		{
			title: "",
			key: "actions",
			width: 100,
			render: (_: any, record: ClienteComProblemas) => (
				<Button
					type="primary"
					icon={<EyeOutlined />}
					onClick={() => handleOpenCliente(record.id)}
				>
					Abrir
				</Button>
			),
		},
		{
			title: "ID",
			dataIndex: "id",
			key: "id",
			width: 80,
			onFilter: (value, record) => record.id === Number(value),
			sorter: (a: ClienteComProblemas, b: ClienteComProblemas) => a.id - b.id,
		},

		{
			title: "Nome/Razão Social",
			dataIndex: "f_nome_razao",
			key: "f_nome_razao",
			render: (text: string) => text || <Tag color="red">Não informado</Tag>,
			sorter: (a: ClienteComProblemas, b: ClienteComProblemas) =>
				a.f_nome_razao.localeCompare(b.f_nome_razao),
			filterSearch: (input, record) =>
				String(record.value).toLowerCase().includes(input.toLowerCase()),
		},
		{
			title: "CPF/CNPJ",
			dataIndex: "f_cpf_cnpj",
			key: "f_cpf_cnpj",
			render: (text: string) =>
				text && text !== "nan" ? text : <Tag color="red">Não informado</Tag>,
			filterSearch: true,
			sorter: (a: ClienteComProblemas, b: ClienteComProblemas) =>
				(a.f_cpf_cnpj || "").localeCompare(b.f_cpf_cnpj || ""),
		},
		{
			title: "Problemas",
			dataIndex: "problemas",
			key: "problemas",
			render: (problemas: ClienteComProblemas["problemas"]) => (
				<Space>
					{problemas.map(problema => (
						<Tooltip
							title={problema[1].join(", ") || "Campo não informado"}
							key={problema[0]}
						>
							<Tag color="orange" icon={<WarningOutlined />}>
								{problema[0]}
							</Tag>
						</Tooltip>
					))}
				</Space>
			),
			filters: groupRules.map(rule => ({
				text: rule.label,
				value: rule.label,
			})),
			onFilter: (value, record) =>
				record.problemas.some(problema => problema[0] === value),
			sorter: (a: ClienteComProblemas, b: ClienteComProblemas) => {
				const getSortPriority = (cliente: ClienteComProblemas) => {
					const firstProblema = cliente.problemas[0];
					if (!firstProblema) return Number.MAX_SAFE_INTEGER;
					const groupRule = groupRules.find(
						rule => rule.label === firstProblema[0],
					);
					return groupRule?.sortPriority ?? Number.MAX_SAFE_INTEGER;
				};
				return getSortPriority(a) - getSortPriority(b);
			},
			filterMode: "tree",
		},
	];
}
