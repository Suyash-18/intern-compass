import { useState } from 'react';
import type { TaskAttachment } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Image, Archive, Download, Eye, X } from 'lucide-react';
import { cn } from '@/lib/utils';

function getFileIcon(type: TaskAttachment['type']) {
  switch (type) {
    case 'pdf': return FileText;
    case 'image': return Image;
    case 'zip': return Archive;
    default: return FileText;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function isPreviewable(attachment: TaskAttachment): boolean {
  return attachment.type === 'image' || attachment.type === 'pdf';
}

// NEW: Helper function to convert Cloudinary PDF URL to a high-quality JPG preview
function getCloudinaryPdfPreview(url: string) {
  if (!url.toLowerCase().includes('cloudinary') || !url.toLowerCase().endsWith('.pdf')) {
    return url; 
  }
  // Injects transformation parameters (width 1200px, auto quality) and changes extension to .jpg
  return url
    .replace('/upload/', '/upload/w_1200,q_auto/')
    .replace(/\.pdf$/i, '.jpg');
}

interface DocumentPreviewProps {
  attachments: TaskAttachment[];
  label?: string;
}

export function DocumentPreview({ attachments, label = 'Attachments' }: DocumentPreviewProps) {
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null);

  if (!attachments || attachments.length === 0) return null;

  const handleDownload = (attachment: TaskAttachment) => {
  let downloadUrl = attachment.url;

  // 1. Check if it's a Cloudinary URL
  const isCloudinary = downloadUrl.includes('cloudinary.com') || downloadUrl.includes('/upload/');

  if (isCloudinary) {
    // 2. Inject Cloudinary's 'fl_attachment' flag.
    // This tells Cloudinary's servers to force a strict file download, 
    // completely bypassing JavaScript CORS limitations.
    if (!downloadUrl.includes('fl_attachment')) {
      // Bonus: You can actually append the filename right after fl_attachment
      // e.g., /upload/fl_attachment:my_custom_name.pdf/
      const cleanFileName = encodeURIComponent(attachment.name || 'download');
      downloadUrl = downloadUrl.replace('/upload/', `/upload/fl_attachment:${cleanFileName}/`);
    }
  }

  // 3. Trigger the download natively
  const link = document.createElement('a');
  link.href = downloadUrl;
  
  // The 'download' attribute is often ignored for cross-origin links, 
  // but Cloudinary's fl_attachment header guarantees the download happens anyway.
  link.setAttribute('download', attachment.name || 'download');
  
  // Target _top or _self is better here. Since Cloudinary is forcing a download, 
  // it won't navigate away from your app. It just triggers the save dialog.
  link.target = '_self'; 
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
        <div className="space-y-2">
          {attachments.map((attachment) => {
            const Icon = getFileIcon(attachment.type);
            const canPreview = isPreviewable(attachment);
            return (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {canPreview && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPreviewAttachment(attachment)}
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(attachment)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewAttachment} onOpenChange={() => setPreviewAttachment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-8">
              {previewAttachment && (() => {
                const Icon = getFileIcon(previewAttachment.type);
                return <Icon className="h-5 w-5 text-primary" />;
              })()}
              <span className="truncate">{previewAttachment?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-auto flex justify-center bg-muted/30 rounded-lg p-2">
            
            {/* Standard Image Preview */}
            {previewAttachment?.type === 'image' && (
              <img
                src={previewAttachment.url}
                alt={previewAttachment.name}
                className="w-full h-auto rounded-lg object-contain max-h-[70vh]"
              />
            )}

            {/* NEW: PDF Preview rendered securely as a Cloudinary Image */}
            {previewAttachment?.type === 'pdf' && (
              <img
                src={getCloudinaryPdfPreview(previewAttachment.url)}
                alt={`Preview of ${previewAttachment.name}`}
                className="w-full h-auto rounded-lg object-contain max-h-[70vh] shadow-sm border"
                onError={(e) => {
                  // Fallback in case Cloudinary transformation fails
                  e.currentTarget.style.display = 'none';
                  console.error('PDF image preview failed to load');
                }}
              />
            )}

          </div>
          <div className="flex justify-between items-center pt-2">
            {previewAttachment?.type === 'pdf' && (
              <p className="text-xs text-muted-foreground">Previewing page 1 of PDF</p>
            )}
            <div className="flex-1 flex justify-end">
              <Button onClick={() => previewAttachment && handleDownload(previewAttachment)}>
                <Download className="h-4 w-4 mr-2" />
                Download Original PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}