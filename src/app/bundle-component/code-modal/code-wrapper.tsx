import { Highlight, themes } from "prism-react-renderer";

function CodeWrapper({ code }: { code: string }) {
	return (
		<div className="w-full overflow-y-auto">
			<Highlight theme={themes.oneDark} code={code} language="jsx">
				{({ style, tokens, getLineProps, getTokenProps }) => (
					<pre style={style}>
						{tokens.map((line, i) => (
							<div key={i} {...getLineProps({ line })}>
								<span
									style={{
										marginRight: "16px",
									}}
								>
									{i + 1}
								</span>
								{line.map((token, key) => (
									<span key={key} {...getTokenProps({ token })} />
								))}
							</div>
						))}
					</pre>
				)}
			</Highlight>
		</div>
	);
}

export { CodeWrapper };
