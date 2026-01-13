import { Card, Table, Space, Spin } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { ClienteComProblemas } from "./types";
import { createColumns } from "./columns";

interface ClientesTableProps {
	loading: boolean;
	data: ClienteComProblemas[];
	onOpenCliente: (id: number) => void;
}

export function ClientesTable({
	loading,
	data,
	onOpenCliente,
}: ClientesTableProps) {
	const columns = createColumns(onOpenCliente);

	return (
		<Card
			title={
				<Space>
					<WarningOutlined style={{ color: "#faad14" }} />
					<span>Clientes com Dados Incompletos</span>
				</Space>
			}
		>
			{loading ? (
				<div style={{ textAlign: "center", padding: "50px" }}>
					<Spin size="large" />
				</div>
			) : (
				<Table
					columns={columns}
					dataSource={data}
					rowKey="id"
					pagination={{
						pageSize: 10,
						showSizeChanger: true,
						showTotal: total => `Total: ${total} clientes`,
					}}
					locale={{
						emptyText: "Nenhum cliente com dados incompletos",
					}}
				/>
			)}
		</Card>
	);
}
