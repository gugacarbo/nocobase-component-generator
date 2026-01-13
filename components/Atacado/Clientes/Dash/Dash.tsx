import { Typography } from "antd";
import { ErrorComponent } from "@components/common/error-component";
import { StatsCards } from "./StatsCards";
import { ClientesTable } from "./ClientesTable";
import { useDashData } from "./useDashData";
import { calcularPorcentagemProblemas } from "./utils";
import { baseCtx as ctx } from "@/nocobase/ctx";

function Dash() {
	const { loading, data, allClientes, error } = useDashData();

	const handleOpenCliente = (clienteId: number) => {
		ctx.router.navigate(
			`/admin/g7hoao3gont/popups/qiz5d46qen7/filterbytk/${clienteId}`,
		);
	};

	if (error) {
		return <ErrorComponent message={error} />;
	}

	const clientesOk = allClientes.length - data.length;
	const porcentagemProblemas = calcularPorcentagemProblemas(
		allClientes.length,
		data.length,
	);

	return (
		<div>
			<Typography.Title level={3}>Dashboard de Clientes</Typography.Title>
			<StatsCards
				loading={loading}
				totalClientes={allClientes.length}
				clientesOk={clientesOk}
				clientesComProblemas={data.length}
				porcentagemProblemas={porcentagemProblemas}
			/>
			<ClientesTable
				loading={loading}
				data={data}
				onOpenCliente={handleOpenCliente}
			/>
		</div>
	);
}

export default Dash;
