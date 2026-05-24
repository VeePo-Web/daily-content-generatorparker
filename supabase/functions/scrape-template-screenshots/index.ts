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

  // 1. Fetch rendered HTML + links via Firecrawl (these sites are SPAs)
  let html = "";
  let fcLinks: string[] = [];
  try {
    const r = await fetch(`${FC}/scrape`, {
      method: "POST",
      headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        url: baseUrl,
        formats: ["html", "links"],
        onlyMainContent: false,
        waitFor: 2500,
      }),
    });
    const j = await r.json();
    if (r.ok) {
      html = j.data?.html || j.html || "";
      fcLinks = j.data?.links || j.links || [];
    } else {
      console.warn("rendered html fetch failed", r.status, JSON.stringify(j).slice(0, 200));
    }
  } catch (e) {
    console.warn("rendered fetch failed", (e as Error).message);
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

  // 2. Map + the rendered-link list discover sub-routes
  let mapped: string[] = [];
  try { mapped = await fcMap(baseUrl); } catch (e) { console.warn("map failed", (e as Error).message); }
  const allRouteCandidates = Array.from(new Set([...mapped, ...fcLinks]));
  for (const u of allRouteCandidates) {
      try {
        const parsed = new URL(u);
        if (parsed.origin !== baseOrigin) continue;
        // anchor-only links on the home page
        if (parsed.hash && (parsed.pathname === "" || parsed.pathname === "/")) {
          const id = parsed.hash.slice(1);
          if (!id || ["root", "app", "__next"].includes(id)) continue;
          const label = id.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const key = `anchor:${label}`;
          if (!sections.has(key)) sections.set(key, { label, url: baseUrl, anchor: id });
          continue;
        }
        const path = parsed.pathname.replace(/\/$/, "");
        if (path === "" || path === "/") continue;
        const label = path.split("/").filter(Boolean).join("-").toLowerCase();
        const key = `route:${label}`;
        if (!sections.has(key)) sections.set(key, { label, url: `${parsed.origin}${parsed.pathname}`, anchor: null });
      } catch { /* ignore */ }
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

    // Run discovery + screenshotting entirely in the background
    type Job = { section: Section; mobile: boolean; fullPage: boolean };
    const state = { plan: [] as Job[], cursor: 0, rows: [] as any[] };

    async function worker() {
      while (true) {
        const i = state.cursor++;
        if (i >= state.plan.length) return;
        const job = state.plan[i];
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
        state.rows.push({
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

    const CONCURRENCY = 5;
    const work = (async () => {
      const sections = await discoverSections(base_url);
      console.log(`Discovered ${sections.length} sections for ${base_url}:`, sections.map((s) => s.label));
      for (const section of sections) {
        for (const mobile of [false, true]) {
          state.plan.push({ section, mobile, fullPage: true });
          state.plan.push({ section, mobile, fullPage: false });
        }
      }
      console.log(`Planned ${state.plan.length} shots`);
      await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
      for (let i = 0; i < state.rows.length; i += 50) {
        const chunk = state.rows.slice(i, i + 50);
        const { error } = await sb.from("template_assets").insert(chunk);
        if (error) console.warn("insert error", error.message);
      }
      console.log(`DONE ${product.name}: saved ${state.rows.length}/${state.plan.length}`);
    })();
    // @ts-ignore EdgeRuntime is available in supabase edge runtime
    if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(work);

    return new Response(JSON.stringify({
      product: product.name,
      base_url,
      status: "running_in_background",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("scrape-template-screenshots error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
