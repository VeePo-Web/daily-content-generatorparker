import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEmailTypoDetection } from "@/hooks/useEmailTypoDetection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import EmailTypoSuggestion from "@/components/ui/EmailTypoSuggestion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Instagram, Youtube } from "lucide-react";
import { DrawCheckIcon } from "@/components/ui/draw-check-icon";

const formSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  location: z.string().optional(),
  instagram_handle: z.string().optional(),
  tiktok_handle: z.string().optional(),
  youtube_handle: z.string().optional(),
  twitter_handle: z.string().optional(),
  follower_count_range: z.string().min(1, "Please select your follower range"),
  content_types: z.array(z.string()).min(1, "Please select at least one content type"),
  why_represent: z.string().min(150, "Please write at least 150 characters"),
  faith_in_content: z.string().min(100, "Please write at least 100 characters"),
  content_frequency: z.string().min(1, "Please select your content frequency"),
  agreed_to_terms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
});

type FormData = z.infer<typeof formSchema>;

const contentTypeOptions = [
  { value: "photos", label: "Photos" },
  { value: "videos", label: "Videos" },
  { value: "reels", label: "Reels/TikToks" },
  { value: "stories", label: "Stories" },
  { value: "youtube", label: "YouTube Videos" },
  { value: "blog", label: "Blog Posts" },
];

const followerRanges = [
  { value: "1k-5k", label: "1K - 5K" },
  { value: "5k-10k", label: "5K - 10K" },
  { value: "10k-25k", label: "10K - 25K" },
  { value: "25k-50k", label: "25K - 50K" },
  { value: "50k-100k", label: "50K - 100K" },
  { value: "100k+", label: "100K+" },
];

const frequencyOptions = [
  { value: "weekly", label: "Weekly content" },
  { value: "biweekly", label: "Bi-weekly content" },
  { value: "monthly", label: "Monthly content" },
  { value: "per-drop", label: "Per collection drop" },
];

const AmbassadorForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      location: "",
      instagram_handle: "",
      tiktok_handle: "",
      youtube_handle: "",
      twitter_handle: "",
      follower_count_range: "",
      content_types: [],
      why_represent: "",
      faith_in_content: "",
      content_frequency: "",
      agreed_to_terms: false,
    },
  });

  const emailValue = form.watch('email');

  const emailTypo = useEmailTypoDetection({
    initialEmail: emailValue || '',
    onSuggestionAccepted: (correctedEmail) => form.setValue('email', correctedEmail),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("ambassador_applications").insert({
        full_name: data.full_name,
        email: data.email,
        location: data.location || null,
        instagram_handle: data.instagram_handle || null,
        tiktok_handle: data.tiktok_handle || null,
        youtube_handle: data.youtube_handle || null,
        twitter_handle: data.twitter_handle || null,
        follower_count_range: data.follower_count_range,
        content_types: data.content_types,
        why_represent: data.why_represent,
        faith_in_content: data.faith_in_content,
        content_frequency: data.content_frequency,
        agreed_to_terms: data.agreed_to_terms,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Application Submitted",
        description: "We'll review your application and get back to you soon.",
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-foreground text-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <DrawCheckIcon size="xl" variant="circle-check" className="text-accent mx-auto mb-8" delay={200} />
          <h2 className="text-section text-background mb-6">
            APPLICATION RECEIVED.
          </h2>
          <p className="text-editorial text-background/70 mb-4">
            You took the first step. We see you.
          </p>
          <p className="text-sm text-background/50">
            We review every application personally. If you're the right fit,
            you'll hear from us within 7 days.
          </p>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-foreground text-background hero-noise">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-20"
        >
          <span className="text-eyebrow text-background/50 block mb-4">
            The application
          </span>
          <h2 className="text-section text-background mb-6">
            READY TO REPRESENT?
          </h2>
          <p className="text-editorial text-background/60">
            Take your time. Be honest. We want to know the real you.
          </p>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-16">
            {/* Section 01: Personal Info */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-[60px] font-extralight tracking-[-0.02em] leading-none text-background/10">
                  01
                </span>
                <h3 className="text-lg font-light text-background">About You</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-background/60 text-xs tracking-wide uppercase">
                        Full Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-transparent border-0 border-b border-background/20 rounded-none px-0 text-background placeholder:text-background/30 focus-visible:ring-0 focus-visible:border-accent"
                          placeholder="Your name"
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-background/60 text-xs tracking-wide uppercase">
                        Email *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          className="bg-transparent border-0 border-b border-background/20 rounded-none px-0 text-background placeholder:text-background/30 focus-visible:ring-0 focus-visible:border-accent"
                          placeholder="you@email.com"
                          onChange={(e) => {
                            field.onChange(e);
                            emailTypo.setEmail(e.target.value);
                          }}
                          onBlur={() => emailTypo.checkForTypos(emailValue)}
                        />
                      </FormControl>
                      <EmailTypoSuggestion
                        suggestion={emailTypo.suggestion || ''}
                        show={emailTypo.showSuggestion}
                        onAccept={emailTypo.acceptSuggestion}
                        onDismiss={emailTypo.dismissSuggestion}
                        variant="compact"
                      />
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-background/60 text-xs tracking-wide uppercase">
                        City / Country
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-transparent border-0 border-b border-background/20 rounded-none px-0 text-background placeholder:text-background/30 focus-visible:ring-0 focus-visible:border-accent"
                          placeholder="Where are you based?"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </motion.div>

            {/* Section 02: Social Media */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-[60px] font-extralight tracking-[-0.02em] leading-none text-background/10">
                  02
                </span>
                <h3 className="text-lg font-light text-background">Your Platform</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="instagram_handle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-background/60 text-xs tracking-wide uppercase flex items-center gap-2">
                        <Instagram className="w-3 h-3" /> Instagram
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-transparent border-0 border-b border-background/20 rounded-none px-0 text-background placeholder:text-background/30 focus-visible:ring-0 focus-visible:border-accent"
                          placeholder="@yourhandle"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tiktok_handle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-background/60 text-xs tracking-wide uppercase">
                        TikTok
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-transparent border-0 border-b border-background/20 rounded-none px-0 text-background placeholder:text-background/30 focus-visible:ring-0 focus-visible:border-accent"
                          placeholder="@yourhandle"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="youtube_handle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-background/60 text-xs tracking-wide uppercase flex items-center gap-2">
                        <Youtube className="w-3 h-3" /> YouTube
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-transparent border-0 border-b border-background/20 rounded-none px-0 text-background placeholder:text-background/30 focus-visible:ring-0 focus-visible:border-accent"
                          placeholder="Channel URL or @handle"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitter_handle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-background/60 text-xs tracking-wide uppercase">
                        X (Twitter)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-transparent border-0 border-b border-background/20 rounded-none px-0 text-background placeholder:text-background/30 focus-visible:ring-0 focus-visible:border-accent"
                          placeholder="@yourhandle"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="follower_count_range"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-background/60 text-xs tracking-wide uppercase">
                        Combined Follower Count *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-0 border-b border-background/20 rounded-none px-0 text-background focus:ring-0">
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {followerRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content_frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-background/60 text-xs tracking-wide uppercase">
                        Content Commitment *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-0 border-b border-background/20 rounded-none px-0 text-background focus:ring-0">
                            <SelectValue placeholder="How often can you post?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {frequencyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Content Types */}
              <FormField
                control={form.control}
                name="content_types"
                render={() => (
                  <FormItem className="mt-8">
                    <FormLabel className="text-background/60 text-xs tracking-wide uppercase block mb-4">
                      Content You Create *
                    </FormLabel>
                    <div className="flex flex-wrap gap-3">
                      {contentTypeOptions.map((option) => (
                        <FormField
                          key={option.value}
                          control={form.control}
                          name="content_types"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, option.value])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== option.value)
                                        );
                                  }}
                                  className="border-background/30 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-light text-background/70 cursor-pointer">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage className="text-destructive mt-2" />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Section 03: Essay Questions */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-[60px] font-extralight tracking-[-0.02em] leading-none text-background/10">
                  03
                </span>
                <h3 className="text-lg font-light text-background">Your Story</h3>
              </div>

              <div className="space-y-8">
                <FormField
                  control={form.control}
                  name="why_represent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-background/60 text-xs tracking-wide uppercase block mb-3">
                        Why do you want to represent Line of Judah? *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-transparent border border-background/20 rounded-none text-background placeholder:text-background/30 focus-visible:ring-0 focus-visible:border-accent min-h-[150px] resize-none"
                          placeholder="Tell us your story. What draws you to this mission? (Min 150 characters)"
                        />
                      </FormControl>
                      <div className="flex justify-between mt-2">
                        <FormMessage className="text-destructive" />
                        <span className="text-xs text-background/40">
                          {field.value?.length || 0}/150 min
                        </span>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="faith_in_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-background/60 text-xs tracking-wide uppercase block mb-3">
                        How does your faith show up in your content? *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-transparent border border-background/20 rounded-none text-background placeholder:text-background/30 focus-visible:ring-0 focus-visible:border-accent min-h-[150px] resize-none"
                          placeholder="We want to see how you naturally integrate faith into what you create. (Min 100 characters)"
                        />
                      </FormControl>
                      <div className="flex justify-between mt-2">
                        <FormMessage className="text-destructive" />
                        <span className="text-xs text-background/40">
                          {field.value?.length || 0}/100 min
                        </span>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </motion.div>

            {/* Section 04: Agreement & Submit */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-[60px] font-extralight tracking-[-0.02em] leading-none text-background/10">
                  04
                </span>
                <h3 className="text-lg font-light text-background">Final Step</h3>
              </div>

              <FormField
                control={form.control}
                name="agreed_to_terms"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0 mb-10">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-background/30 data-[state=checked]:bg-accent data-[state=checked]:border-accent mt-1"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-light text-background/70 leading-relaxed cursor-pointer">
                      I understand that being an ambassador means representing Line of Judah with
                      integrity. I commit to creating authentic content that aligns with the
                      brand's mission and values. *
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground px-12 py-6 text-sm tracking-[0.2em] uppercase font-medium group"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    Apply to the Tribe
                    <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </div>
    </section>
  );
};

export default AmbassadorForm;
