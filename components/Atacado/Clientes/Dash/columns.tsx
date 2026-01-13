import { Tag, Space, Button } from "antd";
import { WarningOutlined, EyeOutlined } from "@ant-design/icons";
import { ClienteComProblemas } from "./types";

export function createColumns(handleOpenCliente: (id: number) => void) {
	return [
		{
			title: "Ações",
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
		},

		{
			title: "Nome/Razão Social",
			dataIndex: "f_nome_razao",
			key: "f_nome_razao",
			render: (text: string) => text || <Tag color="red">Não informado</Tag>,
		},
		{
			title: "CPF/CNPJ",
			dataIndex: "f_cpf_cnpj",
			key: "f_cpf_cnpj",
			render: (text: string) =>
				text && text !== "nan" ? text : <Tag color="red">Não informado</Tag>,
		},
		{
			title: "Problemas",
			dataIndex: "problemas",
			key: "problemas",
			render: (problemas: string[]) => (
				<Space>
					{problemas.map(problema => (
						<Tag key={problema} color="orange" icon={<WarningOutlined />}>
							{problema}
						</Tag>
					))}
				</Space>
			),
		},
	];
}
