import { Button } from "antd";

import { useUpdateFormValue } from "@nocobase/hooks/use-update-form-value";

function ButtonExample() {
	const handleClick = () => {
		alert("Botão clicado!");
	};
	useUpdateFormValue(() => {
		console.log("a");
	});

	return (
		<div style={{ padding: "20px" }}>
			<h1>Button Example</h1>
			<Button onClick={handleClick}>Clique aqui</Button>
		</div>
	);
}

export default ButtonExample;
