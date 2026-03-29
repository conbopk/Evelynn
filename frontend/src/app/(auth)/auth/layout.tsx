import type {ReactNode} from "react";
import {Providers} from "~/components/providers";
import Link from "next/link";
import {ImageIcon, Target, Zap} from "lucide-react";
import Image from "next/image";

export default function AuthLayout({children}: { children: ReactNode }) {
  return (
      <Providers>
        <div className='auth-page flex min-h-screen' style={{ background: "#080010" }}>
          {/*Left Side - Branding*/}
          <div
              className='relative hidden overflow-hidden lg:flex lg:w-1/2'
              style={{ background: "linear-gradient(135deg, #0d0018 0%, #1a0030 50%, #120020 100%)" }}
          >
            <div className='pointer-events-none absolute inset-0'>
              <div
                  className='absolute rounded-full'
                  style={{
                    width: 500, height: 500,
                    top: -150, right: -100,
                    background: "radial-gradient(circle, rgba(204,0,170,0.2) 0%, transparent 70%)",
                    filter: "blur(50px)",
                  }}
              />
              <div
                  className='absolute rounded-full'
                  style={{
                    width: 350, height: 350,
                    bottom: -80, left: -50,
                    background: "radial-gradient(circle, rgba(170,0,204,0.15) 0%, transparent 70%)",
                    filter: "blur(40px)",
                  }}
              />
              <div
                  className='absolute rounded-full'
                  style={{
                    width: 200, height: 200,
                    top: "45%", right: 40,
                    background: "radial-gradient(circle, rgba(255,45,176,0.1) 0%, transparent 70%)",
                    filter: "blur(30px)",
                  }}
              />
            </div>

            {/* Subtle grid overlay */}
            <div
                className='absolute inset-0 opacity-[0.04]'
                style={{
                  backgroundImage: "linear-gradient(rgba(204,0,170,1) 1px, transparent 1px), linear-gradient(90deg, rgba(204,0,170,1) 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
            />

            <div className='relative z-10 flex flex-col justify-center px-12 xl:px-16'>
              {/*Logo*/}
              <Link
                href="/"
                className='mb-12 flex cursor-pointer items-center gap-3'
              >
                <Image
                    src="/evelynn-favicons/favicon-ai_eye-48x48.png"
                    alt="AI Image Generator logo"
                    width={48}
                    height={48}
                    className="rounded-xl"
                    style={{
                      filter: "drop-shadow(0 0 12px rgba(255, 45, 176, 0.65))",
                      border: "1px solid rgba(255, 45, 176, 0.25)",
                    }}
                />
                <span
                    className='text-2xl font-bold'
                    style={{ background: "linear-gradient(90deg, #ff79c6, #cc44ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                  AI Image Generator
                </span>
              </Link>

              {/*Hero Content*/}
              <div className='max-w-md'>
                <h1 className='mb-6 text-4xl leading-tight font-bold text-white xl:text-5xl'>
                  Transform Text into{" "}
                  <span style={{ background: "linear-gradient(90deg, #ff79c6, #cc44ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Stunning Images
                  </span>
                </h1>
                <p className='mb-8 text-lg leading-relaxed' style={{ color: "rgba(212, 168, 255, 0.85)" }}>
                  Join thousands of creators using advanced AI to generate beautiful images in seconds.
                </p>

                {/*Feature List*/}
                <div className='space-y-4'>
                  {[
                    {
                      icon: ImageIcon,
                      text: "Text-to-Image Generation",
                      style: { background: "rgba(255, 45, 176, 0.12)", border: "1px solid rgba(255, 45, 176, 0.25)", color: "#ff79c6" },
                    },
                    {
                      icon: Zap,
                      text: "Lightning Fast Processing",
                      style: { background: "rgba(204, 68, 255, 0.12)", border: "1px solid rgba(204, 68, 255, 0.25)", color: "#cc44ff" },
                    },
                    {
                      icon: Target,
                      text: "High-Quality Outputs",
                      style: { background: "rgba(232, 0, 158, 0.12)", border: "1px solid rgba(232, 0, 158, 0.25)", color: "#e8009e" },
                    },
                  ].map((feature, index) => (
                      <div key={index} className='flex items-center gap-3'>
                        <div
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border backdrop-blur-sm"
                            style={feature.style}
                        >
                          <feature.icon className='h-5 w-5'/>
                        </div>
                        <span className='font-medium' style={{ color: "rgba(212, 168, 255, 0.9)" }}>
                          {feature.text}
                        </span>
                      </div>
                  ))}
                </div>
              </div>

              {/*Bottom Stats*/}
              <div className='mt-16 grid grid-cols-3 gap-8'>
                {[
                  { value: "10K+", label: "Images Generated", accent: false },
                  { value: "2.5K+", label: "Happy Users",      accent: false },
                  { value: "4.8★",  label: "Rating",           accent: true  },
                ].map((s) => (
                    <div key={s.label} className='text-center'>
                      <div
                          className='text-2xl font-bold'
                          style={{ color: s.accent ? "#ff79c6" : "rgba(212, 168, 255, 0.95)" }}
                      >
                        {s.value}
                      </div>
                      <div className='text-sm' style={{ color: "rgba(153, 102, 204, 0.7)" }}>
                        {s.label}
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>

          {/*Right Side - Auth Form*/}
          <div
              className='flex flex-1 flex-col justify-center px-6 py-12 lg:px-8'
              style={{ background: "linear-gradient(160deg, #0d0018 0%, #080010 100%)" }}
          >
            {/* subtle border separator on desktop */}
            <div
                className='pointer-events-none absolute inset-y-0 hidden lg:block'
                style={{
                  left: "50%",
                  width: 1,
                  background: "linear-gradient(to bottom, transparent, rgba(204,0,170,0.3) 30%, rgba(204,0,170,0.3) 70%, transparent)",
                }}
            />

            <div className='sm:mx-auto sm:w-full sm:max-w-md'>
              {/*Mobile Logo*/}
              <div className='mb-8 text-center lg:hidden'>
                <Link
                  href='/'
                  className='inline-flex cursor-pointer items-center gap-2'
                >
                  <Image
                      src="/evelynn-favicons/favicon-ai_eye-48x48.png"
                      alt="AI Image Generator logo"
                      width={40}
                      height={40}
                      className="rounded-lg"
                      style={{ filter: "drop-shadow(0 0 8px rgba(255, 45, 176, 0.6))" }}
                  />
                  <span
                      className='text-xl font-bold'
                      style={{ background: "linear-gradient(90deg, #ff79c6, #cc44ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                  >
                    AI Image Generator
                  </span>
                </Link>
              </div>

              {/*Auth Form Container*/}
              <div>{children}</div>

              {/*Footer Link*/}
              <p className='mt-0.5 text-center text-sm'  style={{ color: "rgba(153, 102, 204, 0.75)" }}>
                Back to{" "}
                <Link
                  href="/"
                  className='font-medium transition-colors hover:text-[#ff79c6]'
                  style={{ color: "#cc44ff" }}
                >
                  homepage
                </Link>
              </p>
            </div>
          </div>
        </div>
      </Providers>
  );
}