export function FullDiv({ children }: { children: React.ReactNode }) {
	//bundle-only: const element = ctx?.element.parentElement.getElementsByTagName("span")?.[0]
	//bundle-only: if (element) {element.style.width = "100%";}
	return children;
}

export default FullDiv;
