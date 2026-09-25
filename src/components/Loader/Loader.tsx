interface LoaderProps {
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ fullScreen = false }) => {
  return (
    <div 
      className={`flex items-center justify-center ${
        fullScreen ? 'min-h-screen bg-gray-900' : 'h-full w-full'
      }`}
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );
};