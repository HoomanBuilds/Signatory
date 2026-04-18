import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: string;
  iconName?: LucideIcon;
  title: string;
  description: string;
}

export default function EmptyState({
  icon,
  iconName: IconComponent,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="empty-state flex items-center justify-center h-full">
      <div className="text-center">
        <div className="empty-state-icon mb-4 flex items-center justify-center">
          {IconComponent ? (
            <IconComponent className="w-12 h-12 text-ink-40" />
          ) : (
            <span className="text-6xl">{icon}</span>
          )}
        </div>
        <h3 className="font-display text-lg text-ink mb-2">{title}</h3>
        <p className="font-body-alt text-sm text-ink-40">{description}</p>
      </div>
    </div>
  );
}
