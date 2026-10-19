import Image from "next/image";

const HomeHeroIllustration = () => {
  return (
    <section className="wrapper mb-10 md:mb-16">
      <div className="library-hero-card min-h-[300px]">
        <div className="library-hero-content">
          {/* Center Part - Desktop */}
          <div className="library-hero-illustration-desktop relative z-10">
            <Image
              src="/assets/hero-illustration.png"
              alt="Vintage books and a globe"
              width={500}
              height={500}
              className="object-contain"
              priority
            />
          </div>

          {/* Center Part - Mobile (Hidden on Desktop) */}
          <div className="library-hero-illustration relative z-10">
            <Image
              src="/assets/hero-illustration.png"
              alt="Vintage books and a globe"
              width={300}
              height={300}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHeroIllustration;
