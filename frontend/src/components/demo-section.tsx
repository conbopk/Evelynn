import Image from "next/image";
import { ImageIcon, Sparkles } from "lucide-react";
import {Card} from "~/components/ui/card";
import Link from "next/link";
import { Button } from "./ui/button";

export default function DemoSection() {
  const examples = [
    {
      title: "Cinematic Portrait",
      prompt: "A cinematic portrait photo of a fox astronaut, soft rim light, 35mm, shallow depth of field",
      tag: "portrait",
      imageSrc: "/demo/cinematic-portrait.png",
    },
    {
      title: "Isometric City",
      prompt: "An isometric futuristic city at sunset, neon signage, ultra-detailed, clean lines",
      tag: "isometric",
      imageSrc: "/demo/isometric-city.png",
    },
    {
      title: "Product Shot",
      prompt: "A premium product photo of a sleek water bottle on a marble surface, studio lighting, crisp reflections",
      tag: "product",
      imageSrc: "/demo/product-shot.png",
    },
  ];

  return (
    <section
        className='relative py-20 sm:py-32'
        style={{ background: "rgba(10, 0, 20, 0.7)" }}
    >
      {/* ambient glow */}
      <div
          className='pointer-events-none absolute inset-0 overflow-hidden'
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(204,0,170,0.1) 0%, transparent 65%)",
          }}
      />

      <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto mb-12 max-w-2xl text-center'>
          <h2 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
            See what you can{" "}
            <span style={{ background: "linear-gradient(90deg, #ff79c6, #cc44ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              generate
            </span>
          </h2>
          <p className='mt-4 text-lg' style={{ color: "rgba(212, 168, 255, 0.75)" }}>
            A few prompt ideas to get you started.
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-3'>
          {examples.map((ex) => (
              <Card
                key={ex.tag}
                className='group relative overflow-hidden transition-all hover:-translate-y-1'
                style={{
                  background: "rgba(26, 0, 48, 0.5)",
                  border: "1px solid rgba(204, 0, 170, 0.2)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {/* hover glow overlay */}
                <div
                    className='pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100'
                    style={{ background: "linear-gradient(135deg, rgba(255,45,176,0.05), rgba(170,0,204,0.05))" }}
                />

                <div className='p-6'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div
                          className='flex h-9 w-9 items-center justify-center rounded-lg text-white'
                          style={{
                            background: "linear-gradient(135deg, #e8009e, #aa00cc)",
                            boxShadow: "0 0 12px rgba(232, 0, 158, 0.35)",
                          }}
                      >
                        <ImageIcon className='h-5 w-5'/>
                      </div>
                      <div className='font-semibold text-white'>
                        {ex.title}
                      </div>
                    </div>
                    <span
                        className='rounded-full px-3 py-1 text-xs font-medium'
                        style={{
                          background: "rgba(255, 45, 176, 0.12)",
                          border: "1px solid rgba(255, 45, 176, 0.25)",
                          color: "#ff79c6",
                        }}
                    >
                      {ex.tag}
                    </span>
                  </div>

                  <div
                      className='mb-4 overflow-hidden rounded-xl'
                      style={{ border: "1px solid rgba(204, 0, 170, 0.2)" }}
                  >
                    <div
                        className='relative aspect-square w-full overflow-hidden rounded-lg'
                        style={{ background: "rgba(13, 0, 24, 0.6)" }}
                    >
                      <Image
                        src={ex.imageSrc}
                        alt={`${ex.title} example`}
                        fill
                        unoptimized
                        className='object-contain'
                      />
                    </div>
                  </div>

                  <p className='text-sm italic' style={{ color: "rgba(212, 168, 255, 0.7)" }}>
                    &ldquo;{ex.prompt}&rdquo;
                  </p>
                </div>
              </Card>
          ))}
        </div>

        <div className='mt-12 text-center'>
          <Link href="/dashboard/create">
            <Button
                size="lg"
                className='cursor-pointer gap-2 px-8 py-6 border-0 text-white font-semibold'
                style={{
                  background: "linear-gradient(90deg, #e8009e, #aa00cc)",
                  boxShadow: "0 0 28px rgba(232, 0, 158, 0.45)",
                }}
            >
              <Sparkles className='h-5 w-5'/>
              Try It Free Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}