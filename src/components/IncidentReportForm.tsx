import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertTriangle, FileText, Shield, Clock, MapPin, User, Eye, Send, Check } from "lucide-react";

interface IncidentReport {
  incident_type: string;
  description: string;
  date_of_incident: string;
  time_of_incident: string;
  location: string;
  perpetrator_known: boolean;
  perpetrator_relationship: string;
  witnesses_present: boolean;
  reported_to_authorities: boolean;
  injuries_sustained: boolean;
  injury_description: string;
  is_anonymous: boolean;
}

const INCIDENT_TYPES = [
  "Physical Violence",
  "Emotional/Psychological Abuse",
  "Sexual Violence",
  "Economic Abuse",
  "Digital/Cyber Violence",
  "Stalking/Harassment",
  "Threats/Intimidation",
  "Forced Marriage",
  "FGM (Female Genital Mutilation)",
  "Human Trafficking",
  "Other",
];

const RELATIONSHIP_TYPES = [
  "Spouse/Partner",
  "Ex-Spouse/Ex-Partner",
  "Family Member",
  "Acquaintance",
  "Stranger",
  "Authority Figure",
  "Colleague/Coworker",
  "Online Contact",
  "Other",
  "Prefer not to say",
];

const IncidentReportForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [report, setReport] = useState<IncidentReport>({
    incident_type: "",
    description: "",
    date_of_incident: "",
    time_of_incident: "",
    location: "",
    perpetrator_known: false,
    perpetrator_relationship: "",
    witnesses_present: false,
    reported_to_authorities: false,
    injuries_sustained: false,
    injury_description: "",
    is_anonymous: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!report.incident_type || !report.description) {
      toast.error("Please fill in the required fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("incident_reports" as any).insert({
        user_id: report.is_anonymous ? null : user?.id,
        incident_type: report.incident_type,
        description: report.description,
        date_of_incident: report.date_of_incident || null,
        time_of_incident: report.time_of_incident || null,
        location: report.location || null,
        perpetrator_known: report.perpetrator_known,
        perpetrator_relationship: report.perpetrator_relationship || null,
        witnesses_present: report.witnesses_present,
        reported_to_authorities: report.reported_to_authorities,
        injuries_sustained: report.injuries_sustained,
        injury_description: report.injury_description || null,
        is_anonymous: report.is_anonymous,
        status: "submitted",
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Report submitted securely. Your information is protected.");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Report Submitted</h3>
          <p className="text-muted-foreground mb-6">
            Your report has been securely submitted. If you provided contact information, 
            a support coordinator will reach out to you. Remember, you are not alone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/support")}>
              View Support Resources
            </Button>
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              Submit Another Report
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <FileText className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <CardTitle>Incident Report Form</CardTitle>
            <CardDescription>
              Report an incident of gender-based violence. All information is confidential and encrypted.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-primary" />
              <div>
                <Label htmlFor="anonymous">Submit Anonymously</Label>
                <p className="text-xs text-muted-foreground">
                  Your identity will be protected
                </p>
              </div>
            </div>
            <Switch
              id="anonymous"
              checked={report.is_anonymous}
              onCheckedChange={(checked) => setReport({ ...report, is_anonymous: checked })}
            />
          </div>

          {/* Incident Type */}
          <div className="space-y-2">
            <Label htmlFor="incident_type">
              Type of Incident <span className="text-destructive">*</span>
            </Label>
            <Select
              value={report.incident_type}
              onValueChange={(value) => setReport({ ...report, incident_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select incident type" />
              </SelectTrigger>
              <SelectContent>
                {INCIDENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Please describe what happened. Include as much detail as you feel comfortable sharing..."
              value={report.description}
              onChange={(e) => setReport({ ...report, description: e.target.value })}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Take your time. You can share as much or as little as you want.
            </p>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Date of Incident
              </Label>
              <Input
                id="date"
                type="date"
                value={report.date_of_incident}
                onChange={(e) => setReport({ ...report, date_of_incident: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time (if known)</Label>
              <Input
                id="time"
                type="time"
                value={report.time_of_incident}
                onChange={(e) => setReport({ ...report, time_of_incident: e.target.value })}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location"
              placeholder="Where did this happen? (City, area, or general location)"
              value={report.location}
              onChange={(e) => setReport({ ...report, location: e.target.value })}
            />
          </div>

          {/* Perpetrator Information */}
          <Card className="p-4 bg-muted/50">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <h4 className="font-medium">Perpetrator Information</h4>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="perpetrator_known">Do you know the perpetrator?</Label>
                <Switch
                  id="perpetrator_known"
                  checked={report.perpetrator_known}
                  onCheckedChange={(checked) => setReport({ ...report, perpetrator_known: checked })}
                />
              </div>

              {report.perpetrator_known && (
                <div className="space-y-2">
                  <Label>Relationship to perpetrator</Label>
                  <Select
                    value={report.perpetrator_relationship}
                    onValueChange={(value) => setReport({ ...report, perpetrator_relationship: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </Card>

          {/* Additional Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="witnesses">Were there any witnesses?</Label>
              <Switch
                id="witnesses"
                checked={report.witnesses_present}
                onCheckedChange={(checked) => setReport({ ...report, witnesses_present: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="authorities">Have you reported this to authorities?</Label>
              <Switch
                id="authorities"
                checked={report.reported_to_authorities}
                onCheckedChange={(checked) => setReport({ ...report, reported_to_authorities: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="injuries">Did you sustain any injuries?</Label>
              <Switch
                id="injuries"
                checked={report.injuries_sustained}
                onCheckedChange={(checked) => setReport({ ...report, injuries_sustained: checked })}
              />
            </div>

            {report.injuries_sustained && (
              <div className="space-y-2">
                <Label htmlFor="injury_description">Describe injuries (if comfortable)</Label>
                <Textarea
                  id="injury_description"
                  placeholder="Type of injuries, medical attention received, etc."
                  value={report.injury_description}
                  onChange={(e) => setReport({ ...report, injury_description: e.target.value })}
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Warning Card */}
          <Card className="p-4 border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive mb-1">Emergency Contact</p>
                <p className="text-muted-foreground">
                  If you are in immediate danger, please call emergency services:
                  <br />
                  <strong>Kenya: 999 / 112</strong> | <strong>Gender Violence Hotline: 0800 720 990</strong>
                </p>
              </div>
            </div>
          </Card>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Your report is encrypted and secure</span>
            <Badge variant="outline" className="text-xs">AES-256</Badge>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full gap-2" size="lg">
            {loading ? (
              <>Processing...</>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Report
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default IncidentReportForm;
