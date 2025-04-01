import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ContentProvider } from "./contexts/ContentContext";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/Home";
import CreateContentPage from "./pages/CreateContent";
import SavedContentPage from "./pages/SavedContent";
import NotFoundPage from "./pages/NotFound";

function App() {
	return (
		<ContentProvider>
			<Router>
				<Layout>
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/create" element={<CreateContentPage />} />
						<Route path="/saved" element={<SavedContentPage />} />
						<Route path="*" element={<NotFoundPage />} />
					</Routes>
				</Layout>
			</Router>
		</ContentProvider>
	);
}

export default App;
