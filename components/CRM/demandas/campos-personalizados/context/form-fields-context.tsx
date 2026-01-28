import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
} from "react";
import { CamposTipo } from "@components/CRM/@types";
import { useConditionalFields } from "../hooks/use-conditional-fields";

interface FormFieldsContextType {
	fields: CamposTipo[];
	formData: Record<string, any>;
	visibleFields: CamposTipo[];
	isFieldVisible: (field: CamposTipo) => boolean;
	handleChange: (fieldName: string, value: any) => void;
	setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

const FormFieldsContext = createContext<FormFieldsContextType | undefined>(
	undefined,
);

interface FormFieldsProviderProps {
	children: React.ReactNode;
	fields: CamposTipo[];
	initialData?: Record<string, any>;
	onDataChange?: (data: Record<string, any>) => void;
}

export function FormFieldsProvider({
	children,
	fields,
	initialData = {},
	onDataChange,
}: FormFieldsProviderProps) {
	const [formData, setFormData] = useState<Record<string, any>>(initialData);

	const { visibleFields, isFieldVisible } = useConditionalFields(
		fields,
		formData,
	);

	const handleChange = useCallback((fieldName: string, value: any) => {
		setFormData(prev => ({
			...prev,
			[fieldName]: value,
		}));
	}, []);

	useEffect(() => {
		onDataChange?.(formData);
	}, [formData, onDataChange]);

	return (
		<FormFieldsContext.Provider
			value={{
				fields,
				formData,
				visibleFields,
				isFieldVisible,
				handleChange,
				setFormData,
			}}
		>
			{children}
		</FormFieldsContext.Provider>
	);
}

export function useFormFieldsContext() {
	const context = useContext(FormFieldsContext);
	if (!context) {
		throw new Error(
			"useFormFieldsContext deve ser usado dentro de FormFieldsProvider",
		);
	}
	return context;
}
