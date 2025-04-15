
import { HealthMetric } from "@/services/openAIService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Filter, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface DetailedMetricsTableProps {
  metrics: HealthMetric[];
}

export function DetailedMetricsTable({ metrics }: DetailedMetricsTableProps) {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Get unique categories from metrics
  const categories = ["all", ...new Set(metrics.map(metric => metric.category || "Other"))];

  // Filter metrics by category and search query
  const filteredMetrics = metrics.filter(metric => {
    const matchesCategory = categoryFilter === "all" || metric.category === categoryFilter || 
      (!metric.category && categoryFilter === "Other");
    
    const matchesSearch = searchQuery === "" || 
      metric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (metric.description && metric.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Sort metrics by status (danger first, then warning, then normal)
  const sortedMetrics = [...filteredMetrics].sort((a, b) => {
    const statusOrder = { danger: 0, warning: 1, normal: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const getStatusBadge = (status: "normal" | "warning" | "danger") => {
    switch (status) {
      case "danger":
        return <Badge variant="destructive">High Risk</Badge>;
      case "warning":
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Medium Risk</Badge>;
      case "normal":
        return <Badge variant="outline" className="border-green-500 text-green-500">Normal</Badge>;
      default:
        return null;
    }
  };

  // Helper function to ensure values are strings
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const toggleMetricDetails = (metricName: string) => {
    if (expandedMetric === metricName) {
      setExpandedMetric(null);
    } else {
      setExpandedMetric(metricName);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Input
            placeholder="Search parameters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9"
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
        </div>
        <div className="w-full md:w-64">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">Parameter</TableHead>
              <TableHead className="font-semibold">Value</TableHead>
              <TableHead className="font-semibold">Unit</TableHead>
              <TableHead className="font-semibold">Reference Range</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold w-10">Info</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMetrics.length > 0 ? (
              sortedMetrics.map((metric) => (
                <>
                  <TableRow 
                    key={metric.name} 
                    className={
                      metric.status === "danger" ? "bg-red-900/10" :
                      metric.status === "warning" ? "bg-amber-900/10" : ""
                    }
                  >
                    <TableCell className="font-medium">
                      {metric.name}
                      {metric.category && (
                        <div className="text-xs text-muted-foreground mt-1">{metric.category}</div>
                      )}
                    </TableCell>
                    <TableCell className={`font-medium ${
                      metric.status === "danger" ? "text-destructive" :
                      metric.status === "warning" ? "text-amber-500" : ""
                    }`}>
                      {formatValue(metric.value)}
                    </TableCell>
                    <TableCell>{formatValue(metric.unit)}</TableCell>
                    <TableCell>{formatValue(metric.range)}</TableCell>
                    <TableCell>{getStatusBadge(metric.status)}</TableCell>
                    <TableCell>
                      {metric.description ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => toggleMetricDetails(metric.name)}
                                className="p-1 rounded-full hover:bg-muted"
                              >
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs">
                              <p className="text-xs">Click for detailed information</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : null}
                    </TableCell>
                  </TableRow>
                  {expandedMetric === metric.name && metric.description && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={6} className="p-0">
                        <div className="p-3 text-sm">
                          <h4 className="font-medium mb-1">About {metric.name}</h4>
                          <p className="text-muted-foreground">{metric.description}</p>
                          <div className="mt-2 text-xs">
                            <strong>Reference range:</strong> {metric.range} {metric.unit}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No metrics found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-xs text-muted-foreground text-right">
        Showing {sortedMetrics.length} of {metrics.length} parameters
      </div>
    </div>
  );
}
