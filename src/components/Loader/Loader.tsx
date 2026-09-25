interface LoaderProps {
  fullScreen?: boolean;
}

export const Loader = ({ fullScreen = false }: LoaderProps) => {
  const spinner = (
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500"></div>
  );

  if (fullScreen) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center p-4">{spinner}</div>;
}