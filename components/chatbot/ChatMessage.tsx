import { ChatMessage as ChatMessageType } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, User, FileText, Calendar, Tag, BookOpen, Shield, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadDocument } from "@/lib/api";
import { useEffect, useState } from "react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [isClient, setIsClient] = useState(false);
  const isUser = message.role === "user";
  const isLoading = message.id === "loading-message";

  const handleDownloadDocument = async (policyId: number) => {
    try {
      await downloadDocument(policyId);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", 
            isLoading ? "bg-muted" : "bg-primary"
          )}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <Bot className="w-4 h-4 text-primary-foreground" />
            )}
          </div>
        </div>
      )}

      <div className={cn("max-w-[80%]", isUser && "order-first")}>
        <Card
          className={cn(
            isUser ? "bg-primary text-primary-foreground" : "bg-muted",
            isLoading && "border-dashed border-2 border-muted-foreground/30"
          )}
        >
          <CardContent className={cn("p-3", isUser && "py-0 px-3")}>
            <div className="flex items-center gap-2">
              {isLoading && (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
              <p className={cn("text-sm", isLoading && "text-muted-foreground italic")}>
                {message.content}
              </p>
            </div>

            {message.type && !isUser && !isLoading && (
              <Badge variant="default" className="mt-2">
                {message.type}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Policy Files Display */}
        {message.policyFiles && message.policyFiles.length > 0 && (
          <div className="mt-3 space-y-3">
            <p className="text-sm font-medium text-gray-700">
              Found {message.policyFiles.length} relevant document{message.policyFiles.length > 1 ? 's' : ''}:
            </p>
            {message.policyFiles.map((policy) => (
              <Card key={policy.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {/* Header with title and type */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {policy.document_type === 'policy' ? (
                        <Shield className="w-4 h-4 text-blue-600" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-green-600" />
                      )}
                      <h4 className="font-semibold text-sm">{policy.name}</h4>
                    </div>
                    <Badge 
                      variant={policy.document_type === 'policy' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {policy.document_type}
                    </Badge>
                  </div>

                  {/* Description */}
                  {policy.description && (
                    <p className="text-sm text-gray-600 mb-3 italic">
                      {policy.description}
                    </p>
                  )}

                  {/* Content (truncated) */}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {policy.content}
                  </p>

                  {/* Tags */}
                  {policy.tags && policy.tags.length > 0 && (
                    <div className="flex items-center gap-1 mb-3 flex-wrap">
                      <Tag className="w-3 h-3 text-gray-500" />
                      {policy.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Footer with metadata */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Updated: {policy.last_updated}
                      </span>
                      {policy.created_by && (
                        <span>Created by: {policy.created_by}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {policy.file_path && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadDocument(policy.id)}
                          className="h-6 px-2 text-xs"
                          title="Download original file"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {policy.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isClient && (
          <p className="text-xs text-muted-foreground mt-1">
            {message.timestamp.toLocaleTimeString()}
          </p>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
}
