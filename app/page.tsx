/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useRef } from 'react';
import { X, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { streamCompletion } from './services/api';
import { pdfToJson } from './types/pdf';

interface Resume {
  id: string;
  name: string;
  content: Uint8Array;
  text?: string;
}

export default function Home() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [processingOption, setProcessingOption] = useState<string>('none');
  const [selectedModel, setSelectedModel] = useState<string>('deepseek-ai/DeepSeek-R1');
  const [outputContent, setOutputContent] = useState<string>('');
  const [reasoningContent, setReasoningContent] = useState<string>('');
  const [greetingContent, setGreetingContent] = useState<string>('');
  const [preparationContent, setPreparationContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [workRequirements, setWorkRequirements] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);
  const mainOutputRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of files) {
      if (file.type === 'application/pdf') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const newResume: Resume = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            content: uint8Array,
          };
          setResumes(prev => [...prev, newResume]);
        } catch (error) {
          console.error('Error processing file:', error);
        }
      }
    }
    event.target.value = ''; // Reset file input
  };

  const handleDeleteResume = (id: string) => {
    setResumes(prev => prev.filter(resume => resume.id !== id));
  };

  const handleSubmit = async () => {
    if (resumes.length === 0) return;

    setIsLoading(true);
    setOutputContent('');
    setReasoningContent('');
    setGreetingContent('');
    setPreparationContent('');

    // Process all resumes
    const allResumeContents = await Promise.all(
      resumes.map(async (resume) => {
        const content = await pdfToJson(resume.content);
        return content.text;
      })
    );

    // Combine all resume contents
    const combinedContent = allResumeContents.join('\n\n');
    
    // Create the prompt with resume content and processing option
    let promptInstruction = '';
    switch (processingOption) {
      case 'none':
        promptInstruction = '请根据简历内容，不要添加任何虚构的经历';
        break;
      case 'moderate':
        promptInstruction = '请根据简历内容进行适当润色，可以优化表达方式，突出重要成就，但保持基本事实不变。';
        break;
      case 'creative':
        promptInstruction = '请根据简历内容进行创造性改写，可以适当扩展和丰富内容，使简历更具竞争力。';
        break;
    }

    try {
      // First call - Resume optimization
      await streamCompletion(
        promptInstruction,
        workRequirements,
        combinedContent, 
        selectedModel,
        {
          onContent: (content: string) => {
            setOutputContent(prev => prev + content);
          },
          onReasoningContent: (content: string) => {
            setReasoningContent(prev => prev + content);
          },
          onError: (error: string) => {
            console.error('Error:', error);
            setOutputContent('Error occurred while processing the resume.');
            setIsLoading(false);
          },
          onComplete: () => {
            setIsLoading(false);
            
          }
        }
      );
    } catch (error) {
      console.error('Error:', error);
      setOutputContent('Error occurred while processing the resume.');
      setIsLoading(false);
    }
    console.log("outputContent", outputContent)
  }
      // Second call - Greeting message

  const handleDownload = async () => {
    if (!mainOutputRef.current) return;
    setIsDownloading(true);

    try {
      // First, ensure the content is properly styled for capture
      const contentDiv = mainOutputRef.current;
      const originalStyle = contentDiv.style.cssText;
      contentDiv.style.width = '612pt'; // Letter width in points (8.5 inches)
      contentDiv.style.padding = '50pt';
      contentDiv.style.boxSizing = 'border-box';
      contentDiv.style.backgroundColor = '#ffffff';
      contentDiv.style.fontFamily = "'Noto Sans SC', Arial, sans-serif";

      // Capture the content with high resolution
      const canvas = await html2canvas(contentDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 612, // Letter width in points
        onclone: (doc) => {
          // Add web font to cloned document
          const link = doc.createElement('link');
          link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap';
          link.rel = 'stylesheet';
          doc.head.appendChild(link);
        }
      });

      // Restore original styling
      contentDiv.style.cssText = originalStyle;

      // Create PDF with letter size
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter'
      });

      // Calculate dimensions to fit letter size
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add the image to PDF
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        0,
        imgWidth,
        imgHeight
      );

      // If content is longer than one page, add more pages
      let remainingHeight = imgHeight;
      let currentPage = 1;
      while (remainingHeight > pdf.internal.pageSize.getHeight()) {
        pdf.addPage();
        currentPage++;
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          0,
          -(pdf.internal.pageSize.getHeight() * (currentPage - 1)),
          imgWidth,
          imgHeight
        );
        remainingHeight -= pdf.internal.pageSize.getHeight();
      }

      // Download PDF
      pdf.save('resume.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* Resume Upload Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">上传一份或多份简历</h2>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                multiple
              />
              上传文件
            </label>
          </div>

          {/* Display uploaded resumes */}
          {resumes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {resumes.map(resume => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between gap-2 px-4 py-2 bg-gray-100 rounded-lg"
                >
                  <span className="truncate max-w-[200px]">{resume.name}</span>
                  <button
                    onClick={() => handleDeleteResume(resume.id)}
                    className="p-1 hover:bg-gray-200 rounded-full"
                    aria-label="Delete resume"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Processing Options */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Processing Options</h2>
          
          {/* Model Selection */}
          <div className="space-y-2">
            <h3 className="font-medium">Select Model</h3>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="model"
                value="deepseek-ai/DeepSeek-R1"
                checked={selectedModel === 'deepseek-ai/DeepSeek-R1'}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="form-radio text-black"
              />
              DeepSeek-R1 深度思考
            </label>
            <label className="flex items-center gap-2 opacity-50 cursor-not-allowed">
              <input
                type="radio"
                name="model"
                value="deepseek-ai/DeepSeek-V3"
                checked={selectedModel === 'deepseek-ai/DeepSeek-V3'}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="form-radio text-black"
                disabled
              />
              DeepSeek-V3 快速得出
            </label>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Processing Level</h3>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="processing"
                value="none"
                checked={processingOption === 'none'}
                onChange={(e) => setProcessingOption(e.target.value)}
                className="form-radio text-black"
              />
              不要添加任何虚构的经历
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="processing"
                value="moderate"
                checked={processingOption === 'moderate'}
                onChange={(e) => setProcessingOption(e.target.value)}
                className="form-radio text-black"
              />
              适当润色
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="processing"
                value="creative"
                checked={processingOption === 'creative'}
                onChange={(e) => setProcessingOption(e.target.value)}
                className="form-radio text-black"
              />
              可以自由发挥
            </label>
          </div>
          
          {/* Work Requirements Textarea */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Work Requirements</h2>
            <textarea
              value={workRequirements}
              onChange={(e) => setWorkRequirements(e.target.value)}
              placeholder="Enter the job requirements or position description..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || resumes.length === 0}
          className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Submit'}
        </button>

        {/* Output Areas */}
        <div className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Outputted Resume</h2>
            <div className="w-full border border-gray-300 rounded-lg" ref={contentRef}>
              {reasoningContent && (
                <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-300 bg-gray-50">
                  <ReactMarkdown>{reasoningContent}</ReactMarkdown>
                </div>
              )}
              <div 
                ref={mainOutputRef}
                className="p-4 min-h-[8rem] overflow-auto prose prose-sm max-w-none bg-white [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              >
                <ReactMarkdown
                  components={{
                    strong: ({node, ...props}) => <span className="font-bold" {...props} />,
                    p: ({node, ...props}) => <p className="mb-1" {...props} />,
                    h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-2 mb-1" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-2 mb-1" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-base font-bold mt-1.5 mb-0.5" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-1" {...props} />,
                    li: ({node, ...props}) => <li className="mb-0.5 leading-snug" {...props} />,
                    hr: ({node, ...props}) => <hr className="m-2 border-t border-gray-400" {...props} />
                  }}
                >
                  {outputContent}
                </ReactMarkdown>
              </div>
            </div>
            {(outputContent || reasoningContent) && (
              <button
                onClick={handleDownload}
                disabled={isDownloading || isLoading}
                className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                <Download size={20} />
                {isDownloading ? 'Generating PDF...' : 'Download as PDF'}
              </button>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
