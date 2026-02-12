import { useNavigate } from 'react-router-dom';
import { Package, ScanLine, Home, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import { useDashboard } from './useDashboard';
import { BinCard } from '@/features/bins/BinCard';

function StatCard({
  label,
  value,
  icon: Icon,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  onClick?: () => void;
}) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Card className="flex-1">
      <Wrapper
        className="w-full text-left"
        {...(onClick ? { onClick } : {})}
      >
        <CardContent className="flex items-center gap-3 py-4">
          <div className="h-10 w-10 rounded-full bg-[var(--accent)] bg-opacity-10 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div className="min-w-0">
            <p className="text-[24px] font-bold text-[var(--text-primary)] leading-tight">
              {value}
            </p>
            <p className="text-[13px] text-[var(--text-tertiary)]">{label}</p>
          </div>
        </CardContent>
      </Wrapper>
    </Card>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
        {title}
      </h2>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-0.5 text-[13px] font-medium text-[var(--accent)]"
        >
          {action.label}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { activeHomeId } = useAuth();
  const { totalBins, totalItems, recentlyScanned, recentlyUpdated, isLoading } =
    useDashboard();

  if (!activeHomeId) {
    return (
      <div className="flex flex-col gap-4 px-5 pt-6 pb-2">
        <h1 className="text-[34px] font-bold text-[var(--text-primary)] tracking-tight leading-none">
          Home
        </h1>
        <div className="flex flex-col items-center justify-center gap-5 py-24 text-[var(--text-tertiary)]">
          <Home className="h-16 w-16 opacity-40" />
          <div className="text-center space-y-1.5">
            <p className="text-[17px] font-semibold text-[var(--text-secondary)]">
              No home selected
            </p>
            <p className="text-[13px]">
              Create or join a home to start organizing bins
            </p>
          </div>
          <Button
            onClick={() => navigate('/homes')}
            variant="outline"
            className="rounded-[var(--radius-full)] mt-1"
          >
            <Home className="h-4 w-4 mr-2" />
            Manage Homes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-5 pt-6 pb-2">
      <h1 className="text-[34px] font-bold text-[var(--text-primary)] tracking-tight leading-none">
        Home
      </h1>

      {/* Stats */}
      {isLoading ? (
        <div className="flex gap-3">
          <div className="flex-1 glass-card rounded-[var(--radius-lg)] p-4">
            <Skeleton className="h-7 w-12 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex-1 glass-card rounded-[var(--radius-lg)] p-4">
            <Skeleton className="h-7 w-12 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <StatCard
            label="Total Bins"
            value={totalBins}
            icon={Package}
            onClick={() => navigate('/bins')}
          />
          <StatCard label="Total Items" value={totalItems} icon={Package} />
        </div>
      )}

      {/* Quick Scan */}
      <Button
        onClick={() => navigate('/scan')}
        className="w-full rounded-[var(--radius-full)] h-12 text-[15px] font-semibold gap-2"
      >
        <ScanLine className="h-5 w-5" />
        Quick Scan
      </Button>

      {/* Recently Scanned */}
      {recentlyScanned.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionHeader title="Recently Scanned" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyScanned.map((bin) => (
              <BinCard key={bin.id} bin={bin} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Updated */}
      {!isLoading && recentlyUpdated.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionHeader
            title="Recently Updated"
            action={{ label: 'All Bins', onClick: () => navigate('/bins') }}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyUpdated.map((bin) => (
              <BinCard key={bin.id} bin={bin} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
