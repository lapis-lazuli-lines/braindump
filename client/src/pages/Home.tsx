import { Link } from "react-router-dom";
import theme from "../styles/theme";

const HomePage = () => {
	// Features list for the cards
	const features = [
		{
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 text-${theme.colors.text.accent}`} viewBox="0 0 20 20" fill="currentColor">
					<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
				</svg>
			),
			title: "Generate Ideas",
			description: "Get AI-powered content ideas based on your topic of interest.",
		},
		{
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 text-${theme.colors.text.accent}`} viewBox="0 0 20 20" fill="currentColor">
					<path
						fillRule="evenodd"
						d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
						clipRule="evenodd"
					/>
				</svg>
			),
			title: "Create Drafts",
			description: "Turn your ideas into well-structured content drafts with AI assistance.",
		},
		{
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 text-${theme.colors.text.accent}`} viewBox="0 0 20 20" fill="currentColor">
					<path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
				</svg>
			),
			title: "Find Images",
			description: "Search for relevant images to enhance your content.",
		},
	];

	// Examples for the example card
	const examples = [
		{ text: '"Write a blog post about sustainable living"' },
		{ text: '"Generate product descriptions for eco-friendly products"' },
		{ text: '"Create social media content for a fitness brand"' },
	];

	return (
		<div className="space-y-8 py-6">
			{/* Hero Section */}
			<section className="text-center py-12 relative">
				{/* Glowing backdrop effect */}
				<div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent pointer-events-none"></div>

				<div className="max-w-3xl mx-auto relative z-10">
					{/* Logo */}
					<div
						className={`mb-6 mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-${theme.colors.primary.DEFAULT} to-${theme.colors.secondary.DEFAULT} flex items-center justify-center shadow-lg shadow-blue-500/20`}>
						<svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 text-${theme.colors.text.primary}`} viewBox="0 0 20 20" fill="currentColor">
							<path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
							<path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
						</svg>
					</div>

					{/* Title */}
					<h1 className={`${theme.typography.heading.h1} text-4xl mb-4`}>
						Content<span className="text-blue-400">Craft</span>
					</h1>

					{/* Subtitle with blue accent */}
					<p className={`text-xl text-${theme.colors.text.secondary} mb-8`}>
						Create engaging content with <span className="text-blue-400">AI assistance</span>. Generate ideas, draft content, and find perfect images.
					</p>

					{/* CTA Button with glow effect */}
					<Link to="/create" className={`${theme.getThemeClasses.button("gradient")} shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300`}>
						Start Creating
					</Link>
				</div>
			</section>

			{/* Feature Cards */}
			<section className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{features.map((feature, index) => (
					<div key={index} className={`${theme.getThemeClasses.card("glow")} p-6 backdrop-blur-sm transition-all duration-300 hover:translate-y-[-4px]`}>
						<div className="mb-4">{feature.icon}</div>
						<h3 className={`${theme.typography.heading.h3} mb-2`}>{feature.title}</h3>
						<p className={`text-${theme.colors.text.secondary}`}>{feature.description}</p>
					</div>
				))}
			</section>

			{/* Examples Card */}
			<section className={`${theme.getThemeClasses.card("dark")} p-6 backdrop-blur-sm border border-slate-700/50`}>
				<div className="flex items-center mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-${theme.colors.text.accent} mr-2`} viewBox="0 0 20 20" fill="currentColor">
						<path
							fillRule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
							clipRule="evenodd"
						/>
					</svg>
					<h3 className={theme.typography.heading.h3}>Examples</h3>
				</div>
				<div className="space-y-3">
					{examples.map((example, index) => (
						<div
							key={index}
							className={`p-3 bg-${theme.colors.background.dark} rounded-lg border border-slate-700/30 transition-all duration-300 hover:border-blue-500/30`}>
							<p className={`text-${theme.colors.text.secondary}`}>{example.text}</p>
						</div>
					))}
				</div>
			</section>

			{/* Capabilities & Limitations */}
			<section className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Capabilities */}
				<div className={`${theme.getThemeClasses.card()} p-6 backdrop-blur-sm`}>
					<div className="flex items-center mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-${theme.colors.text.accent} mr-2`} viewBox="0 0 20 20" fill="currentColor">
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clipRule="evenodd"
							/>
						</svg>
						<h3 className={theme.typography.heading.h3}>Capabilities</h3>
					</div>
					<ul className="space-y-2">
						<li className="flex items-start">
							<span className={`text-${theme.colors.status.success} mr-2`}>•</span>
							<span className={`text-${theme.colors.text.secondary}`}>Generate varied content ideas from any topic</span>
						</li>
						<li className="flex items-start">
							<span className={`text-${theme.colors.status.success} mr-2`}>•</span>
							<span className={`text-${theme.colors.text.secondary}`}>Create well-structured draft content</span>
						</li>
						<li className="flex items-start">
							<span className={`text-${theme.colors.status.success} mr-2`}>•</span>
							<span className={`text-${theme.colors.text.secondary}`}>Find relevant images to complement your content</span>
						</li>
						<li className="flex items-start">
							<span className={`text-${theme.colors.status.success} mr-2`}>•</span>
							<span className={`text-${theme.colors.text.secondary}`}>Save and organize your content for future use</span>
						</li>
					</ul>
				</div>

				{/* Limitations */}
				<div className={`${theme.getThemeClasses.card()} p-6 backdrop-blur-sm`}>
					<div className="flex items-center mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-${theme.colors.text.accent} mr-2`} viewBox="0 0 20 20" fill="currentColor">
							<path
								fillRule="evenodd"
								d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
								clipRule="evenodd"
							/>
						</svg>
						<h3 className={theme.typography.heading.h3}>Limitations</h3>
					</div>
					<ul className="space-y-2">
						<li className="flex items-start">
							<span className={`text-${theme.colors.status.warning} mr-2`}>•</span>
							<span className={`text-${theme.colors.text.secondary}`}>May require refinement of generated content</span>
						</li>
						<li className="flex items-start">
							<span className={`text-${theme.colors.status.warning} mr-2`}>•</span>
							<span className={`text-${theme.colors.text.secondary}`}>Image suggestions depend on the availability in the database</span>
						</li>
						<li className="flex items-start">
							<span className={`text-${theme.colors.status.warning} mr-2`}>•</span>
							<span className={`text-${theme.colors.text.secondary}`}>Works best with specific, clear prompts</span>
						</li>
						<li className="flex items-start">
							<span className={`text-${theme.colors.status.warning} mr-2`}>•</span>
							<span className={`text-${theme.colors.text.secondary}`}>Limited knowledge about very recent events</span>
						</li>
					</ul>
				</div>
			</section>
		</div>
	);
};

export default HomePage;
