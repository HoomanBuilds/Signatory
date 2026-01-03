interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

export default function EmptyState({
  icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-emerald-200 mb-2">{title}</h3>
        <p className="text-green-200/70">{description}</p>
      </div>
    </div>
  );
}
