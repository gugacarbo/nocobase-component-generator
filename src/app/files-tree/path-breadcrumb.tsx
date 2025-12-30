import { useAppContext } from "../context/app-context/use-app-context";
import { cn } from "../lib/cn";

function PathBreadcrumb() {
	const { currentPath, setCurrentPath } = useAppContext();

	const navigateToBreadcrumb = (index: number) => {
		if (index === -1) {
			setCurrentPath([]);
		} else {
			setCurrentPath(currentPath.slice(0, index + 1));
		}
	};

	return (
		<div className="p-2 pb-0 flex items-center gap-1 text-sm text-gray-100 overflow-x-auto ">
			<button
				onClick={() => navigateToBreadcrumb(-1)}
				className="hover:text-gray-400 transition-colors px-1 shrink-0"
			>
				components
			</button>
			{currentPath.map((part, index) => (
				<div key={index} className="flex items-center gap-1 shrink-0">
					<span className="text-gray-100">/</span>
					<button
						onClick={() => navigateToBreadcrumb(index)}
						className={cn(
							"hover:text-gray-400 transition-colors px-1",
							index === currentPath.length - 1 && "font-medium",
						)}
					>
						{part}
					</button>
				</div>
			))}
		</div>
	);
}

export { PathBreadcrumb };
