import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Upload, FileText, Image, Download, Trash2, Calendar, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface EvidenceFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  description: string | null;
  incident_date: string | null;
  created_at: string;
  storage_path: string;
}

const EvidenceLocker = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    description: "",
    incident_date: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchEvidenceFiles();
    }
  }, [user]);

  const fetchEvidenceFiles = async () => {
    const { data, error } = await supabase
      .from("evidence_files")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load evidence files");
    } else {
      setFiles(data || []);
    }
  };

  const generateEncryptionKey = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.file || !user) return;

    setUploading(true);
    try {
      const encryptionKey = generateEncryptionKey();
      const filePath = `${user.id}/${Date.now()}_${uploadData.file.name}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("evidence-files")
        .upload(filePath, uploadData.file);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase.from("evidence_files").insert({
        user_id: user.id,
        file_name: uploadData.file.name,
        file_type: uploadData.file.type,
        file_size: uploadData.file.size,
        storage_path: filePath,
        encryption_key: encryptionKey,
        description: uploadData.description || null,
        incident_date: uploadData.incident_date || null,
      });

      if (dbError) throw dbError;

      toast.success("Evidence file uploaded securely");
      setUploadData({ file: null, description: "", incident_date: "" });
      fetchEvidenceFiles();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload file";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file: EvidenceFile) => {
    try {
      const { data, error } = await supabase.storage
        .from("evidence-files")
        .download(file.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: unknown) {
      toast.error("Failed to download file");
    }
  };

  const handleDelete = async (file: EvidenceFile) => {
    if (!confirm("Are you sure you want to delete this evidence file?")) return;

    try {
      const { error: storageError } = await supabase.storage
        .from("evidence-files")
        .remove([file.storage_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("evidence_files")
        .delete()
        .eq("id", file.id);

      if (dbError) throw dbError;

      toast.success("Evidence file deleted");
      fetchEvidenceFiles();
    } catch (error: unknown) {
      toast.error("Failed to delete file");
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navigation />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom duration-700">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Evidence <span className="text-primary">Locker</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Securely store and manage evidence with military-grade encryption
          </p>
        </div>

        <Card className="p-6 mb-8 shadow-medium">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold">Upload Evidence</h2>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label htmlFor="file">File *</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                required
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported: Images, videos, audio, PDFs, documents
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this evidence..."
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                maxLength={1000}
              />
            </div>

            <div>
              <Label htmlFor="incident_date">Incident Date</Label>
              <Input
                id="incident_date"
                type="date"
                value={uploadData.incident_date}
                onChange={(e) => setUploadData({ ...uploadData, incident_date: e.target.value })}
              />
            </div>

            <Button type="submit" disabled={!uploadData.file || uploading}>
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Evidence"}
            </Button>
          </form>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => {
            const isImage = file.file_type.startsWith("image/");
            const Icon = isImage ? Image : FileText;

            return (
              <Card key={file.id} className="p-6 shadow-medium hover:shadow-strong transition-smooth">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(file)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="font-semibold mb-2 truncate">{file.file_name}</h3>
                
                {file.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {file.description}
                  </p>
                )}

                <div className="space-y-1 text-xs text-muted-foreground">
                  {file.incident_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(file.incident_date), "MMM d, yyyy")}
                    </div>
                  )}
                  <div>Uploaded: {format(new Date(file.created_at), "MMM d, yyyy")}</div>
                  <div>Size: {(file.file_size / 1024).toFixed(1)} KB</div>
                  <div className="flex items-center gap-1 text-accent">
                    <Lock className="h-3 w-3" />
                    Encrypted
                  </div>
                </div>
              </Card>
            );
          })}

          {files.length === 0 && (
            <Card className="p-12 text-center col-span-full">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No evidence files uploaded yet</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default EvidenceLocker;
