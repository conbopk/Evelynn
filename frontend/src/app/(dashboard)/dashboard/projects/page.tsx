"use client";

import Image from "next/image";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import {Calendar, Download, Expand, ImageIcon, Loader2, Plus, Search, Trash2} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {Input} from "~/components/ui/input";
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "~/components/ui/select";
import {toast} from "sonner";
import {authClient} from "~/lib/auth-client";
import {getDownloadUrl} from "~/actions/download-image";
import {deleteImageProject, getUserImageProjectsPaginated} from "~/actions/text-to-image";
import { ExpandableText } from "~/components/expandable-text";
import { Pagination } from "~/components/pagination";
import { ImageLightbox } from "~/components/image-lightbox";


export interface ImageProject {
  id: string;
  name: string | null;
  prompt: string;
  negativePrompt: string | null;
  s3Key: string;
  width: number;
  height: number;
  numInferenceSteps: number;
  guidanceScale: number;
  seed: number;
  modelId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

type SortBy = "newest" | "oldest" | "name";

export default function ProjectsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<ImageProject | null>(null);
  const [imageProjects, setImageProjects] = useState<ImageProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ImageProject[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  
  // Cursor-based pagination state
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined]);
  const [stackIndex, setStackIndex] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const currentCursor = cursorStack[stackIndex];
  const hasPrev = stackIndex > 0;

  // Load page whenever currentCursor changes
  useEffect(() => {
    const loadPage = async () => {
      setIsLoading(true);
      try {
        const [, result] = await Promise.all([
            authClient.getSession(),
            getUserImageProjectsPaginated(currentCursor),
        ]);

        if (result.success && result.imageProjects) {
          setImageProjects(result.imageProjects as ImageProject[]);
          setFilteredProjects(result.imageProjects as ImageProject[]);
          setHasNext(result.pagination?.hasNext ?? false);
          setTotalCount(result.pagination?.total ?? 0);
        }
      } catch (e) {
        console.error("Image projects initialization failed:", e)
      } finally {
        setIsLoading(false)
      }
    };

    void loadPage();
  }, [currentCursor]);

  // Filter and sort projects
  useEffect(() => {
    let filtered = imageProjects.filter((project) =>
      project.prompt.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Sort projects
    switch (sortBy) {
      case "newest":
        filtered = filtered.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "oldest":
        filtered = filtered.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      case "name":
        filtered = filtered.sort((a, b) => a.prompt.localeCompare(b.prompt));
        break;
    }

    setFilteredProjects(filtered);
  }, [imageProjects, searchQuery, sortBy]);

  const handleNext = async () => {
    const result = await getUserImageProjectsPaginated(currentCursor);
    if (result.success && result.pagination?.nextCursor) {
      const newStack = [
          ...cursorStack.slice(0, stackIndex + 1),
          result.pagination.nextCursor,
      ];
      setCursorStack(newStack);
      setStackIndex(stackIndex + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (stackIndex > 0) {
      setStackIndex(stackIndex - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDownload = async (img: ImageProject, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await getDownloadUrl(img.s3Key);

      if (!result.success || !result.url) {
        toast.error(result.error ?? "Failed to get download link");
        return;
      }

      const link = document.createElement("a");
      link.href = result.url;
      link.download = result.filename ?? "generated-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast.error("Download failed");
    }
  };

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this image project?")) return;

    const result = await deleteImageProject(projectId);
    if (result.success) {
      setImageProjects((prev) => prev.filter((p) => p.id !== projectId));
      setFilteredProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success("Image deleted successfully");
    } else {
      toast.error(result.error ?? "Failed to delete image");
    }
  };

  if (isLoading) {
    return (
        <div className='flex min-h-[400px] items-center justify-center mt-24'>
          <div className='flex flex-col items-center gap-4'>
            <Loader2 className='text-primary h-8 w-8 animate-spin'/>
            <p className='text-muted-foreground text-sm'>
              Loading your projects...
            </p>
          </div>
        </div>
    );
  }

  return (
      <>
        <ImageLightbox
          image={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />

        <RedirectToSignIn />
        <SignedIn>
          <div className='space-y-6'>
            {/*Header Section*/}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='space-y-2'>
                <h1 className='from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl'>
                  Your Image Projects
                </h1>
                <p className='text-muted-foreground text-base'>
                  {/*TODO: fix total images*/}
                  Manage and organize all your text-to-image generations (
                  {searchQuery ? `${filteredProjects.length} of ${totalCount}` : totalCount}{" "}
                  {filteredProjects.length === 1 ? "image" : "images"})
                </p>
              </div>
              <Button
                onClick={() => router.push("/dashboard/create")}
                className='gap-2 self-start sm:self-auto cursor-pointer'
              >
                <Plus className='h-4 w-4'/>
                New Image
              </Button>
            </div>

            {/*Controls Bar*/}
            <Card>
              <CardContent className='p-4'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                  {/*Search*/}
                  <div className='relative max-w-md flex-1'>
                    <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2'/>
                    <Input
                      placeholder="Search image projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className='pl-9'
                    />
                  </div>

                  {/*Sort Dropdown*/}
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as SortBy)}
                  >
                    <SelectTrigger className='w-[180px]'>
                      <SelectValue placeholder='Sort by'/>
                    </SelectTrigger>

                    <SelectContent className='rounded-xl border bg-background/80 backdrop-blur-md shadow-xl animate-in fade-in zoom-in-95'>
                      <SelectGroup>
                        <SelectLabel>Sort by</SelectLabel>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="name">Prompt A-Z</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/*Projects Content*/}
            {filteredProjects.length === 0 ? (
                <Card>
                  <CardContent className='flex flex-col items-center justify-center py-16 text-center'>
                    <div className='relative mb-6'>
                      <div className='border-muted bg-muted/20 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed'>
                        <ImageIcon className='text-muted-foreground h-10 w-10'/>
                      </div>
                    </div>
                    <h3 className='mb-2 text-xl font-semibold'>
                      {searchQuery ? "No images found" : "No image projects yet"}
                    </h3>
                    <p className='text-muted-foreground mb-6 max-w-md text-sm'>
                      {searchQuery
                          ? `No images match "${searchQuery.trim()}". Try adjusting your search terms.`
                          : "Start generating images to see them here."}
                    </p>
                    {searchQuery.trim() ? (
                        <Button
                          variant="outline"
                          onClick={() => setSearchQuery("")}
                          className='gap-2'
                        >
                          Clear Search
                        </Button>
                    ) : (
                        <Button
                          onClick={() => router.push("/dashboard/create")}
                          className='gap-2'
                        >
                          <Plus className='h-4 w-4'/>
                          Create Your First Image
                        </Button>
                    )}
                  </CardContent>
                </Card>
            ) : (
                <div className='space-y-4'>
                  {filteredProjects.map((project) => (
                      <Card
                        key={project.id}
                        className='group transition-all hover:shadow-md'
                      >
                        <CardContent className='flex items-center gap-4 p-4'>
                          <div className='relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-br from-purple-500/10 to-pink-500/10'>
                            <Image
                              src={`/api/images/${project.s3Key}`}
                              alt={project.prompt}
                              fill
                              unoptimized
                              className='object-contain'
                            />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <ExpandableText
                              text={project.prompt}
                              className='text-muted-foreground text-sm'
                              collapsedLines={2}
                            />
                            <div className='text-muted-foreground flex items-center gap-4 text-sm'>
                              <div className='flex items-center gap-1'>
                                <Calendar className='h-3 w-3'/>
                                {new Date(project.createdAt).toLocaleDateString()}
                              </div>
                              <div className='flex items-center gap-1'>
                                <ImageIcon className='h-3 w-3'/>
                                {project.width}x{project.height}
                              </div>
                            </div>
                          </div>
                          <div className='flex flex-shrink-0 items-center gap-2'>
                            <Button
                                variant="ghost"
                                size='sm'
                                aria-label="Open image"
                                className='h-8 w-8 p-0'
                                onClick={() => setLightboxImage(project)}
                            >
                              <Expand className='h-4 w-4'/>
                            </Button>
                            <Button
                              variant="ghost"
                              size='sm'
                              aria-label="Download image"
                              className='h-8 w-8 p-0'
                              onClick={(e) => handleDownload(project, e)}
                            >
                              <Download className='h-4 w-4'/>
                            </Button>
                            <Button
                                variant="ghost"
                                size='sm'
                                aria-label="Delete image"
                                className='text-destructive h-8 w-8 p-0 hover:text-destructive'
                                onClick={(e) => handleDelete(project.id, e)}
                            >
                              <Trash2 className='h-4 w-4'/>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                  ))}
                </div>
            )}

            {/*Cursor-based Pagination*/}
            <Pagination
              hasNext={hasNext}
              hasPrev={hasPrev}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          </div>
        </SignedIn>
      </>
  );
}