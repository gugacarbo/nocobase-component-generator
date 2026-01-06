import { AddFieldButton } from "./components/add-field-button";
import { CreatorHeader } from "./components/creator-header";
import { FieldsManagerProvider } from "./context/fields-manager-context";
import { FieldsList } from "./components/fields-list";

function JsonFieldsCreator() {
	return (
		<FieldsManagerProvider>
			<div style={{ width: "100%" }}>
				<CreatorHeader />
				<div style={{ width: "100%", display: "grid", gap: 24 }}>
					<FieldsList />
					<AddFieldButton />
				</div>
			</div>
		</FieldsManagerProvider>
	);
}

export default JsonFieldsCreator;
