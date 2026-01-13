import { Row, Col, Card, Statistic } from "antd";
import {
	UserOutlined,
	ExclamationCircleOutlined,
	CheckCircleOutlined,
} from "@ant-design/icons";

interface StatsCardsProps {
	loading: boolean;
	totalClientes: number;
	clientesOk: number;
	clientesComProblemas: number;
	porcentagemProblemas: string;
}

export function StatsCards({
	loading,
	totalClientes,
	clientesOk,
	clientesComProblemas,
	porcentagemProblemas,
}: StatsCardsProps) {
	return (
		<Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
			<Col xs={24} sm={12} lg={8}>
				<Card loading={loading}>
					<Statistic
						title="Total de Clientes"
						value={totalClientes}
						prefix={<UserOutlined />}
					/>
				</Card>
			</Col>

			<Col xs={24} sm={12} lg={8}>
				<Card loading={loading}>
					<Statistic
						title="Clientes OK"
						value={clientesOk}
						prefix={<CheckCircleOutlined />}
						valueStyle={{ color: "#52c41a" }}
					/>
				</Card>
			</Col>

			<Col xs={24} sm={12} lg={8}>
				<Card loading={loading}>
					<Statistic
						title="Com Dados Incompletos"
						value={clientesComProblemas}
						suffix={`(${porcentagemProblemas}%)`}
						prefix={<ExclamationCircleOutlined />}
						valueStyle={{ color: "#faad14" }}
					/>
				</Card>
			</Col>
		</Row>
	);
}
