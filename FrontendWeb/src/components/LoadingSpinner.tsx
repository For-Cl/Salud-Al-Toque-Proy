export default function LoadingSpinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-teal-200 border-t-teal-600`}
      />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}

