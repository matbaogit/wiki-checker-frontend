
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertTriangle, Info, FileText } from 'lucide-react';

interface ResultDisplayProps {
  result: any;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  if (!result) return null;

  // Extract main content from the result
  const output = result.output || '';
  const hasContent = output && output.trim().length > 0;

  // Parse different sections from the output
  const parseOutput = (text: string) => {
    const sections = [];
    
    // Split by common Vietnamese patterns
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentSection = { title: 'Thông tin chung', content: [] as string[] };
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes('**') || trimmedLine.includes('*')) {
        // This looks like a heading or important text
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
          currentSection = { title: trimmedLine.replace(/\*/g, '').trim(), content: [] };
        } else {
          currentSection.title = trimmedLine.replace(/\*/g, '').trim();
        }
      } else if (trimmedLine.length > 0) {
        currentSection.content.push(trimmedLine);
      }
    }
    
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  const sections = hasContent ? parseOutput(output) : [];

  const getStatusBadge = (content: string) => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('lỗi') || lowerContent.includes('không')) {
      return <Badge variant="destructive" className="ml-2">Cần chú ý</Badge>;
    } else if (lowerContent.includes('tốt') || lowerContent.includes('đúng')) {
      return <Badge variant="default" className="ml-2 bg-green-600">Tốt</Badge>;
    } else if (lowerContent.includes('cảnh báo') || lowerContent.includes('thiếu')) {
      return <Badge variant="secondary" className="ml-2">Cảnh báo</Badge>;
    }
    return null;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Kết quả kiểm tra bài viết
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasContent ? (
          <div className="text-center py-8 text-gray-500">
            <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Không có dữ liệu để hiển thị</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-lg text-gray-800">
                    {section.title}
                  </h3>
                  {getStatusBadge(section.content.join(' '))}
                </div>
                
                <div className="pl-6 space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
                
                {index < sections.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
            
            {/* Raw data section for debugging */}
            <details className="mt-6">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                Xem dữ liệu JSON gốc
              </summary>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-auto">
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultDisplay;
