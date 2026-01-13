function ErrorComponent({
	message,
	children,
}: {
	message: string;
	children?: React.ReactNode;
}) {
	return (
		<div>
			<h2>Um erro aconteceu.</h2>
			<p>{message}</p>
			{!!children && <div>{children}</div>}
		</div>
	);
}

export { ErrorComponent };
