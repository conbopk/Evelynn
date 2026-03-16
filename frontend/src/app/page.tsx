import {ArrowRight, CheckCircle2, Download, Expand, Play, Scissors, Sparkles, Star, Target, Zap} from "lucide-react";
import Link from "next/link";
import DemoSection from "~/components/demo-section";
import { Button } from "~/components/ui/button";
import {Card, CardContent} from "~/components/ui/card";
import Image from "next/image";

export default function HomePage() {
  const features = [
    {
      icon: <Scissors className='h-8 w-8'/>,
      title: "Prompt-to-Image",
      description: "Turn your idea into an image with a simple text prompt.",
      color: "text-[#ff79c6]",
      bgColor: "bg-[#ff2db0]/10",
    },
    {
      icon: <Expand className='h-8 w-8'/>,
      title: "Flexible Settings",
      description: "Control size, steps, guidance, and seed for repeatable results.",
      color: "text-[#cc44ff]",
      bgColor: "bg-[#aa00cc]/10",
    },
    {
      icon: <Target className='h-8 w-8'/>,
      title: "Creative Control",
      description: "Use negative prompts and iterate quickly to refine your style.",
      color: "text-[#e8009e]",
      bgColor: "bg-[#e8009e]/10",
    },
    {
      icon: <Zap className='h-8 w-8'/>,
      title: "Lightning Fast",
      description: "Generate high-quality images in seconds with optimized AI infrastructure.",
      color: "text-[#ff79c6]",
      bgColor: "bg-[#ff2db0]/10",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Designer",
      content: "This tool has revolutionized my workflow. Generating concept art that used to take hours now takes minutes!",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Content Creator",
      content: "Perfect for content creation. I can generate consistent visuals for thumbnails and posts fast.",
      rating: 5,
    },
    {
      name: "Emma Rodriguez",
      role: "Founder",
      content: "The quality is incredible. I can explore styles and iterate quickly until it looks right.",
      rating: 5,
    },
  ];

  const pricingFeatures = [
      "Text-to-Image Generation",
      "Prompt + Negative Prompt",
      "Custom Sizes",
      "High-Quality Image Downloads",
      "Fast Processing",
      "Cloud Storage",
  ];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #080010 0%, #0d0018 50%, #120020 100%)" }}>
      {/*Navigation*/}
      <nav className='sticky top-0 z-50 backdrop-blur'
            style={{
              borderBottom: "1px solid rgba(204, 0, 170, 0.2)",
              background: "rgba(8, 0, 16, 0.92)",
            }}
      >
        <div className='mx-auto max-w-7xl sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between'>
            <div className='flex items-center gap-2.5'>
              <Image
                src="/evelynn-favicons/favicon-ai_eye-32x32.png"
                alt="AI Image Generator logo"
                width={32}
                height={32}
                className='rounded-lg'
                style={{ filter: "drop-shadow(0 0 8px rgba(255, 45, 176, 0.6))" }}
              />
              <span
                  className='text-xl font-bold'
                  style={{ background: "linear-gradient(90deg, #ff79c6, #cc44ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                AI Image Generator
              </span>
            </div>

            <div className='hidden items-center space-x-8 md:flex'>
              {(["#features", "#pricing", "#testimonials"] as const).map((href, i) => (
                  <Link
                      key={href}
                      href={href}
                      className='text-sm transition-colors hover:text-[#ff79c6]'
                      style={{ color: "rgba(212, 168, 255, 0.75)" }}
                  >
                    {["Features", "Pricing", "Reviews"][i]}
                  </Link>
              ))}
            </div>

            <div className='flex items-center gap-3'>
              <Link href="/auth/sign-in">
                <Button
                    variant="ghost"
                    size="sm"
                    className='cursor-pointer text-[#d4a8ff] hover:text-white hover:bg-[#cc00aa]/15'
                >
                  Sign In
                </Button>
              </Link>
              <Link href='/dashboard'>
                <Button
                    size='sm'
                    className='cursor-pointer gap-2 border-0 text-white font-semibold'
                    style={{
                      background: "linear-gradient(90deg, #e8009e, #aa00cc)",
                      boxShadow: "0 0 18px rgba(232, 0, 158, 0.4)",
                    }}
                >
                  Try Free
                  <ArrowRight className='h-4 w-4'/>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/*Hero Section*/}
      <section className='relative overflow-hidden py-24 sm:py-36'>
        {/* ambient glow blobs */}
        <div className='pointer-events-none absolute inset-0 overflow-hidden'>
          <div
              className='absolute rounded-full'
              style={{
                width: 600, height: 600,
                top: -200, left: "50%", transform: "translateX(-55%)",
                background: "radial-gradient(circle, rgba(204,0,170,0.18) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
          />
          <div
              className='absolute rounded-full'
              style={{
                width: 400, height: 400,
                bottom: -100, right: "10%",
                background: "radial-gradient(circle, rgba(170,0,204,0.12) 0%, transparent 70%)",
                filter: "blur(50px)",
              }}
          />
        </div>

        <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            <div
                className='mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm'
                style={{
                  border: "1px solid rgba(255, 45, 176, 0.35)",
                  background: "rgba(255, 45, 176, 0.08)",
                  color: "#ff79c6",
                }}
            >
              <Sparkles className='h-4 w-4'/>
              <span className='font-medium'>
                Powered by Z-Image-Turbo & Modal
              </span>
            </div>

            <h1 className='mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl'>
              Turn Text into{" "}
              <span style={{ background: "linear-gradient(90deg, #ff79c6, #cc44ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Images
              </span>
            </h1>

            <p
                className='mx-auto mb-10 max-w-2xl text-lg sm:text-xl'
                style={{ color: "rgba(212, 168, 255, 0.8)" }}
            >
              Create high-quality images from text prompts in seconds. Iterate
              quickly, save your generations, and build your library.
            </p>

            <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
              <Link href='/dashboard'>
                <Button
                  size='lg'
                  className='cursor-pointer gap-2 px-8 py-6 text-base border-0 text-white font-semibold'
                  style={{
                    background: "linear-gradient(90deg, #e8009e, #aa00cc)",
                    boxShadow: "0 0 28px rgba(232, 0, 158, 0.45)",
                  }}
                >
                  <Play className='w-5 h-5'/>
                  Try It Free Now
                </Button>
              </Link>
              <Link href='/dashboard'>
                <Button
                    variant='outline'
                    size='lg'
                    className='cursor-pointer gap-2 px-8 py-6 text-base font-semibold'
                    style={{
                      border: "1px solid rgba(204, 68, 255, 0.4)",
                      color: "#d4a8ff",
                      background: "rgba(170, 0, 204, 0.08)",
                    }}
                >
                  <Play className='w-5 h-5'/>
                  See Examples
                </Button>
              </Link>
            </div>

            <div className='mt-16 text-center'>
              <p className='mb-8 text-sm' style={{ color: "rgba(153, 102, 204, 0.8)" }}>
                Trusted by thousands of creators worldwide
              </p>
              <div className='grid grid-cols-2 items-center justify-center gap-6 sm:grid-cols-5'>
                {[
                  { value: "50K+",  label: "Images Generated" },
                  { value: "5K+",   label: "Active Users" },
                  { value: "99.9%", label: "Uptime" },
                  { value: "4.8★",  label: "User Rating", accent: true },
                  { value: "24/7",  label: "Image Generation", span: true },
                ].map((s, i) => (
                    <div key={i} className={`text-center ${s.span ? "col-span-2 sm:col-span-1" : ""}`}>
                      <div
                          className='text-2xl font-bold'
                          style={{ color: s.accent ? "#ff79c6" : "#ffffff" }}
                      >
                        {s.value}
                      </div>
                      <div className='text-xs' style={{ color: "rgba(153, 102, 204, 0.75)" }}>
                        {s.label}
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*Demo Section*/}
      <DemoSection />

      {/*Features Section*/}
      <section
          id="features"
          className='py-20 sm:py-32'
          style={{ background: "rgba(13, 0, 24, 0.6)" }}
      >
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto mb-16 max-w-2xl text-center'>
            <h2 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
              Powerful AI Images at Your{" "}
              <span style={{ background: "linear-gradient(90deg, #ff79c6, #cc44ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Fingertips
              </span>
            </h2>
            <p className='mt-4 text-lg' style={{ color: "rgba(212, 168, 255, 0.75)" }}>
              Everything you need to create images with the power of artificial intelligence
            </p>
          </div>

          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="group relative overflow-hidden transition-all hover:-translate-y-1"
                  style={{
                    background: "rgba(26, 0, 48, 0.5)",
                    border: "1px solid rgba(204, 0, 170, 0.2)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <CardContent className='p-6'>
                    <div className={`${feature.bgColor} ${feature.color} mb-4 inline-flex items-center justify-center rounded-lg p-3`}>
                      {feature.icon}
                    </div>
                    <h3 className='mb-2 text-lg font-semibold text-white'>
                      {feature.title}
                    </h3>
                    <p className='text-sm' style={{ color: "rgba(212, 168, 255, 0.7)" }}>
                      {feature.description}
                    </p>
                  </CardContent>
                  <div
                      className='absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none'
                      style={{ background: "linear-gradient(135deg, rgba(255,45,176,0.06), rgba(170,0,204,0.06))" }}
                  />
                </Card>
            ))}
          </div>
        </div>
      </section>

      {/*How It Works Section*/}
      <section className='py-20 sm:py-32' style={{ background: "rgba(8, 0, 16, 0.8)" }}>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto mb-16 max-w-2xl text-center'>
            <h2 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
              Simple. Fast. Professional
            </h2>
            <p className='mt-4 text-lg' style={{ color: "rgba(212, 168, 255, 0.75)" }}>
              Get professional results in three simple steps
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-3'>
            {[
              {
                step: "01",
                title: "Write Your Prompt",
                description: "Describe what you want to see. Add details like style, lighting, camera, and mood."
              },
              {
                step: "02",
                title: "Pick Your Settings",
                description: "Set image size and generation parameters, then iterate quickly until it looks right."
              },
              {
                step: "03",
                title: "Generate & Download",
                description: "Get your image in seconds. Download or save it to your projects.",
              },
            ].map((item, index) => (
                <div key={index} className='relative'>
                  <div className='mb-4 flex items-center'>
                    <div
                      className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white'
                      style={{
                        background: "linear-gradient(135deg, #e8009e, #aa00cc)",
                        boxShadow: "0 0 20px rgba(232, 0, 158, 0.4)",
                      }}
                    >
                      {item.step}
                    </div>
                    {index < 2 && (
                        <div
                            className='ml-4 hidden h-2 w-full md:block'
                            style={{ background: "linear-gradient(90deg, rgba(204,0,170,0.4), transparent)" }}
                        />
                    )}
                  </div>
                  <h3 className='mb-2 text-xl font-semibold text-white'>
                    {item.title}
                  </h3>
                  <p style={{ color: "rgba(212, 168, 255, 0.7)" }}>{item.description}</p>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/*Testimonials Section*/}
      <section
          id='testimonials'
          className='py-20 sm:py-32'
          style={{ background: "rgba(13, 0, 24, 0.6)" }}
      >
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto mb-16 max-w-2xl text-center'>
            <h2 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
              Loved by{" "}
              <span style={{ background: "linear-gradient(90deg, #ff79c6, #cc44ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Creators
              </span>
            </h2>
            <p className='mt-4 text-lg' style={{ color: "rgba(212, 168, 255, 0.75)" }}>
              See what our users are saying about AI Image Generator
            </p>
          </div>

          <div className='grid gap-6 md:grid-cols-3'>
            {testimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  className='relative'
                  style={{
                    background: "rgba(26, 0, 48, 0.5)",
                    border: "1px solid rgba(204, 0, 170, 0.2)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <CardContent className='p-6'>
                    <div className='mb-4 flex items-center gap-1'>
                      {Array.from({ length: Number(testimonial.rating) }).map(
                          (_, i) => (
                              <Star
                                key={i}
                                className='h-4 w-4'
                                style={{ fill: "#ff79c6", color: "#ff79c6" }}
                              />
                          ),
                      )}
                    </div>
                    <p className='mb-4 italic' style={{ color: "rgba(212, 168, 255, 0.85)" }}>
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div>
                      <div className='font-semibold text-white'>
                        {testimonial.name}
                      </div>
                      <div className='text-sm' style={{ color: "rgba(153, 102, 204, 0.8)" }}>
                        {testimonial.role}
                      </div>
                    </div>
                  </CardContent>
                </Card>
            ))}
          </div>
        </div>
      </section>

      {/*Pricing Section*/}
      <section
        id="pricing"
        className='py-20 sm:py-32'
        style={{ background: "rgba(8, 0, 16, 0.9)" }}
      >
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto mb-16 max-w-2xl text-center'>
            <h2 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
              Start Creating{" "}
              <span style={{ background: "linear-gradient(90deg, #ff79c6, #cc44ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                For Free
              </span>
            </h2>
            <p className='mt-4 text-lg' style={{ color: "rgba(212, 168, 255, 0.75)" }}>
              No credit card required. Start generating images instantly.
            </p>
          </div>

          <div className='mx-auto max-w-lg'>
            <Card
                className='relative overflow-hidden'
                style={{
                  background: "rgba(26, 0, 48, 0.6)",
                  border: "2px solid rgba(232, 0, 158, 0.45)",
                  backdropFilter: "blur(16px)",
                  boxShadow: "0 0 40px rgba(204, 0, 170, 0.15)",
                }}
            >
              <div
                  className='absolute top-0 right-0 py-1 px-4 text-sm font-medium text-white'
                  style={{ background: "linear-gradient(90deg, #e8009e, #aa00cc)" }}
              >
                Free to Start
              </div>

              <CardContent className='p-8'>
                <div className='mb-8 text-center'>
                  <h3 className='text-2xl font-bold text-white'>
                    Free Plan
                  </h3>
                  <div className='mt-4 flex items-baseline justify-center'>
                    <span className='text-5xl font-bold text-white'>
                      $0
                    </span>
                    <span className='ml-2' style={{ color: "rgba(212, 168, 255, 0.7)" }}>to start</span>
                  </div>
                  <p className='mt-2' style={{ color: "rgba(212, 168, 255, 0.7)" }}>
                    Try all features with free credits
                  </p>
                </div>

                <ul className='mb-8 space-y-4'>
                  {pricingFeatures.map((feature, index) => (
                      <li key={index} className='flex items-center gap-3'>
                        <CheckCircle2 className='h-5 w-5 flex-shrink-0' style={{ color: "#ff79c6" }}/>
                        <span className='text-sm' style={{ color: "rgba(212, 168, 255, 0.9)" }}>{feature}</span>
                      </li>
                  ))}
                </ul>

                <Link href="/dashboard">
                  <Button
                      size='lg'
                      className='w-full cursor-pointer gap-2 border-0 text-white font-semibold'
                      style={{
                        background: "linear-gradient(90deg, #e8009e, #aa00cc)",
                        boxShadow: "0 0 24px rgba(232, 0, 158, 0.4)",
                      }}
                  >
                    <Sparkles className='h-4 w-4'/>
                    Try It Free Now
                  </Button>
                </Link>

                <p className='mt-4 text-center text-xs' style={{ color: "rgba(153, 102, 204, 0.75)" }}>
                  Includes 10 free credits • No credit card required
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/*CTA Section*/}
      <section
          className='relative py-20 sm:py-32'
          style={{ background: "linear-gradient(135deg, rgba(232,0,158,0.1) 0%, rgba(170,0,204,0.1) 100%)" }}
      >
        <div
            className='pointer-events-none absolute inset-0'
            style={{ background: "radial-gradient(ellipse at center, rgba(204,0,170,0.12) 0%, transparent 70%)" }}
        />

        <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <h2 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
              Ready to Transform Your Text?
            </h2>
            <p className='mt-4 text-lg' style={{ color: "rgba(212, 168, 255, 0.8)" }}>
              Join thousands of creators using AI to bring their ideas to life with images
            </p>
            <div className='mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center'>
              <Link href='/dashboard'>
                <Button
                  size='lg'
                  className='cursor-pointer gap-2 px-8 py-6 text-base border-0 text-white font-semibold'
                  style={{
                    background: "linear-gradient(90deg, #e8009e, #aa00cc)",
                    boxShadow: "0 0 28px rgba(232, 0, 158, 0.45)",
                  }}
                >
                  <Sparkles />
                  Try It Free Now
                </Button>
              </Link>
              <Link href='/dashboard'>
                <Button
                  variant='outline'
                  size='lg'
                  className='cursor-pointer gap-2 px-8 py-6 text-base'
                  style={{
                    border: "1px solid rgba(204, 68, 255, 0.4)",
                    color: "#d4a8ff",
                    background: "rgba(170, 0, 204, 0.08)",
                  }}
                >
                  <Download className='h-5 w-5'/>
                  See Examples
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/*Footer*/}
      <footer
          style={{
            borderTop: "1px solid rgba(204, 0, 170, 0.2)",
            background: "rgba(8, 0, 16, 0.95)",
          }}
      >
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='py-16'>
            <div className='grid gap-8 md:grid-cols-4'>
              <div className='md:col-span-2'>
                <div className='mb-4 flex items-center gap-2.5'>
                  <Image
                      src="/evelynn-favicons/favicon-ai_eye-32x32.png"
                      alt="AI Image Generator logo"
                      width={32}
                      height={32}
                      className="rounded-lg"
                      style={{ filter: "drop-shadow(0 0 8px rgba(255, 45, 176, 0.5))" }}
                  />
                  <span
                      className='text-xl font-bold'
                      style={{ background: "linear-gradient(90deg, #ff79c6, #cc44ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                  >
                      AI Image Generator
                  </span>
                </div>
                <p className='max-w-md' style={{ color: "rgba(153, 102, 204, 0.8)" }}>
                  High-quality image generation powered by artificial
                  intelligence. Turn text prompts into images with cutting-edge
                  AI technology.
                </p>
              </div>

              <div>
                <h3 className='mb-4 font-semibold text-white'>Product</h3>
                <ul className='space-y-3 text-sm'>
                  {([["#features", "Features"], ["#pricing", "Pricing"], ["/dashboard", "Dashboard"]] as [string, string][]).map(([href, label]) => (
                      <li key={href}>
                        <Link
                            href={href}
                            className='transition-colors hover:text-[#ff79c6]'
                            style={{ color: "rgba(153, 102, 204, 0.8)" }}
                        >
                          {label}
                        </Link>
                      </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className='mb-4 font-semibold text-white'>Support</h3>
                <ul className='space-y-3 text-sm'>
                  {([
                    ["mailto:nguyennhuthanh0104@gmail.com", "Contact"],
                    ["/dashboard/settings", "Account Settings"],
                  ] as [string, string][]).map(([href, label]) => (
                      <li key={href}>
                        <Link
                            href={href}
                            className='transition-colors hover:text-[#ff79c6]'
                            style={{ color: "rgba(153, 102, 204, 0.8)" }}
                        >
                          {label}
                        </Link>
                      </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
                className='mt-16 pt-8 text-center text-sm'
                style={{
                  borderTop: "1px solid rgba(204, 0, 170, 0.15)",
                  color: "rgba(102, 0, 153, 0.7)",
                }}
            >
              <p>&copy; 2026 AI Image Generator. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
