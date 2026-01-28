import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Share } from "lucide-react";
interface ReportHeaderProps {
  title: string;
  onWhatsAppShare: () => void;
}
export function ReportHeader({
  title,
  onWhatsAppShare
}: ReportHeaderProps) {
  return <>
      <div className="text-lg md:text-xl font-semibold text-inherit pr-4 leading-tight break-words">
        <FileText className="w-5 h-5 inline mr-2 text-vale-blue" />
        {title}
      </div>
      
      <div className="flex items-center gap-2 pt-3">
        <Button onClick={onWhatsAppShare} className="bg-green-500 hover:bg-green-600 text-white h-9" size="sm">
          <Share className="w-4 h-4 mr-2" />
          Compartilhar
        </Button>
      </div>
    </>;
}