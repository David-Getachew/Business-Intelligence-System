import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { fetchWeeklySummaries } from '@/api/index';

export function AIInsightCard() {
  const navigate = useNavigate();
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLatestAnalysis();
  }, []);

  const loadLatestAnalysis = async () => {
    try {
      setLoading(true);
      const summaries = await fetchWeeklySummaries();
      if (summaries.length > 0) {
        setLatestAnalysis(summaries[0]);
      }
    } catch (error) {
      console.error('Error loading AI analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  if (!latestAnalysis || !latestAnalysis.ai_analysis) {
    return (
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          No AI insights available yet. Weekly reports with AI analysis are generated automatically at the end of each week.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => navigate('/reports')}
        >
          View Reports
        </Button>
      </div>
    );
  }

  const PREVIEW_LENGTH = 120;
  const analysis = latestAnalysis.ai_analysis || '';
  const preview = analysis.length > PREVIEW_LENGTH 
    ? analysis.substring(0, PREVIEW_LENGTH) + '...' 
    : analysis;

  return (
    <div>
      <p className="text-base text-muted-foreground mb-4 font-medium">
        Latest Week
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        {preview}
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