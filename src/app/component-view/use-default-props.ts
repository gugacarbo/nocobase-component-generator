import { useEffect, useState } from "react";
import { useAppContext } from "../context/app-context/use-app-context";

function useDefaultProps() {
	const [componentProps, setComponentProps] = useState<Record<string, any>>({});
	const { selectedComponent } = useAppContext();

	useEffect(() => {
		if (!selectedComponent) return;

		import(/* @vite-ignore */ selectedComponent)
			.then(module => {
				if (module.defaultProps) {
					setComponentProps(module.defaultProps);
				} else {
					setComponentProps({});
				}
			})
			.catch(() => {
				setComponentProps({});
			});
	}, [selectedComponent]);

	return componentProps;
}

export { useDefaultProps };
