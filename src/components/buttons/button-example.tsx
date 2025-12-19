function ButtonExample() {
	const handleClick = () => {
		alert("Botão clicado!");
	};

	return (
		<div style={{ padding: "20px" }}>
			<h1>Button Example</h1>
			<button
				onClick={handleClick}
				style={{
					padding: "10px 20px",
					backgroundColor: "#0066cc",
					color: "white",
					border: "none",
					borderRadius: "6px",
					cursor: "pointer",
				}}
			>
				Clique aqui
			</button>
		</div>
	);
}

export default ButtonExample;
