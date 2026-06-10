/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Rocket,
  Users,
  Mail,
  CheckCircle,
  MapPin,
  Briefcase,
  Target,
  ArrowRight,
  ArrowLeft,
  Wand2,
  ListFilter,
  Sparkles,
  BarChart2,
} from "lucide-react"
import { useAgent } from "@/components/user-dashboard/AgentContext"

export default function QuickCampaignWizard() {
  const router = useRouter()
  const { selectedAgent } = useAgent()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [polling, setPolling] = useState(false)
  const [liveLeads, setLiveLeads] = useState<any[]>([])
  const [stats, setStats] = useState<{
    generated: number
    valid: number
  } | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    niche: "",
    audience: "",
    location: "",
    leadCount: 100,
    subjectA: "",
    contentA: "",
  })

  const updateForm = (
    key: keyof typeof formData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const pollStatus = async (
    runId: string,
    listId: string,
    campaignIds: string
  ) => {
    setPolling(true)
    let isPollingActive = true

    const checkStatus = async () => {
      if (!isPollingActive) return
      try {
        const res = await fetch(
          `/api/campaigns/status?runId=${runId}&listId=${listId}&campaignIds=${campaignIds}`
        )
        const data = await res.json()

        if (data.status === "SUCCEEDED") {
          isPollingActive = false
          setStats({
            generated: data.stats?.totalGenerated ?? 0,
            valid: data.stats?.validVerified ?? 0,
          })
          setPolling(false)
          setLoading(false)
          setStep(4)
        } else if (
          data.status === "FAILED" ||
          data.status === "TIMED-OUT" ||
          data.status === "ABORTED" ||
          data.error
        ) {
          isPollingActive = false
          toast.error(data.error || "Scraping failed.")
          setPolling(false)
          setLoading(false)
        } else {
          // Still running, update live leads if available
          if (data.liveLeads && data.liveLeads.length > 0) {
            setLiveLeads(data.liveLeads)
          }
          if (isPollingActive) {
            setTimeout(checkStatus, 3000)
          }
        }
      } catch (err) {
        isPollingActive = false
        setPolling(false)
        setLoading(false)
        toast.error("Error checking status.")
      }
    }

    checkStatus()
  }

  const handleLaunch = async () => {
    if (!formData.niche || !formData.audience || !formData.location) {
      toast.error(
        "Please fill in Niche, Audience, and Location before launching."
      )
      setStep(1)
      return
    }
    if (!formData.subjectA || !formData.contentA) {
      toast.error("Please fill in at least Subject A and Content A.")
      setStep(2)
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/campaigns/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to launch campaign")
        setLoading(false)
        return
      }

      toast.success("Scraping started! This may take a few minutes.")
      setStep(3) // Go to step 3 immediately so live leads panel is visible
      pollStatus(data.runId, data.listId, data.campaignIds.join(","))
    } catch (err) {
      toast.error("Network error — please check your connection and try again.")
      setLoading(false)
    }
  }

  const handleFinish = () => {
    // Refresh server components (dashboard analytics) dynamically
    router.refresh()
    router.push("/user-dashboard/dashboard")
  }

  const handleGenerateAI = async () => {
    if (!formData.niche || !formData.audience || !formData.location) {
      toast.error(
        "Please fill out Niche, Target Audience, and Location in Step 1 first."
      )
      return
    }

    setGeneratingAI(true)
    try {
      const res = await fetch("/api/ai/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: formData.niche,
          audience: formData.audience,
          location: formData.location,
          agentId: selectedAgent?.id,
          agentName: selectedAgent?.name,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to generate AI content.")
        return
      }

      setFormData((prev) => ({
        ...prev,
        subjectA: data.subjectA || prev.subjectA,
        contentA: data.contentA || prev.contentA,
      }))

      toast.success("AI Email generated successfully!")
    } catch (error) {
      toast.error("Network error while generating AI content.")
    } finally {
      setGeneratingAI(false)
    }
  }

  // Dynamic labels based on agent persona
  const agentName = selectedAgent?.name?.toLowerCase() || ""
  const isRealEstate = agentName.includes("real estate")
  const isJob = agentName.includes("job")

  const nicheLabel = isJob
    ? "Target Industry / Role"
    : isRealEstate
      ? "Property Type / Niche"
      : "Your Business / Niche"
  const nichePlaceholder = isJob
    ? "e.g. Tech, Sales, Frontend Developer"
    : isRealEstate
      ? "e.g. Luxury Condos, Commercial"
      : "e.g. B2B SaaS, Web Development"

  const audienceLabel = isJob ? "Who are you contacting?" : "Target Audience"
  const audiencePlaceholder = isJob
    ? "e.g. Hiring Managers, Recruiters"
    : isRealEstate
      ? "e.g. Property Managers, Landlords"
      : "e.g. Marketing Directors, Founders"

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 flex items-center justify-center gap-2 text-3xl font-bold text-gray-900 dark:text-white">
          <Wand2 className="text-blue-600" />
          {selectedAgent
            ? `${selectedAgent.name} Workflow`
            : "Quick Campaign Launcher"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {selectedAgent
            ? selectedAgent.description
            : "Start your automated outreach in seconds. No chatting required."}
        </p>
      </div>

      {/* Progress Tracker */}
      <div className="relative mb-10 flex items-center justify-between">
        <div className="absolute top-1/2 left-0 -z-10 h-1 w-full -translate-y-1/2 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div
          className="absolute top-1/2 left-0 -z-10 h-1 -translate-y-1/2 rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        />

        {[
          { icon: Target, label: "Targeting", id: 1 },
          { icon: Mail, label: "Messaging", id: 2 },
          { icon: CheckCircle, label: "Launch", id: 3 },
          { icon: BarChart2, label: "Results", id: 4 },
        ].map((s) => (
          <div key={s.id} className="relative flex flex-col items-center gap-2">
            <div
              className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                step >= s.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
              }`}
            >
              <s.icon size={20} />
            </div>
            <span
              className={`absolute -bottom-6 text-sm font-medium whitespace-nowrap ${step >= s.id ? "text-gray-900 dark:text-white" : "text-gray-400"}`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Wizard Content */}
      <div className="relative mt-8 min-h-[440px] overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <AnimatePresence mode="wait">
          {/* STEP 1: TARGETING */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="mb-1 text-xl font-semibold">
                  Who are you targeting?
                </h2>
                <p className="text-sm text-gray-500">
                  Define your ideal customer profile and we&#39;ll find them for
                  you.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Briefcase size={16} className="text-gray-400" />
                    {nicheLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={nichePlaceholder}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                    value={formData.niche}
                    onChange={(e) => updateForm("niche", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Users size={16} className="text-gray-400" />
                    {audienceLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={audiencePlaceholder}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                    value={formData.audience}
                    onChange={(e) => updateForm("audience", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <MapPin size={16} className="text-gray-400" />
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                    value={formData.location}
                    onChange={(e) => updateForm("location", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <ListFilter size={16} className="text-gray-400" />
                    Number of Leads
                  </label>
                  <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      step="10"
                      className="w-full accent-blue-600"
                      value={formData.leadCount}
                      onChange={(e) =>
                        updateForm("leadCount", parseInt(e.target.value))
                      }
                    />
                    <span className="min-w-[3rem] text-right font-semibold text-blue-600">
                      {formData.leadCount}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: MESSAGING */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="mb-1 text-xl font-semibold">
                    Craft Your Message
                  </h2>
                  <p className="text-sm text-gray-500">
                    Write your outreach email.
                  </p>
                </div>

                <button
                  onClick={handleGenerateAI}
                  disabled={generatingAI}
                  className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50"
                >
                  {generatingAI ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  {generatingAI ? "Generating..." : "Auto-Generate with AI"}
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Subject line — e.g. Quick idea for [Company]"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                  value={formData.subjectA}
                  onChange={(e) => updateForm("subjectA", e.target.value)}
                />

                <textarea
                  placeholder={`Hi,\n\nI came across your work and wanted to reach out...`}
                  rows={10}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                  value={formData.contentA}
                  onChange={(e) => updateForm("contentA", e.target.value)}
                />
              </div>
            </motion.div>
          )}

          {/* STEP 3: REVIEW & LAUNCH */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`py-6 ${polling ? "grid grid-cols-1 gap-8 text-left md:grid-cols-2" : "space-y-8 text-center"}`}
            >
              <div className="space-y-8">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                  <Wand2 className="h-10 w-10 text-blue-600" />
                </div>

                <div>
                  <h2 className="mb-2 text-2xl font-bold">
                    Ready for Takeoff!
                  </h2>
                  <p className="mx-auto max-w-md text-gray-500">
                    We&rsquo;ll find{" "}
                    <strong className="text-gray-900 dark:text-white">
                      {formData.leadCount}
                    </strong>{" "}
                    highly qualified
                    <strong className="text-gray-900 dark:text-white">
                      {" "}
                      {formData.audience || "leads"}
                    </strong>{" "}
                    in
                    <strong className="text-gray-900 dark:text-white">
                      {" "}
                      {formData.location || "your target area"}
                    </strong>
                    .
                  </p>
                </div>

                <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-6 text-left dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="border-b border-gray-200 pb-2 font-semibold dark:border-gray-700">
                    Campaign Overview
                  </h3>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Agent</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedAgent?.name || "Marketing Agent"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Advanced Scraping</span>
                    <span className="flex items-center gap-1 font-medium text-green-600">
                      <CheckCircle size={14} /> Enabled
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Lead Enrichment</span>
                    <span className="flex items-center gap-1 font-medium text-green-600">
                      <CheckCircle size={14} /> Included
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Personalization</span>
                    <span className="flex items-center gap-1 font-medium text-green-600">
                      <CheckCircle size={14} /> Name + Context
                    </span>
                  </div>
                </div>
              </div>

              {polling && (
                <div className="space-y-8">
                  <h3 className="sticky top-0 mb-4 flex items-center gap-2 py-2 font-semibold">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    Live Leads Discovered ({liveLeads.length})
                  </h3>
                  <div className="h-[380px] overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                    <div className="space-y-3">
                      {liveLeads.map((lead, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900"
                        >
                          <div className="flex items-start justify-between">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {lead.company}
                            </div>
                            {lead.rating && (
                              <div className="flex items-center gap-1 rounded bg-yellow-50 px-1.5 py-0.5 text-xs font-semibold text-yellow-600">
                                ★ {lead.rating}{" "}
                                {lead.reviewCount
                                  ? `(${lead.reviewCount})`
                                  : ""}
                              </div>
                            )}
                          </div>

                          <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-xs text-gray-500 md:grid-cols-2">
                            {lead.email && (
                              <div className="flex items-center gap-1.5 font-medium text-blue-600">
                                <Mail size={12} /> {lead.email}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-1.5">
                                📞 {lead.phone}
                              </div>
                            )}
                            {lead.address && (
                              <div className="col-span-full flex items-center gap-1.5">
                                <MapPin size={12} /> {lead.address}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {liveLeads.length === 0 && (
                        <div className="py-8 text-center text-sm text-gray-500">
                          Navigating Google Maps...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 4: SUCCESS RESULTS */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 py-6 text-center"
            >
              <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
                <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20" />
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>

              <div>
                <h2 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
                  Campaign Live!
                </h2>
                <p className="mx-auto max-w-md text-gray-500">
                  Your automated outreach is now running in the background. Here
                  are your final lead scraping results:
                </p>
              </div>

              <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-4 md:flex-row">
                <div className="w-full flex-1 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-1 text-4xl font-black text-gray-900 dark:text-white">
                    {stats?.generated}
                  </div>
                  <div className="text-sm font-medium tracking-wider text-gray-500 uppercase">
                    Leads Scraped
                  </div>
                </div>

                <div className="w-full flex-1 rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
                  <div className="mb-1 text-4xl font-black text-blue-600">
                    {stats?.valid}
                  </div>
                  <div className="text-sm font-medium tracking-wider text-blue-600/80 uppercase">
                    Valid & Verified
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        {step < 4 ? (
          <button
            onClick={prevStep}
            disabled={step === 1 || loading}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all ${
              step === 1 || loading
                ? "pointer-events-none opacity-0"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            <ArrowLeft size={18} /> Back
          </button>
        ) : (
          <div /> // Placeholder to keep finish button on the right
        )}

        {step < 3 && (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-medium text-white shadow-lg transition-all hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            Continue <ArrowRight size={18} />
          </button>
        )}

        {step === 3 && (
          <button
            onClick={handleLaunch}
            disabled={loading}
            className={`flex items-center gap-2 rounded-lg px-8 py-3 font-bold text-white shadow-xl transition-all ${
              loading
                ? "cursor-not-allowed bg-blue-400"
                : "bg-blue-600 shadow-blue-500/30 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {polling ? "Scraping... (takes 2-5 mins)" : "Launching..."}
              </div>
            ) : (
              <>
                Launch Campaign <Rocket size={18} />
              </>
            )}
          </button>
        )}

        {step === 4 && (
          <button
            onClick={handleFinish}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-8 py-3 font-bold text-white shadow-lg transition-all hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            Go to Dashboard <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
