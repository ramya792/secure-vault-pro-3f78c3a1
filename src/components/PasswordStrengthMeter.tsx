import { calculatePasswordStrength, getStrengthLabel } from '@/lib/encryption';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const strength = calculatePasswordStrength(password);
  const { label, color } = getStrengthLabel(strength);

  const getBarColor = (threshold: number) => {
    if (strength >= threshold) {
      if (strength < 25) return 'bg-destructive';
      if (strength < 50) return 'bg-warning';
      if (strength < 75) return 'bg-primary';
      return 'bg-success';
    }
    return 'bg-muted';
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-1">
        {[25, 50, 75, 100].map((threshold) => (
          <div
            key={threshold}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              getBarColor(threshold)
            )}
          />
        ))}
      </div>
      {password && (
        <p className={cn(
          'text-xs font-medium transition-colors duration-200',
          color === 'destructive' && 'text-destructive',
          color === 'warning' && 'text-warning',
          color === 'primary' && 'text-primary',
          color === 'success' && 'text-success'
        )}>
          {label}
        </p>
      )}
    </div>
  );
}
