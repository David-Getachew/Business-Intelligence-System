import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockWeeklySummaries } from '@/mocks/summaries';
import { useNavigate } from 'react-router-dom';

export function AIInsightCard() {
  const navigate = useNavigate();
  const latestAnalysis = mockWeeklySummaries[0];

  return (
    <Card className="shadow-card border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
