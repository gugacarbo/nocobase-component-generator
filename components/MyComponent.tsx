import React, { useState } from "react";
import { formatDate } from "./utils/dateUtils";
import { Button } from "./ui/Button";
import FullDiv from "./full-div";

interface MyComponentProps {
	title?: string;
}

const MyComponent: React.FC<MyComponentProps> = ({
	title = "Exemplo de Componente",
}) => {
	const [count, setCount] = useState(0);
	const currentDate = formatDate(new Date());

	return (
		<FullDiv>
			<h3>{title}</h3>
			<p>Data atual: {currentDate}</p>
			<p>Contador: {count}</p>
			<p></p>
			<Button onClick={() => setCount(count + 1)}>Incrementar</Button>
		</FullDiv>
	);
};

export default MyComponent;
