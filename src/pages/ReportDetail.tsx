import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout/Layout";
import { Separator } from "@/components/ui/separator";
import { ChartContainer } from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DetailedMetricsTable } from "@/components/reports/DetailedMetricsTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Download, FileText } from "lucide-react";
import { HealthMetric } from "@/services/openAIService";

interface Report {
  id: string;
  title: string;
  date: string;
  metrics: HealthMetric[]; 
  recommendations: string[];
  type: string;
  rawText?: string;
  summary: string;
  detailedAnalysis: string;
}

const ReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [riskMetrics, setRiskMetrics] = useState<HealthMetric[]>([]);
  
  useEffect(() => {
    if (!id) return;
    
    // Get the scanned reports from localStorage
    const storedReports = localStorage.getItem('scannedReports');
    if (storedReports) {
      try {
        const parsedReports = JSON.parse(storedReports);
        const foundReport = parsedReports.find((report: Report) => report.id === id);
        
        if (foundReport) {
          // Process metrics to ensure all values are primitive types
          if (foundReport.metrics) {
            foundReport.metrics = foundReport.metrics.map((metric: any) => ({
              ...metric,
              // Ensure the value is a primitive type, not an object
              value: typeof metric.value === 'object' ? 
                JSON.stringify(metric.value) : metric.value,
              // Ensure history exists and all values in history are also primitive
              history: (metric.history || []).map((h: any) => ({
                ...h,
                value: typeof h.value === 'object' ? JSON.stringify(h.value) : h.value
              }))
            }));
          }
          
          setReport(foundReport);
          // Filter risk metrics
          const atRiskMetrics = foundReport.metrics.filter(
            (metric: HealthMetric) => metric.status === "warning" || metric.status === "danger"
          );
          setRiskMetrics(atRiskMetrics);
        } else {
          // Report not found
          navigate('/reports');
        }
      } catch (error) {
        console.error("Error loading report:", error);
      }
    }
    setLoading(false);
  }, [id, navigate]);

  const handleExportPDF = () => {
    // This would be implemented with a PDF generation library
    alert("PDF export functionality will be implemented in a future update");
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Report Not Found</h1>
          <p className="mt-4 text-muted-foreground">The report you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-6" onClick={() => navigate('/reports')}>
            Back to Reports
          </Button>
        </div>
      </Layout>
    );
  }

  // Define chart config for the ChartContainer
  const chartConfig = {
    default: { color: "hsl(var(--primary))" },
    normal: { color: "hsl(var(--health-normal))" },
    warning: { color: "hsl(var(--health-warning))" },
    danger: { color: "hsl(var(--health-danger))" }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{report.title}</h1>
            <p className="text-muted-foreground mt-1">
              Report Date: {new Date(report.date).toLocaleDateString()}
            </p>
          </div>
          <Button 
            className="mt-4 md:mt-0" 
            variant="outline"
            onClick={handleExportPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {riskMetrics.length > 0 && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertTitle>Risk Factors Detected</AlertTitle>
            <AlertDescription>
              This report contains {riskMetrics.length} parameters that require attention. Please consult with your healthcare provider.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="all-parameters" className="mb-8">
          <TabsList>
            <TabsTrigger value="all-parameters">All Parameters</TabsTrigger>
            <TabsTrigger value="at-risk">At Risk ({riskMetrics.length})</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            {report.rawText && <TabsTrigger value="raw-text">Raw Text</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="all-parameters" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete Blood Analysis</CardTitle>
                <CardDescription>
                  All parameters extracted from your health report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DetailedMetricsTable metrics={report.metrics} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="at-risk" className="mt-6">
            {riskMetrics.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Parameters Requiring Attention</CardTitle>
                  <CardDescription>
                    These parameters are outside the normal reference range
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DetailedMetricsTable metrics={riskMetrics} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-accent mb-3" />
                    <h3 className="text-xl font-semibold mb-2">All Parameters Normal</h3>
                    <p className="text-muted-foreground">
                      Great news! All parameters in your report are within normal ranges.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="trends" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              {report.metrics.map((metric) => (
                <Card key={metric.name}>
                  <CardHeader>
                    <CardTitle>{metric.name} Trend</CardTitle>
                    <CardDescription>Historical values over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px] w-full">
                      <ChartContainer config={chartConfig}>
                        {metric.history && metric.history.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metric.history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id={`color-${metric.name}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={`hsl(var(--health-${metric.status}))`} stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor={`hsl(var(--health-${metric.status}))`} stopOpacity={0.1}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                              <XAxis dataKey="date" />
                              <YAxis domain={['auto', 'auto']} />
                              <Tooltip />
                              <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke={`hsl(var(--health-${metric.status}))`} 
                                fillOpacity={1} 
                                fill={`url(#color-${metric.name})`} 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <p className="text-muted-foreground">No historical data available</p>
                          </div>
                        )}
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="summary" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Summary</CardTitle>
                  <CardDescription>
                    AI-generated overview of your health report
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground">{report.summary}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detailed Analysis</CardTitle>
                  <CardDescription>
                    Comprehensive breakdown of your health metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-line">{report.detailedAnalysis}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="recommendations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Recommendations</CardTitle>
                <CardDescription>
                  Based on your blood report analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.recommendations && report.recommendations.length > 0 ? (
                  <ul className="space-y-4">
                    {report.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <p>{recommendation}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No recommendations available for this report.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {report.rawText && (
            <TabsContent value="raw-text" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Raw Report Text</CardTitle>
                  <CardDescription>
                    Original text extracted from your document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md overflow-auto max-h-[500px] whitespace-pre-wrap">
                    {report.rawText}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default ReportDetail;
