import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockWeeklySummaries } from '@/mocks/summaries';
import { useNavigate } from 'react-router-dom';

export function AIInsightCard() {
  const navigate = useNavigate();
  const latestAnalysis = mockWeeklySummaries[0];

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        {latestAnalysis.analysis.substring(0, 120)}...
      </p>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => navigate('/reports')}
      >
        Open Full Report
      </Button>
    </div>
  );
}