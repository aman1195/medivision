
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UploadReportDialog } from "@/components/upload/UploadReportDialog";
import { HealthMetricCard } from "@/components/dashboard/HealthMetricCard";
import { RecentReports } from "@/components/dashboard/RecentReports";
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Activity, AlertTriangle, Calendar, FileText, Upload, TrendingUp, BarChart3, Trash2, AlertCircle, Shield, User, FileHeart, Calendar as CalendarIcon, Building } from "lucide-react";
import { HealthMetric, PatientInfo, clearAllHealthData } from "@/services/openAIService";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface Report {
  id: string;
  metrics: HealthMetric[];
  summary?: string;
  detailedAnalysis?: string;
  categories?: string[];
  patientInfo?: PatientInfo;
  title?: string;
  date?: string;
}

const Dashboard = () => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [highRiskMetrics, setHighRiskMetrics] = useState<HealthMetric[]>([]);
  const [mediumRiskMetrics, setMediumRiskMetrics] = useState<HealthMetric[]>([]);
  const [lowRiskMetrics, setLowRiskMetrics] = useState<HealthMetric[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [hasReports, setHasReports] = useState(false);
  const [summary, setSummary] = useState<string | undefined>();
  const [patientInfo, setPatientInfo] = useState<PatientInfo | undefined>();
  const [reportTitle, setReportTitle] = useState<string>("");
  const [reportDate, setReportDate] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if API key is available
    const apiKey = localStorage.getItem("openrouter_api_key");
    setHasApiKey(!!apiKey);
    
    if (!apiKey) {
      // Show a toast prompting the user to add their API key
      toast({
        title: "API Key Required",
        description: "Please add your OpenRouter API key in the settings to use the health analysis features.",
        variant: "destructive",
      });
    }

    // Get the most recent report metrics from localStorage
    const storedReports = localStorage.getItem('scannedReports');
    if (storedReports) {
      try {
        const parsedReports = JSON.parse(storedReports) as Report[];
        setHasReports(parsedReports.length > 0);
        
        if (parsedReports.length > 0 && parsedReports[0].metrics) {
          // Filter risk metrics by risk level
          const highRisk = parsedReports[0].metrics.filter(
            metric => metric.status === "danger"
          );
          setHighRiskMetrics(highRisk);
          
          const mediumRisk = parsedReports[0].metrics.filter(
            metric => metric.status === "warning"
          );
          setMediumRiskMetrics(mediumRisk);
          
          const lowRisk = parsedReports[0].metrics.filter(
            metric => metric.status === "normal"
          );
          setLowRiskMetrics(lowRisk);
          
          // Set summary if available
          setSummary(parsedReports[0].summary);
          
          // Set patient info and report details
          setPatientInfo(parsedReports[0].patientInfo);
          setReportTitle(parsedReports[0].title || "Health Report");
          setReportDate(parsedReports[0].date || new Date().toISOString());
        }
      } catch (error) {
        console.error("Error parsing reports:", error);
      }
    } else {
      setHasReports(false);
    }
  }, [toast]);

  const handleUpload = () => {
    if (!hasApiKey) {
      // If no API key is set, redirect to profile page instead
      toast({
        title: "API Key Required",
        description: "Please add your OpenRouter API key in settings before uploading reports.",
        variant: "destructive",
      });
      navigate("/profile");
      return;
    }
    
    setIsUploadDialogOpen(true);
  };

  const handleClearData = () => {
    clearAllHealthData();
    setHighRiskMetrics([]);
    setMediumRiskMetrics([]);
    setLowRiskMetrics([]);
    setHasReports(false);
    setSummary(undefined);
    setPatientInfo(undefined);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Health Dashboard</h1>
            <p className="text-muted-foreground mt-1 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {reportDate ? `Report date: ${formatDate(reportDate)}` : "No report uploaded yet"}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            {hasReports && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleClearData}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button 
              size="lg" 
              onClick={handleUpload}
              className="bg-accent hover:bg-accent/80"
            >
              <Upload className="h-4 w-4 mr-2" /> Upload Report
            </Button>
          </div>
        </div>

        {!hasApiKey && (
          <Card className="mb-8 border-border">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="text-muted-foreground mb-3">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold">API Key Required</h3>
                <p className="mt-2 text-muted-foreground">Please add your OpenRouter API key in settings to enable health report scanning and analysis.</p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate("/profile")}
                >
                  Go to Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {hasReports && (
          <>
            {patientInfo && Object.values(patientInfo).some(val => val) && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Patient Information
                  </CardTitle>
                  <CardDescription>
                    {reportTitle}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patientInfo.name && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Patient Name</p>
                          <p className="text-sm text-muted-foreground">{patientInfo.name}</p>
                        </div>
                      </div>
                    )}
                    
                    {patientInfo.patientId && (
                      <div className="flex items-center gap-2">
                        <FileHeart className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Patient ID</p>
                          <p className="text-sm text-muted-foreground">{patientInfo.patientId}</p>
                        </div>
                      </div>
                    )}
                    
                    {patientInfo.gender && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Gender</p>
                          <p className="text-sm text-muted-foreground">{patientInfo.gender}</p>
                        </div>
                      </div>
                    )}
                    
                    {(patientInfo.dateOfBirth || patientInfo.age) && (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Date of Birth / Age</p>
                          <p className="text-sm text-muted-foreground">{patientInfo.dateOfBirth || patientInfo.age}</p>
                        </div>
                      </div>
                    )}
                    
                    {patientInfo.collectionDate && (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Collection Date</p>
                          <p className="text-sm text-muted-foreground">{patientInfo.collectionDate}</p>
                        </div>
                      </div>
                    )}
                    
                    {patientInfo.hospitalName && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Hospital/Lab</p>
                          <p className="text-sm text-muted-foreground">{patientInfo.hospitalName}</p>
                        </div>
                      </div>
                    )}
                    
                    {patientInfo.doctorName && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Doctor</p>
                          <p className="text-sm text-muted-foreground">{patientInfo.doctorName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {summary && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Summary Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{summary}</p>
                </CardContent>
              </Card>
            )}

            {(highRiskMetrics.length > 0 || mediumRiskMetrics.length > 0) && (
              <Alert className="mb-6 border-destructive/50 bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertTitle>Risk Factors Detected</AlertTitle>
                <AlertDescription>
                  Your latest health report shows {highRiskMetrics.length} high risk and {mediumRiskMetrics.length} medium risk parameters that require attention.
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="high-risk" className="mb-8">
              <TabsList className="mb-4">
                <TabsTrigger value="high-risk" className="relative">
                  High Risk
                  {highRiskMetrics.length > 0 && (
                    <span className="ml-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">
                      {highRiskMetrics.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="medium-risk" className="relative">
                  Medium Risk
                  {mediumRiskMetrics.length > 0 && (
                    <span className="ml-1 bg-amber-500 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">
                      {mediumRiskMetrics.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="normal" className="relative">
                  Normal
                  {lowRiskMetrics.length > 0 && (
                    <span className="ml-1 bg-green-500 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">
                      {lowRiskMetrics.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="high-risk">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {highRiskMetrics.length > 0 ? (
                    highRiskMetrics.map((metric) => (
                      <HealthMetricCard 
                        key={metric.name}
                        title={metric.name} 
                        value={typeof metric.value === 'object' ? JSON.stringify(metric.value) : metric.value} 
                        unit={metric.unit} 
                        status={metric.status} 
                        description={`Outside normal range`} 
                        range={metric.range}
                      />
                    ))
                  ) : (
                    <Card className="md:col-span-2 lg:col-span-3 p-6 text-center">
                      <div className="flex flex-col items-center justify-center p-6">
                        <Shield className="h-12 w-12 text-green-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No High Risk Parameters</h3>
                        <p className="text-muted-foreground mb-4">No high risk health parameters were identified</p>
                      </div>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="medium-risk">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {mediumRiskMetrics.length > 0 ? (
                    mediumRiskMetrics.map((metric) => (
                      <HealthMetricCard 
                        key={metric.name}
                        title={metric.name} 
                        value={typeof metric.value === 'object' ? JSON.stringify(metric.value) : metric.value} 
                        unit={metric.unit} 
                        status={metric.status} 
                        description={`Outside normal range`}
                        range={metric.range}
                      />
                    ))
                  ) : (
                    <Card className="md:col-span-2 lg:col-span-3 p-6 text-center">
                      <div className="flex flex-col items-center justify-center p-6">
                        <AlertCircle className="h-12 w-12 text-green-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Medium Risk Parameters</h3>
                        <p className="text-muted-foreground mb-4">No medium risk health parameters were identified</p>
                      </div>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="normal">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {lowRiskMetrics.length > 0 ? (
                    lowRiskMetrics.slice(0, 6).map((metric) => (
                      <HealthMetricCard 
                        key={metric.name}
                        title={metric.name} 
                        value={typeof metric.value === 'object' ? JSON.stringify(metric.value) : metric.value} 
                        unit={metric.unit} 
                        status={metric.status} 
                        description={`Within normal range`}
                        range={metric.range}
                      />
                    ))
                  ) : (
                    <Card className="md:col-span-2 lg:col-span-3 p-6 text-center">
                      <div className="flex flex-col items-center justify-center p-6">
                        <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
                        <p className="text-muted-foreground mb-4">Upload a health report to see all parameters</p>
                      </div>
                    </Card>
                  )}
                </div>
                {lowRiskMetrics.length > 6 && (
                  <div className="flex justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => navigate("/reports")}
                    >
                      <FileText className="h-4 w-4 mr-2" /> View All Normal Parameters ({lowRiskMetrics.length})
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {!hasReports && (
          <Card className="md:col-span-2 lg:col-span-3 p-6 text-center mb-8">
            <div className="flex flex-col items-center justify-center p-6">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Health Data Yet</h3>
              <p className="text-muted-foreground mb-4">Upload your first health report to see metrics and insights</p>
              <Button 
                onClick={handleUpload}
              >
                <Upload className="h-4 w-4 mr-2" /> Upload Health Report
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 overflow-hidden">
            <CardHeader>
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                <CardTitle>Health Trends</CardTitle>
              </div>
              <CardDescription>Your health metrics over time</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] flex flex-col items-center justify-center border border-dashed rounded-md">
                <Activity className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-center">Chart will appear when you have more data</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/reports")}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Detailed Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                <CardTitle>Recent Reports</CardTitle>
              </div>
              <CardDescription>Your latest health reports</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentReports />
            </CardContent>
          </Card>
        </div>
      </div>

      <UploadReportDialog 
        open={isUploadDialogOpen} 
        onOpenChange={setIsUploadDialogOpen} 
      />
    </Layout>
  );
};

export default Dashboard;
