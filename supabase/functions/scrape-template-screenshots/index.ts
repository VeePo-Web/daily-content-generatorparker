import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY")!;
const BUCKET = "template-screenshots";
const FC = "https://api.firecrawl.dev/v2";

type Section = { label: string; url: string; anchor: string | null };

async function fcMap(url: string): Promise<string[]> {
  const r = await fetch(`${FC}/map`, {
    method: "POST",
    headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, limit: 30, includeSubdomains: false }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`firecrawl map ${r.status}: ${JSON.stringify(j)}`);
  const links: any[] = j.links || j.data?.links || [];
  return links.map((l: any) => (typeof l === "string" ? l : l.url)).filter(Boolean);
}

// Enumerate logical sections of the site by parsing the home page HTML for
// nav anchors + section ids, then merging with sub-routes from /map.
async function discoverSections(baseUrl: string): Promise<Section[]> {
  const sections = new Map<string, Section>();
  const baseOrigin = new URL(baseUrl).origin;

  // home
  sections.set("home", { label: "home", url: baseUrl, anchor: null });

  // 1. Fetch raw HTML of home page
  let html = "";
  try {
    const r = await fetch(baseUrl, { headers: { "User-Agent": "Mozilla/5.0 LovableBot" } });
    if (r.ok) html = await r.text();
  } catch (e) {
    console.warn("home fetch failed", (e as Error).message);
  }

  if (html) {
    // collect all id="..." on section/div/main/header/footer elements
    const idRe = /<(?:section|div|main|header|footer|article)\b[^>]*\bid=["']([a-zA-Z][\w-]{1,40})["']/gi;
    let m: RegExpExecArray | null;
    const ids = new Set<string>();
    while ((m = idRe.exec(html))) ids.add(m[1]);

    // collect anchor hrefs (#foo) from <a>
    const aRe = /<a\b[^>]*\bhref=["']#([a-zA-Z][\w-]{1,40})["']/gi;
    while ((m = aRe.exec(html))) ids.add(m[1]);

    for (const id of ids) {
      if (["root", "app", "__next"].includes(id)) continue;
      const label = id.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const key = `anchor:${label}`;
      if (!sections.has(key)) sections.set(key, { label, url: baseUrl, anchor: id });
    }
  }

  // 2. Map discovers sub-routes
  try {
    const mapped = await fcMap(baseUrl);
    for (const u of mapped) {
      try {
        const parsed = new URL(u);
        if (parsed.origin !== baseOrigin) continue;
        const path = parsed.pathname.replace(/\/$/, "");
        if (path === "" || path === "/") continue;
        const label = path.split("/").filter(Boolean).join("-").toLowerCase();
        const key = `route:${label}`;
        if (!sections.has(key)) sections.set(key, { label, url: parsed.toString(), anchor: null });
      } catch { /* ignore */ }
    }
  } catch (e) {
    console.warn("map failed", (e as Error).message);
  }

  return [...sections.values()];
}

async function fcScreenshot(opts: {
  url: string;
  mobile: boolean;
  fullPage: boolean;
  anchor?: string | null;
}): Promise<string | null> {
  const body: any = {
    url: opts.anchor ? `${opts.url}#${opts.anchor}` : opts.url,
    formats: [{
      type: "screenshot",
      fullPage: opts.fullPage,
      viewport: opts.mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    }],
    onlyMainContent: false,
    waitFor: 2000,
    blockAds: true,
  };
  // For focused viewport, scroll the anchor into view before snapping.
  if (!opts.fullPage && opts.anchor) {
    body.actions = [
      { type: "wait", milliseconds: 1200 },
      { type: "scroll", direction: "down", selector: `#${opts.anchor}` },
      { type: "wait", milliseconds: 800 },
    ];
  } else if (!opts.fullPage) {
    body.actions = [{ type: "wait", milliseconds: 1500 }];
  }
  const r = await fetch(`${FC}/scrape`, {
    method: "POST",
    headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) {
    console.warn(`scrape fail ${body.url}`, r.status, JSON.stringify(j).slice(0, 300));
    return null;
  }
  return j.data?.screenshot || j.screenshot || j.data?.screenshotUrl || null;
}

async function downloadAndUpload(
  sb: ReturnType<typeof createClient>,
  imageUrl: string,
  storagePath: string,
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    const { error } = await sb.storage.from(BUCKET).upload(storagePath, buf, {
      contentType: "image/png",
      upsert: true,
    });
    if (error) {
      console.warn("upload error", error.message);
      return null;
    }
    const { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
  } catch (e) {
    console.warn("dl/up error", (e as Error).message);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const { template_product_id, base_url, wipe_storage = false } = await req.json();
    if (!template_product_id || !base_url) throw new Error("template_product_id + base_url required");

    const { data: product } = await sb.from("template_products").select("*").eq("id", template_product_id).maybeSingle();
    if (!product) throw new Error("product not found");
    const slug = product.vertical || "template";

    if (wipe_storage) {
      const { data: existing } = await sb.storage.from(BUCKET).list(slug, { limit: 1000 });
      if (existing?.length) {
        await sb.storage.from(BUCKET).remove(existing.map((f: any) => `${slug}/${f.name}`));
      }
      await sb.from("template_assets").delete().eq("template_product_id", template_product_id);
    }

    // 1. Enumerate logical sections
    const sections = await discoverSections(base_url);
    console.log(`Discovered ${sections.length} sections for ${base_url}:`, sections.map((s) => s.label));

    // 2. Build shot plan: per section × 2 viewports × 2 shot-types
    type Job = { section: Section; mobile: boolean; fullPage: boolean };
    const plan: Job[] = [];
    for (const section of sections) {
      for (const mobile of [false, true]) {
        plan.push({ section, mobile, fullPage: true });
        plan.push({ section, mobile, fullPage: false });
      }
    }
    console.log(`Planned ${plan.length} shots`);

    // 3. Execute with limited parallelism in background
    const CONCURRENCY = 5;
    let cursor = 0;
    const rows: any[] = [];

    async function worker() {
      while (true) {
        const i = cursor++;
        if (i >= plan.length) return;
        const job = plan[i];
        const kind = job.fullPage ? "full" : "focus";
        const vp = job.mobile ? "mobile" : "desktop";
        const shotUrl = await fcScreenshot({
          url: job.section.url,
          mobile: job.mobile,
          fullPage: job.fullPage,
          anchor: job.section.anchor,
        });
        if (!shotUrl) continue;
        const id = crypto.randomUUID();
        const path = `${slug}/${id}.png`;
        const publicUrl = await downloadAndUpload(sb, shotUrl, path);
        if (!publicUrl) continue;
        rows.push({
          template_product_id,
          asset_type: "gallery",
          storage_path: path,
          public_url: publicUrl,
          caption: `${job.section.label} — ${vp} — ${kind}`,
          tags: [job.section.label, vp, kind, "template-screenshot"],
          orientation: (job.mobile || job.fullPage) ? "portrait" : "landscape",
          do_not_use: false,
          use_count: 0,
        });
      }
    }

    const work = (async () => {
      await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
      for (let i = 0; i < rows.length; i += 50) {
        const chunk = rows.slice(i, i + 50);
        const { error } = await sb.from("template_assets").insert(chunk);
        if (error) console.warn("insert error", error.message);
      }
      console.log(`DONE ${product.name}: saved ${rows.length}/${plan.length}`);
    })();
    // @ts-ignore EdgeRuntime is available in supabase edge runtime
    if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(work);

    return new Response(JSON.stringify({
      product: product.name,
      base_url,
      sections: sections.map((s) => ({ label: s.label, url: s.url, anchor: s.anchor })),
      planned: plan.length,
      status: "running_in_background",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("scrape-template-screenshots error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function fcMap(url: string): Promise<string[]> {
  const r = await fetch(`${FC}/map`, {
    method: "POST",
    headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, limit: 30, includeSubdomains: false }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`firecrawl map ${r.status}: ${JSON.stringify(j)}`);
  const links: any[] = j.links || j.data?.links || [];
  return links.map((l: any) => (typeof l === "string" ? l : l.url)).filter(Boolean);
}

type Shot = { url: string; viewport: "desktop" | "mobile"; kind: string };

async function fcScreenshot(opts: {
  url: string;
  mobile: boolean;
  fullPage: boolean;
  scrollY?: number;
}): Promise<string | null> {
  const body: any = {
    url: opts.url,
    formats: [{ type: "screenshot", fullPage: opts.fullPage, viewport: opts.mobile
      ? { width: 390, height: 844 }
      : { width: 1440, height: 900 } }],
    onlyMainContent: false,
    waitFor: 2000,
    blockAds: true,
  };
  if (opts.scrollY && opts.scrollY > 0) {
    body.actions = [
      { type: "wait", milliseconds: 800 },
      { type: "scroll", direction: "down", amount: opts.scrollY },
      { type: "wait", milliseconds: 600 },
    ];
  }
  const r = await fetch(`${FC}/scrape`, {
    method: "POST",
    headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) {
    console.warn(`scrape fail ${opts.url}`, r.status, JSON.stringify(j).slice(0, 300));
    return null;
  }
  // v2 returns { data: { screenshot: "https://..." } }
  const shot = j.data?.screenshot || j.screenshot || j.data?.screenshotUrl;
  return shot || null;
}

async function downloadAndUpload(
  sb: ReturnType<typeof createClient>,
  imageUrl: string,
  storagePath: string,
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    const { error } = await sb.storage.from(BUCKET).upload(storagePath, buf, {
      contentType: "image/png",
      upsert: true,
    });
    if (error) {
      console.warn("upload error", error.message);
      return null;
    }
    const { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
  } catch (e) {
    console.warn("dl/up error", (e as Error).message);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const { template_product_id, base_url, target = 100, wipe_storage = false } = await req.json();
    if (!template_product_id || !base_url) throw new Error("template_product_id + base_url required");

    const { data: product } = await sb.from("template_products").select("*").eq("id", template_product_id).maybeSingle();
    if (!product) throw new Error("product not found");
    const slug = product.vertical || "template";

    // Optional storage wipe for this product's folder
    if (wipe_storage) {
      const { data: existing } = await sb.storage.from(BUCKET).list(slug, { limit: 1000 });
      if (existing?.length) {
        await sb.storage.from(BUCKET).remove(existing.map((f: any) => `${slug}/${f.name}`));
      }
    }

    // 1. Discover routes
    let urls = await fcMap(base_url);
    if (!urls.length) urls = [base_url];
    // Always include base_url first, dedupe, cap
    urls = Array.from(new Set([base_url, ...urls])).slice(0, 12);
    console.log(`Discovered ${urls.length} URLs for ${base_url}`);

    // 2. Build shot plan. Many of these sites are single-page, so for each URL
    // we capture both viewports across many scroll positions to fill the quota.
    const DESKTOP_SCROLLS = Array.from({ length: 25 }, (_, i) => i * 700); // 0..16800
    const MOBILE_SCROLLS = Array.from({ length: 25 }, (_, i) => i * 650);  // 0..15600
    const plan: Array<{ url: string; mobile: boolean; fullPage: boolean; scrollY: number; tag: string }> = [];
    for (const url of urls) {
      for (const mobile of [false, true]) {
        plan.push({ url, mobile, fullPage: true, scrollY: 0, tag: mobile ? "mobile-full" : "desktop-full" });
        const scrolls = mobile ? MOBILE_SCROLLS : DESKTOP_SCROLLS;
        for (const s of scrolls) {
          plan.push({ url, mobile, fullPage: false, scrollY: s, tag: mobile ? `mobile-vp-${s}` : `desktop-vp-${s}` });
        }
      }
    }

    // 3. Execute up to `target` shots, with limited parallelism
    const CONCURRENCY = 6;
    const results: Shot[] = [];
    const rows: any[] = [];
    let cursor = 0;
    const limit = Math.min(target, plan.length);

    async function worker() {
      while (true) {
        const i = cursor++;
        if (i >= limit) return;
        const job = plan[i];
        const shotUrl = await fcScreenshot(job);
        if (!shotUrl) continue;
        const id = crypto.randomUUID();
        const path = `${slug}/${id}.png`;
        const publicUrl = await downloadAndUpload(sb, shotUrl, path);
        if (!publicUrl) continue;
        rows.push({
          template_product_id,
          asset_type: "gallery",
          storage_path: path,
          public_url: publicUrl,
          caption: `${job.tag} — ${job.url}`,
          tags: [job.tag, job.mobile ? "mobile" : "desktop", "template-screenshot"],
          orientation: job.mobile ? "portrait" : "landscape",
          do_not_use: false,
          use_count: 0,
        });
        results.push({ url: job.url, viewport: job.mobile ? "mobile" : "desktop", kind: job.tag });
      }
    }
    // Run in background so the HTTP request returns immediately.
    const work = (async () => {
      await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
      if (rows.length) {
        for (let i = 0; i < rows.length; i += 50) {
          const chunk = rows.slice(i, i + 50);
          const { error } = await sb.from("template_assets").insert(chunk);
          if (error) console.warn("insert error", error.message);
        }
      }
      console.log(`DONE ${product.name}: saved ${rows.length}/${limit}`);
    })();
    // @ts-ignore EdgeRuntime is available in supabase edge runtime
    if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(work);

    return new Response(JSON.stringify({
      product: product.name,
      base_url,
      discovered_urls: urls.length,
      planned: limit,
      status: "running_in_background",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("scrape-template-screenshots error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});