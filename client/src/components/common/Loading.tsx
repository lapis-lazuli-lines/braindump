interface LoadingProps {
	message?: string;
}

const Loading = ({ message = "Loading..." }: LoadingProps) => {
	return (
		<div className="flex flex-col items-center justify-center py-6">
			<div className="relative w-12 h-12 mb-3">
				<div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-purple-300/30"></div>
				<div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-purple-500 animate-spin"></div>
			</div>
			<p className="text-purple-200">{message}</p>
		</div>
	);
};

export default Loading;
