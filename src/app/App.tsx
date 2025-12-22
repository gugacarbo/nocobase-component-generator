import { ComponentView } from "./component-view/component-view";
import { AppProvider } from "./context/app-context";

function App() {
	return (
		<AppProvider>
			<ComponentView />
		</AppProvider>
	);
}

export default App;
