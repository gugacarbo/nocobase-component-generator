export interface MultipleSelectProps {
	fieldId?: string;
	fieldLabel?: string;
	placeholderDefault?: string;
	placeholderLoading?: string;
	notFoundMessage?: string;
}

export interface SelectOptionData {
	key: string | number;
	value: string | number;
	label: string;
	color: string;
}

export interface TagRenderProps {
	value: any;
	label: React.ReactNode;
	closable: boolean;
	onClose: (event?: any) => void;
}
