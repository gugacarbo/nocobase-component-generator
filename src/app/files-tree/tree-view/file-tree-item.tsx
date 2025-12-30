function FileTreeItem({
	level,
	path,
	name,
	selectedComponent,
	onSelect,
}: {
	level: number;
	path: string;
	name: string;
	selectedComponent?: string | null;
	onSelect: (path: string) => void;
}) {
	return (
		<button
			className={`bg-transparent border-0 text-[#ccc] py-2 px-3 text-left cursor-pointer rounded transition-all duration-200 text-sm flex items-center gap-2 w-full ${selectedComponent === path
					? "font-bold text-amber-500"
					: "hover:bg-[#3d3d3d] hover:text-white"
				}`}
			style={{ paddingLeft: `${level * 16 + 12}px` }}
			onClick={() => onSelect(path)}
		>
			<span className="text-base shrink-0">📄</span>
			<span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
				{name}
			</span>
		</button>
	);
}

export { FileTreeItem };
