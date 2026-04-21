import Hero from "./hero";
import Fitur from "./fitur";
import CaraKerja from "./cara_kerja";
import Mengapa from "./mengapa";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="container mx-auto py-8 px-4 md:px-8 max-w-screen-2xl space-y-24">
         {/* Hero Section */}
         <section id="home">
            <Hero />
         </section>

         {/* How It Works Section */}
         <section id="works">
            <CaraKerja />
         </section>

         {/* Features Section (Bento Grid) */}
         <section id="features">
            <Fitur />
         </section>

         {/* Why Us Section */}
         <section id="why">
            <Mengapa />
         </section>

      </div>
    </div>
  );
}