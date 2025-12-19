import React, { useState } from "react";
import { formatDate } from "../utils/dateUtils";
import { Button } from "./ui/Button";

interface MyComponentProps {
	title?: string;
}

const MyComponent2: React.FC<MyComponentProps> = ({
	title = "Exemplo de Componente",
}) => {
	const [count, setCount] = useState(0);
	const currentDate = formatDate(new Date());

	return (
		<div className="">
			<h3>{title}</h3>
			<p>Data atual: {currentDate}</p>
			<p>Contador: {count}</p>
			<p></p>
			<Button onClick={() => setCount(count + 1)}>Incrementar</Button>
		</div>
	);
};

export default MyComponent2;
