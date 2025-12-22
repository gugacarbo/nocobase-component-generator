import { Button } from "@components/ui/Button";

function ButtonExample() {
	const handleClick = () => {
		alert("Botão clicado!");
	};

	return (
		<div style={{ padding: "20px" }}>
			<h1>Button Example</h1>
			<Button onClick={handleClick}>Clique aqui</Button>
		</div>
	);
}

export default ButtonExample;
