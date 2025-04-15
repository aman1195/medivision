
import { Button } from "@/components/ui/button";
import { Eye, FileText, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface Report {
  id: string;
  title: string;
  date: string;
  type: string;
}

export function RecentReports() {
  const [recentReports, setRecentReports] = useState<Report[]>([]);

  useEffect(() => {
    // Get the scanned reports from localStorage
    const storedReports = localStorage.getItem('scannedReports');
    if (storedReports) {
      try {
        const parsedReports = JSON.parse(storedReports);
        setRecentReports(parsedReports);
      } catch (error) {
        console.error("Error parsing reports:", error);
        setRecentReports([]);
      }
    }
  }, []);

  if (recentReports.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No reports yet</p>
      </div>
    );
  }

  const getReportBadge = (type: string) => {
    switch(type) {
      case "blood":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300">Blood</Badge>;
      case "cholesterol":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300">Cholesterol</Badge>;
      case "cbc":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300">CBC</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">Report</Badge>;
    }
  };

  // Show only the most recent 3 reports
  const displayReports = recentReports.slice(0, 3);

  return (
    <div className="space-y-4">
      {displayReports.map((report) => (
        <div key={report.id} className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0 last:pb-0 hover:bg-gray-50 p-2 rounded-md transition-colors">
          <div className="flex items-start space-x-3">
            <div className="mt-1">
              <FileText className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{report.title}</h4>
              <div className="flex items-center mt-1 space-x-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(report.date).toLocaleDateString()}
                </div>
                <div>{getReportBadge(report.type)}</div>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0 hover:bg-gray-100" asChild>
            <Link to={`/report/${report.id}`}>
              <Eye className="h-4 w-4 text-gray-700" />
              <span className="sr-only">View</span>
            </Link>
          </Button>
        </div>
      ))}
      <div className="pt-2">
        <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-100" asChild>
          <Link to="/reports">View All Reports</Link>
        </Button>
      </div>
    </div>
  );
}
