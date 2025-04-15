
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface HealthMetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  status: "normal" | "warning" | "danger";
  change?: number;
  description: string;
  range?: string;
}

export function HealthMetricCard({ 
  title, 
  value, 
  unit, 
  status, 
  change, 
  description,
  range
}: HealthMetricCardProps) {
  // Handle value if it's an object
  const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;

  const getStatusColor = (status: string) => {
    switch(status) {
      case "normal": return "text-green-500";
      case "warning": return "text-amber-500";
      case "danger": return "text-destructive";
      default: return "text-foreground";
    }
  };

  const getStatusBg = (status: string) => {
    switch(status) {
      case "normal": return "bg-green-500/10";
      case "warning": return "bg-amber-500/10";
      case "danger": return "bg-destructive/10";
      default: return "bg-muted/50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "normal": return <Activity className="h-4 w-4 text-green-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "danger": return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4 text-foreground" />;
    }
  };

  const getChangeIndicator = () => {
    if (!change) return null;
    
    if (change > 0) {
      return (
        <div className="flex items-center text-sm">
          <TrendingUp className="h-4 w-4 mr-1 text-amber-500" />
          <span className="text-amber-500">{Math.abs(change)}% increase</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-sm">
          <TrendingDown className="h-4 w-4 mr-1 text-green-500" />
          <span className="text-green-500">{Math.abs(change)}% decrease</span>
        </div>
      );
    }
  };

  const getBorderStyle = (status: string) => {
    switch(status) {
      case "normal": return "border-green-500";
      case "warning": return "border-amber-500";
      case "danger": return "border-destructive";
      default: return "border-muted";
    }
  };

  return (
    <Card className={`overflow-hidden border-t-4 transition-all hover:shadow-md ${getBorderStyle(status)}`}>
      <CardHeader className={`pb-2 ${getStatusBg(status)}`}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">{title}</CardTitle>
          {getStatusIcon(status)}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-baseline">
            <span className={`text-3xl font-bold ${getStatusColor(status)}`}>
              {typeof displayValue === 'string' ? displayValue : displayValue.toLocaleString()}
            </span>
            <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
          </div>
        </div>
        {range && (
          <div className="mt-1 text-xs text-muted-foreground">
            Reference range: {range}
          </div>
        )}
        <div className="mt-2">
          {getChangeIndicator()}
        </div>
      </CardContent>
    </Card>
  );
}
