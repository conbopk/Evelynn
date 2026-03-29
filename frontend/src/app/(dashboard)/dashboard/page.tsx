"use client";

import Image from "next/image";
import {RedirectToSignIn, SignedIn} from "@daveyplate/better-auth-ui";
import {useEffect, useState} from "react";
import type {ImageProject} from "~/app/(dashboard)/dashboard/projects/page";
import {authClient} from "~/lib/auth-client";
import {getUserImageProjects, getUserImageStats} from "~/actions/text-to-image";
import {ArrowRight, Calendar, Expand, FolderOpen, ImageIcon, Loader2, Settings, Sparkles, Star, TrendingUp} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {useRouter} from "next/navigation";
import {ImageLightbox} from "~/components/image-lightbox";
// import {toast} from "sonner";
// import {getDownloadUrl} from "~/actions/download-image";


interface UserStats {
  totalImageProjects: number;
  thisMonth: number;
  thisWeek: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [imageProjects, setImageProjects] = useState<ImageProject[]>([]);
  const [lightboxImage, setLightboxImage] = useState<ImageProject | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    totalImageProjects: 0,
    thisMonth: 0,
    thisWeek: 0,
  });
  const [user, setUser] = useState<{
    name?: string;
    createdAt?: string | Date;
  } | null>(null);


  useEffect(() => {
    const InitializeDashboard = async () => {
      try {
        // Run session and image projects fetch in parallel
        const [sessionResult, imageResult, statsResult] = await Promise.all([
            authClient.getSession(),
            getUserImageProjects(),
            getUserImageStats(),
        ])

        // Set user from session
        if (sessionResult?.data?.user) {
          setUser(sessionResult.data.user);
        }

        // Set image projects
        if (imageResult.success && imageResult.imageProjects) {
          setImageProjects(imageResult.imageProjects as ImageProject[]);
        }

        // Calculate stats
        const images = (imageResult.imageProjects as ImageProject[]) ?? [];
        const total = statsResult?.total ?? images.length;

        if (!statsResult.success || statsResult.thisMonth === undefined || statsResult.thisWeek === undefined) {
          setUserStats({
            totalImageProjects: total,
            thisMonth: 0,
            thisWeek: 0,
          });
        } else {
          setUserStats({
            totalImageProjects: total,
            thisMonth: statsResult.thisMonth,
            thisWeek: statsResult.thisWeek,
          });
        }
      } catch (e) {
        console.error("Dashboard initialization failed:", e);
      } finally {
        setIsLoading(false);
      }
    };

    void InitializeDashboard();
  }, []);


  // const handleDownload = async (img: ImageProject) => {
  //   try {
  //     const result = await getDownloadUrl(img.s3Key);
  //     if (!result.success || !result.url) {
  //       toast.error(result.error ?? "Failed to get download link");
  //       return;
  //     }
  //     const link = document.createElement("a");
  //     link.href = result.url;
  //     link.download = result.filename ?? "generated-image.png";
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } catch (e) {
  //     toast.error("Download failed");
  //   }
  // };

  if (isLoading) {
    return (
        <div className='mt-24 flex min-h-[400px] items-center justify-center'>
          <div className='flex flex-col items-center gap-4'>
            <Loader2 className='h-8 w-8 animate-spin text-primary'/>
            <p className='text-sm text-muted-foreground'>Loading your dashboard...</p>
          </div>
        </div>
    );
  }

  const statCards = [
    {
      title: "Total Images",
      icon: <ImageIcon className='h-4 w-4 text-primary'/>,
      value: userStats.totalImageProjects,
      label: "Image generations",
      valueClass: "text-primary",
    },
    {
      title: "This Month",
      icon: <Calendar className='h-4 w-4 text-accent'/>,
      value: userStats.thisMonth,
      label: "Projects created",
      valueClass: "text-accent",
    },
    {
      title: "This Week",
      icon: <TrendingUp className='h-4 w-4 text-primary'/>,
      value: userStats.thisWeek,
      label: "Image generations",
      valueClass: "text-primary",
    },
    {
      title: "Member Since",
      icon: <Star className='h-4 w-4 text-accent'/>,
      value: user?.createdAt
          ? new Date(user.createdAt as string | number | Date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
          : "N/A",
      label: "Account created",
      valueClass: "text-accent",
    },
  ];

  return (
      <>
        <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)}/>

        <RedirectToSignIn />
        <SignedIn>
          <div className='space-y-6'>
            {/* Header */}
            <div className='space-y-2'>
              <h1 className='bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl'>
                Welcome back{user?.name ? `, ${user.name}` : ""}!
              </h1>
              <p className='text-base text-muted-foreground sm:text-lg'>
                Here&apos;s an overview of your Text-to-Image workspace
              </p>
            </div>

            {/* Stats Cards */}
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {statCards.map((s) => (
                  <Card key={s.title} className='relative overflow-hidden'>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>{s.title}</CardTitle>
                      {s.icon}
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${s.valueClass}`}>{s.value}</div>
                      <p className='text-xs text-muted-foreground'>{s.label}</p>
                    </CardContent>
                  </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Sparkles className='h-5 w-5 text-primary'/>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  <Button
                      onClick={() => router.push("/dashboard/create")}
                      className='group h-auto flex-col gap-2 bg-gradient-to-br from-primary to-accent p-6 hover:from-primary/90 hover:to-accent/90'
                  >
                    <ImageIcon className='h-8 w-8 transition-transform group-hover:scale-110'/>
                    <div className='text-center'>
                      <div className='font-semibold'>Text-to-Image</div>
                      <div className='text-xs opacity-80'>Generate images from a prompt</div>
                    </div>
                  </Button>

                  <Button
                      onClick={() => router.push("/dashboard/projects")}
                      variant="outline"
                      className='group h-auto flex-col gap-2 p-6 hover:bg-primary/10 hover:border-primary/50'
                  >
                    <FolderOpen className='h-8 w-8 transition-transform group-hover:scale-110'/>
                    <div className='text-center'>
                      <div className='font-semibold'>View All Images</div>
                      <div className='text-xs opacity-70'>Browse your image library</div>
                    </div>
                  </Button>

                  <Button
                      onClick={() => router.push("/dashboard/settings")}
                      variant="outline"
                      className='group h-auto flex-col gap-2 p-6 hover:bg-primary/10 hover:border-primary/50'
                  >
                    <Settings className='h-8 w-8 transition-transform group-hover:scale-110'/>
                    <div className='text-center'>
                      <div className='font-semibold'>Account Settings</div>
                      <div className='text-xs opacity-70'>Manage your profile</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Image Projects */}
            <Card>
              <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle className='flex items-center gap-2'>
                  <ImageIcon className='h-5 w-5 text-primary'/>
                  Recent Image Projects
                </CardTitle>
                {imageProjects.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/dashboard/projects")}
                        className='text-primary hover:text-primary hover:bg-primary/10'
                    >
                      View All <ArrowRight className='ml-1 h-4 w-4'/>
                    </Button>
                )}
              </CardHeader>
              <CardContent>
                {imageProjects.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-12 text-center'>
                      <div className='relative mb-4'>
                        <div className='flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted/20'>
                          <ImageIcon className='h-8 w-8 text-muted-foreground'/>
                        </div>
                      </div>
                      <h3 className='mb-2 text-lg font-semibold'>No image projects yet</h3>
                      <p className='mb-4 text-sm text-muted-foreground'>
                        Start generating images from text prompts
                      </p>
                      <Button
                          onClick={() => router.push("/dashboard/create")}
                          className='gap-2 bg-primary hover:bg-primary/90'
                      >
                        <ImageIcon className='h-4 w-4'/>
                        Create Your First Image
                      </Button>
                    </div>
                ) : (
                    <div className='space-y-3'>
                      {imageProjects.slice(0, 5).map((project) => (
                          <div
                              key={project.id}
                              className='group flex items-center gap-4 rounded-lg border border-border p-4 transition-all hover:bg-muted/30 hover:border-primary/30'
                          >
                            <div className='relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-primary/10'>
                              <Image
                                  src={`/api/images/${project.s3Key}`}
                                  alt={project.prompt}
                                  fill
                                  unoptimized
                                  className='object-contain'
                              />
                            </div>
                            <div className='min-w-0 flex-1'>
                              <h4 className='truncate text-sm font-medium'>
                                {project.name ?? project.prompt.substring(0, 60) + (project.prompt.length > 60 ? "..." : "")}
                              </h4>
                              <div className='mt-1 flex items-center gap-2'>
                                <p className='text-xs text-muted-foreground'>{project.width}x{project.height}</p>
                                <span className='text-xs text-muted-foreground'>•</span>
                                <p className='text-xs text-muted-foreground'>{new Date(project.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <Button
                                variant='outline'
                                size='sm'
                                className='shrink-0 gap-1.5 hover:border-primary/50 hover:bg-primary/10'
                                onClick={() => setLightboxImage(project)}
                            >
                              <Expand className='h-3.5 w-3.5'/>
                              Open
                            </Button>
                          </div>
                      ))}
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </SignedIn>
      </>
  );
}