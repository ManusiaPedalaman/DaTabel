
import { ArrowDown, FileSpreadsheet, FileText } from "lucide-react";

export function DemoSection() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-muted/30 border border-border p-6 hover:bg-muted/50 transition-colors h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Visual Demo</h3>
        <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-full border">Live Preview</span>
      </div>
      
      <div className="flex-1 flex flex-col gap-4 items-center justify-center relative min-h-[400px]">
        {/* Before: Paper */}
        <div className="w-full max-w-[300px] bg-white p-3 rounded-lg shadow-sm border rotate-[-2deg] z-10 hover:rotate-0 transition-transform duration-300">
             <div className="flex items-center gap-2 mb-2 text-gray-400">
                <FileText className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Original</span>
             </div>
             <div className="space-y-1 opacity-40">
                <div className="h-2 w-full bg-gray-200 rounded"></div>
                <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-2 w-full bg-gray-200 rounded"></div>
             </div>
             <div className="mt-4 grid grid-cols-3 gap-1 opacity-30">
                <div className="h-8 bg-gray-100 border border-gray-300 transform skew-y-1"></div>
                <div className="h-8 bg-gray-100 border border-gray-300 transform skew-y-2"></div>
                <div className="h-8 bg-gray-100 border border-gray-300 transform -skew-y-1"></div>
             </div>
        </div>

        {/* Arrow */}
        <div className="z-20 bg-background rounded-full p-2 border shadow-sm">
            <ArrowDown className="w-4 h-4 text-primary" />
        </div>

        {/* After: Excel */}
        <div className="w-full max-w-[300px] bg-white text-gray-900 p-3 rounded-lg shadow-md border border-green-100 rotate-[2deg] z-10 hover:rotate-0 transition-transform duration-300">
             <div className="flex items-center gap-2 mb-2 text-green-600">
                <FileSpreadsheet className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Excel</span>
             </div>
             <div className="grid grid-cols-3 border-t border-l border-gray-200 text-[8px] font-mono">
                <div className="p-1 border-b border-r border-gray-200 bg-gray-50 font-bold">Item</div>
                <div className="p-1 border-b border-r border-gray-200 bg-gray-50 font-bold">Qty</div>
                <div className="p-1 border-b border-r border-gray-200 bg-gray-50 font-bold">Price</div>
                
                <div className="p-1 border-b border-r border-gray-200">Apple</div>
                <div className="p-1 border-b border-r border-gray-200">10</div>
                <div className="p-1 border-b border-r border-gray-200">$5</div>

                <div className="p-1 border-b border-r border-gray-200">Pear</div>
                <div className="p-1 border-b border-r border-gray-200">5</div>
                <div className="p-1 border-b border-r border-gray-200">$3</div>
             </div>
        </div>
      </div>
    </div>
  );
}
