
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/layout/Layout";
import { UploadReportDialog } from "@/components/upload/UploadReportDialog";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Download } from "lucide-react";
import { Link } from "react-router-dom";

interface Report {
  id: string;
  title: string;
  date: string;
  status: string;
  type: string;
}

const Reports = () => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [reportsData, setReportsData] = useState<Report[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Get the scanned reports from localStorage
    const storedReports = localStorage.getItem('scannedReports');
    if (storedReports) {
      try {
        const parsedReports = JSON.parse(storedReports);
        setReportsData(parsedReports);
      } catch (error) {
        console.error("Error parsing reports:", error);
        setReportsData([]);
      }
    }
  }, []);

  const handleDownload = (id: string) => {
    toast({
      title: "Download started",
      description: "Your report download has started",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Health Reports</h1>
            <p className="text-muted-foreground mt-1">View and manage your health reports</p>
          </div>
          <Button 
            size="lg" 
            className="mt-4 md:mt-0"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            Upload New Report
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {reportsData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportsData.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.title}</TableCell>
                      <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                      <TableCell>{report.status}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link to={`/report/${report.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleDownload(report.id)}
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">You haven't uploaded any reports yet</p>
                <Button onClick={() => setIsUploadDialogOpen(true)}>
                  Upload Your First Report
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <UploadReportDialog 
        open={isUploadDialogOpen} 
        onOpenChange={setIsUploadDialogOpen}
      />
    </Layout>
  );
};

export default Reports;
