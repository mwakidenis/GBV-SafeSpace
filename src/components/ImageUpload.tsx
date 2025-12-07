import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, X, Upload, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

interface ModerationResult {
  safe: boolean;
  confidence: number;
  categories: string[];
}

const ImageUpload = ({
  onImageUploaded,
  maxSizeMB = 5,
  allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const moderateImage = async (imageDataUrl: string): Promise<ModerationResult> => {
    // Simulated AI content moderation for demonstration
    // TODO: In production, integrate with a real AI moderation API such as:
    // - Google Cloud Vision SafeSearch
    // - AWS Rekognition Content Moderation
    // - Azure Content Moderator
    // - OpenAI Moderation API
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo purposes, all valid images pass moderation
        // The simulation delay mimics real API response time
        resolve({
          safe: true,
          confidence: 0.95,
          categories: [],
        });
      }, 1500);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: `Please upload an image (${allowedTypes.join(", ")})`,
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      toast({
        title: "File Too Large",
        description: `Maximum file size is ${maxSizeMB}MB`,
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setModerating(true);
      setModerationResult(null);

      try {
        // AI content moderation
        const result = await moderateImage(dataUrl);
        setModerationResult(result);

        if (!result.safe) {
          toast({
            title: "Content Warning",
            description: "This image may contain sensitive content and cannot be uploaded.",
            variant: "destructive",
          });
          return;
        }

        // Image passed moderation
        toast({
          title: "Image Approved",
          description: "Image passed content moderation",
        });
      } catch {
        toast({
          title: "Moderation Failed",
          description: "Could not verify image content. Please try again.",
          variant: "destructive",
        });
      } finally {
        setModerating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview || !moderationResult?.safe) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // TODO: In production, implement actual file upload to Supabase Storage:
      // 1. Generate unique filename with user ID prefix
      // 2. Upload to supabase.storage.from('images').upload(path, file)
      // 3. Get public URL or signed URL
      // 4. Return the storage URL instead of data URL
      // For demonstration, we pass the data URL which works for preview
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      onImageUploaded(preview);
      
      toast({
        title: "Upload Complete",
        description: "Image uploaded successfully",
      });

      // Reset state
      setTimeout(() => {
        setPreview(null);
        setModerationResult(null);
        setUploadProgress(0);
      }, 500);
    } catch {
      toast({
        title: "Upload Failed",
        description: "Could not upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setModerationResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />

      {!preview ? (
        <Card
          className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer p-8"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <ImagePlus className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload an image
            </p>
            <p className="text-xs text-muted-foreground">
              Max {maxSizeMB}MB • JPG, PNG, GIF, WebP
            </p>
          </div>
        </Card>
      ) : (
        <Card className="relative overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          
          {/* Moderation status overlay */}
          {moderating && (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Checking content safety...</p>
            </div>
          )}

          {moderationResult && !moderating && (
            <div className="absolute top-2 right-2">
              {moderationResult.safe ? (
                <div className="flex items-center gap-1 bg-green-500/90 text-white px-2 py-1 rounded-full text-xs">
                  <CheckCircle className="h-3 w-3" />
                  Safe
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-destructive/90 text-white px-2 py-1 rounded-full text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  Not Safe
                </div>
              )}
            </div>
          )}

          {/* Remove button */}
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 left-2 h-8 w-8"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Upload progress */}
          {uploading && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/90">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center mt-1">Uploading... {uploadProgress}%</p>
            </div>
          )}
        </Card>
      )}

      {preview && moderationResult?.safe && !uploading && (
        <Button onClick={handleUpload} className="w-full gap-2">
          <Upload className="h-4 w-4" />
          Upload Image
        </Button>
      )}

      {moderationResult && !moderationResult.safe && (
        <div className="p-3 bg-destructive/10 rounded-lg text-sm">
          <p className="font-medium text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Image Blocked
          </p>
          <p className="text-muted-foreground mt-1">
            This image did not pass our content safety check. Please choose a different image.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
