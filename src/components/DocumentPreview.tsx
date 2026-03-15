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

interface DocumentPreviewProps {
  attachments: TaskAttachment[];
  label?: string;
}

export function DocumentPreview({ attachments, label = 'Attachments' }: DocumentPreviewProps) {
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null);

  if (!attachments || attachments.length === 0) return null;

  const handleDownload = (attachment: TaskAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
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
          <div className="flex-1 min-h-0 overflow-auto">
            {previewAttachment?.type === 'image' && (
              <img
                src={previewAttachment.url}
                alt={previewAttachment.name}
                className="w-full h-auto rounded-lg object-contain max-h-[70vh]"
              />
            )}
            {previewAttachment?.type === 'pdf' && (
              <iframe
                src={previewAttachment.url}
                title={previewAttachment.name}
                className="w-full h-[70vh] rounded-lg border"
              />
            )}
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => previewAttachment && handleDownload(previewAttachment)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
