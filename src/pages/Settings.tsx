import { useEffect, useState } from "react";
import { Eye, EyeOff, Check, Download, Brain } from "lucide-react";
import Nav from "../components/studio/Nav";
import { getLearningSummary, exportLearningSummary, getLearningInsights } from "../lib/posts";

interface BrandConfig {
  product?: {
    name?: string;
    launch_price?: number;
    monthly_price?: number;
    delivery_days?: number;
  };
  campaigns?: Array<{
    name?: string;
    active?: boolean;
    pillars?: Array<{ name: string; weight: number }>;
  }>;
}

export default function Settings() {
  const [anthropicKey, setAnthropicKey] = useState("");
  const [resendKey, setResendKey] = useState("");
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showResendKey, setShowResendKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [brandConfig, setBrandConfig] = useState<BrandConfig | null>(() => {
    try {
      const raw = localStorage.getItem("veepo_brand_config");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (brandConfig) return;
    fetch("/brands/veepo.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          localStorage.setItem("veepo_brand_config", JSON.stringify(data));
          setBrandConfig(data);
        }
      })
      .catch(() => undefined);
  }, [brandConfig]);

  const handleSave = () => {
    // In Vercel/browser context, show instructions since we can't write .env
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const activeCampaign = brandConfig?.campaigns?.find((c) => c.active);

  return (
    <div className="min-h-screen bg-slate-900 pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-white tracking-tight">
            Veepo Content Studio
          </span>
          <Nav />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* API Keys */}
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="text-sm font-semibold text-white mb-1">API Configuration</h2>
          <p className="text-xs text-slate-500 mb-5">
            These keys are used by <code className="bg-slate-700 px-1 rounded">generator.py</code>.
            Add them to your <code className="bg-slate-700 px-1 rounded">.env</code> file in the project root.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1.5">
                Anthropic API Key
              </label>
              <div className="flex gap-2">
                <input
                  type={showAnthropicKey ? "text" : "password"}
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                  className="px-3 py-2 bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                >
                  {showAnthropicKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1.5">
                Resend API Key
              </label>
              <div className="flex gap-2">
                <input
                  type={showResendKey ? "text" : "password"}
                  value={resendKey}
                  onChange={(e) => setResendKey(e.target.value)}
                  placeholder="re_..."
                  className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => setShowResendKey(!showResendKey)}
                  className="px-3 py-2 bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                >
                  {showResendKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded p-3 text-xs text-slate-400">
              <p className="font-medium text-slate-300 mb-1">To apply these keys:</p>
              <p>Open <code className="text-blue-400">.env</code> in your project root and set:</p>
              <pre className="mt-1 text-slate-500 font-mono">{`ANTHROPIC_API_KEY=${anthropicKey || "sk-ant-..."}\nRESEND_API_KEY=${resendKey || "re_..."}`}</pre>
            </div>

            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium transition-colors ${
                saved
                  ? "bg-emerald-600 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
            >
              {saved && <Check size={14} />}
              {saved ? "Instructions shown above" : "Save Keys"}
            </button>
          </div>
        </section>

        {/* Campaign Config */}
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="text-sm font-semibold text-white mb-1">Campaign Configuration</h2>
          <p className="text-xs text-slate-500 mb-5">
            Read from <code className="bg-slate-700 px-1 rounded">brands/veepo.json</code>.
            To edit, modify that file directly.
          </p>

          {brandConfig ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/60 rounded p-3">
                  <p className="text-xs text-slate-500 mb-1">Product</p>
                  <p className="text-sm text-slate-200 font-medium">
                    {brandConfig.product?.name ?? "—"}
                  </p>
                </div>
                <div className="bg-slate-900/60 rounded p-3">
                  <p className="text-xs text-slate-500 mb-1">Launch price</p>
                  <p className="text-sm text-slate-200 font-medium">
                    ${brandConfig.product?.launch_price ?? "—"}
                  </p>
                </div>
                <div className="bg-slate-900/60 rounded p-3">
                  <p className="text-xs text-slate-500 mb-1">Monthly</p>
                  <p className="text-sm text-slate-200 font-medium">
                    ${brandConfig.product?.monthly_price ?? "—"}/mo
                  </p>
                </div>
                <div className="bg-slate-900/60 rounded p-3">
                  <p className="text-xs text-slate-500 mb-1">Delivery</p>
                  <p className="text-sm text-slate-200 font-medium">
                    {brandConfig.product?.delivery_days ?? "—"} days
                  </p>
                </div>
              </div>

              {activeCampaign && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">
                    Active campaign: <span className="text-slate-300">{activeCampaign.name}</span>
                  </p>
                  <div className="space-y-2">
                    {activeCampaign.pillars?.map((p) => (
                      <div key={p.name} className="flex items-center gap-3">
                        <span className="w-24 text-xs text-slate-400">{p.name}</span>
                        <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-blue-500"
                            style={{ width: `${Math.round(p.weight * 100)}%` }}
                          />
                        </div>
                        <span className="w-10 text-xs text-slate-400 text-right">
                          {Math.round(p.weight * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-500 bg-slate-900/40 rounded p-4">
              Brand config not loaded. Run{" "}
              <code className="text-blue-400">python generator.py</code> once
              to initialize, then reload this page.
            </div>
          )}
        </section>

        {/* Learning Summary export */}
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-1.5">
            <Brain size={14} className="text-blue-400" />
            Generator Learning
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            As you select posts, the system builds a <code className="bg-slate-700 px-1 rounded">learning_summary.json</code> that
            biases the Python generator toward what you actually pick. Export it and place it in{" "}
            <code className="bg-slate-700 px-1 rounded">data/</code> so the generator reads it on the next run.
          </p>
          {(() => {
            const summary = getLearningSummary();
            const insights = getLearningInsights();
            if (!summary) {
              return (
                <p className="text-xs text-slate-600 bg-slate-900/40 rounded p-3">
                  Not enough data yet — select at least 5 posts to activate learning.
                  ({insights.total_selections}/5 so far)
                </p>
              );
            }
            return (
              <div className="space-y-3">
                <div className="bg-slate-900/60 rounded p-3 text-xs font-mono text-slate-400 space-y-1">
                  <p>Generated: {new Date(summary.generated_at).toLocaleDateString()}</p>
                  <p>Based on: {summary.total_selections} selections</p>
                  <p>Top niches: {summary.top_niches.join(", ")}</p>
                  <p>Best hook pattern: {summary.best_hook_pattern ?? "—"}</p>
                </div>
                <button
                  onClick={exportLearningSummary}
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
                >
                  <Download size={13} />
                  Export learning_summary.json
                </button>
                <p className="text-xs text-slate-600">
                  After exporting, move the file to <code>data/learning_summary.json</code> — generator reads it automatically on next run.
                </p>
              </div>
            );
          })()}
        </section>

        {/* System info */}
        <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
          <h2 className="text-sm font-semibold text-slate-400 mb-3">System</h2>
          <div className="space-y-2 text-xs text-slate-500 font-mono">
            <p>generator.py → Claude claude-sonnet-4-6 → data/posts.json → email</p>
            <p>Task Scheduler → run.bat → python generator.py (8:00 AM MST daily)</p>
            <p>Persona: Portfolio-to-Passport Photographer</p>
            <p>Pillars: PROOF · PAIN · EDUCATION · PROCESS · OFFER</p>
          </div>
        </section>
      </main>
    </div>
  );
}
