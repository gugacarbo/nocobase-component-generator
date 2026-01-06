import { AddFieldButton } from "./components/add-field-button";
import { CreatorHeader } from "./components/creator-header";
import { FieldsManagerProvider } from "./context/fields-manager-context";
import { FieldsList } from "./fields-list";

function JsonFieldsCreator() {
	return (
		<FieldsManagerProvider>
			<div style={{ width: "100%", display: "grid", gap: "8px" }}>
				<CreatorHeader />
				<FieldsList />
				<AddFieldButton />
			</div>
		</FieldsManagerProvider>
	);
}

export default JsonFieldsCreator;
