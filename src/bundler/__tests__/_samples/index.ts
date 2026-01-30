export const sampleReactComponent = `
import { useState, useEffect } from 'react';
import { Button } from 'antd';
import { formatDate } from './utils';

interface Props {
	title: string;
	onClick?: () => void;
}

export const MyComponent = ({ title, onClick }: Props) => {
	const [count, setCount] = useState(0);

	useEffect(() => {
		console.log('mounted');
	}, []);

	return (
		<div>
			<h1>{title}</h1>
			<Button onClick={onClick}>Click me ({count})</Button>
		</div>
	);
};

export default MyComponent;
`;

export const sampleUtilsFile = `
export const formatDate = (date: Date): string => {
	return date.toISOString();
};

export const capitalize = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};
`;

export const sampleBarrelFile = `
export { MyComponent } from './MyComponent';
export { formatDate, capitalize } from './utils';
export * from './helpers';
`;

export const sampleTypesFile = `
export interface User {
	id: number;
	name: string;
	email: string;
}

export type UserRole = 'admin' | 'user' | 'guest';
`;
