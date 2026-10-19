import { DemoSection } from "@/components/DemoSection";

export default function CaraKerja() {
  return (
    <div className="py-2 container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Column: Visual Demo (Vertical Flow) */}
            <div className="h-[500px]">
                <div className="h-full">
                    <DemoSection />
                </div>
            </div>

            {/* Right Column: Text (Left Aligned - 'Rata Kiri') */}
            <div className="flex flex-col items-start text-left space-y-4">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                    Works Like <br />
                    <span className="text-primary">Magic</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-md">
                    Simply upload a photo of your paper table, and let our AI convert it into a neat, editable Excel file in seconds.
                </p>
            </div>
        </div>
    </div>
  );
}