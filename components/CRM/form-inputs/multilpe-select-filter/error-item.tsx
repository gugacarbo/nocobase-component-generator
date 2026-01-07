import { Alert, Button, Form } from "antd";

function ErrorItem({ error }: { error: string }) {
	return (
		<Form.Item>
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

export { ErrorItem };
