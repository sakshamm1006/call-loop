export const DEMO_LEADS = [
  {
    name: "Priya Nair",
    location: "Indore",
    requirement: "2BHK ready-to-move",
    budget: "45 lakhs",
    timeline: "Within 3 weeks",
    message:
      "Hi, my home loan is pre-approved up to 45L. We need a ready-to-move 2BHK in Indore, preferably near Vijay Nagar, since my husband's transfer is confirmed for next month. Can we see 2-3 options this Saturday?",
    analysis: {
      summary:
        "Priya has a pre-approved loan, a confirmed relocation deadline, and a clear 2BHK requirement. She is ready to visit this weekend.",
      intent: "Ready-to-buy, deadline-driven relocation",
      key_requirements: ["2BHK", "Ready-to-move", "Vijay Nagar area", "Up to 45L"],
      objections: ["Tight timeline", "Needs options quickly"],
      next_action: "Call today and lock in a Saturday site visit with 3 ready-to-move options",
      suggested_response:
        "Hi Priya, congratulations on the transfer! I have three ready-to-move 2BHKs near Vijay Nagar within your 45L budget. Are you free Saturday morning for a quick visit? I'll arrange everything.",
      score: 94,
      tier: "hot",
      urgent: true,
      reasons: [
        "Loan already pre-approved",
        "Hard deadline (transfer next month)",
        "Specific area, size and budget",
      ],
    },
  },
  {
    name: "Amit Verma",
    location: "Bhopal",
    requirement: "3BHK apartment",
    budget: "70 lakhs",
    timeline: "Within 1 month",
    message:
      "Looking for a 3BHK near Kolar Road. Budget is around 70L but can stretch a little for the right place. Want to shift within a month. Can I visit this weekend? Also worried about the builder's delivery record.",
    analysis: {
      summary:
        "Amit wants a 3BHK near Kolar Road within a month and is flexible on budget. His main worry is the builder's delivery record.",
      intent: "Serious buyer, short timeline",
      key_requirements: ["3BHK", "Kolar Road", "Move in within a month", "~70L, flexible"],
      objections: ["Builder delivery track record"],
      next_action: "Schedule a weekend visit and share the builder's delivered-projects list",
      suggested_response:
        "Hi Amit, happy to help. I'll share the builder's completed projects with delivery dates so you can judge the track record yourself. Would Saturday at 11am work for a site visit?",
      score: 88,
      tier: "hot",
      urgent: false,
      reasons: ["Move-in within a month", "Budget flexible", "Wants to visit this weekend"],
    },
  },
  {
    name: "Neha Kapoor",
    location: "Gurugram",
    requirement: "4BHK villa",
    budget: "3.5 Cr",
    timeline: "Within 2 months",
    message:
      "We liked a villa in Sector 57 but another broker has shown us a similar one at a lower price. Need to decide by next Friday. What can you offer?",
    analysis: {
      summary:
        "Neha is comparing a competing offer and has a decision deadline next Friday. High budget and clear intent, but price-sensitive right now.",
      intent: "Comparing offers, ready to decide",
      key_requirements: ["4BHK villa", "Sector 57", "Decision by Friday"],
      objections: ["Competitor is cheaper", "Needs a better offer"],
      next_action: "Call today with a clear value comparison and your best price before Friday",
      suggested_response:
        "Hi Neha, thanks for being upfront. Let me put together a side-by-side comparison, and I'll check what we can improve on price. Can we talk this evening?",
      score: 81,
      tier: "hot",
      urgent: true,
      reasons: ["Hard decision deadline", "Large budget", "Competing offer needs a fast response"],
    },
  },
  {
    name: "Meera Iyer",
    location: "Chennai",
    requirement: "2BHK in gated community",
    budget: "60 lakhs",
    timeline: "Within 2 months",
    message:
      "Interested in your 2BHK in OMR. Is the project RERA registered? Please also tell me about maintenance charges and possession date.",
    analysis: {
      summary:
        "Meera is interested but is verifying RERA status, maintenance and possession before committing. A trust-building lead.",
      intent: "Interested, doing due diligence",
      key_requirements: ["2BHK", "OMR", "Gated community", "RERA registered"],
      objections: ["RERA status", "Maintenance charges", "Possession date"],
      next_action: "Send the RERA number, maintenance details and possession timeline today",
      suggested_response:
        "Hi Meera, great questions. I'm sending the RERA registration number, maintenance structure and possession date right now. Happy to walk you through them on a quick call.",
      score: 68,
      tier: "warm",
      urgent: false,
      reasons: ["Specific project interest", "2-month timeline", "Needs proof before moving ahead"],
    },
  },
  {
    name: "Rahul Mehta",
    location: "Pune",
    requirement: "1BHK for investment",
    budget: "35 lakhs",
    timeline: "3-6 months",
    message:
      "Looking for a 1BHK near Hinjewadi purely for rental income. What yield can I expect? Not in a hurry.",
    analysis: {
      summary:
        "Rahul is an investor looking for a rental-yield 1BHK near Hinjewadi, with no urgency.",
      intent: "Investment, return-focused",
      key_requirements: ["1BHK", "Hinjewadi", "Good rental yield"],
      objections: ["Wants proof of yield"],
      next_action: "Send a rental-yield comparison for 2-3 Hinjewadi projects",
      suggested_response:
        "Hi Rahul, Hinjewadi has strong rental demand. I'll send you a yield comparison of three projects within your 35L budget. Want me to include resale trends too?",
      score: 55,
      tier: "warm",
      urgent: false,
      reasons: ["Clear budget and area", "Long timeline", "No urgency signals"],
    },
  },
  {
    name: "Sunita Rao",
    location: "Hyderabad",
    requirement: "3BHK",
    budget: "90 lakhs",
    timeline: "6 months",
    message:
      "Just exploring options for now. Might buy next year if I find something good. Please send me brochures.",
    analysis: {
      summary: "Sunita is early in her search and only wants brochures. No commitment yet.",
      intent: "Early-stage research",
      key_requirements: ["3BHK", "Around 90L"],
      objections: ["Not ready to commit"],
      next_action: "Send brochures and add her to a monthly follow-up list",
      suggested_response:
        "Hi Sunita, sharing a few brochures that match your budget. No pressure, just reply anytime you want to visit one.",
      score: 42,
      tier: "warm",
      urgent: false,
      reasons: ["Long timeline", "Vague requirements", "Budget stated"],
    },
  },
  {
    name: "Karan Singh",
    location: "Jaipur",
    requirement: "Plot",
    budget: "25 lakhs",
    timeline: "Someday",
    message: "Plot ka rate kya hai? Abhi lena nahi hai, bas pata karna tha.",
    analysis: {
      summary: "Karan only asked for plot rates and says he is not buying now.",
      intent: "Price enquiry only",
      key_requirements: ["Plot", "Around 25L"],
      objections: ["Not buying now"],
      next_action: "Reply with a price range and check back in 2-3 months",
      suggested_response:
        "Hi Karan, plots in your range start around 25L depending on the area. I'll send a short list. Let me know when you want to look at one.",
      score: 22,
      tier: "cold",
      urgent: false,
      reasons: ["No timeline", "Said he is not buying now", "Vague requirement"],
    },
  },
  {
    name: "Deepak Joshi",
    location: "Nagpur",
    requirement: "Not specified",
    budget: "Not specified",
    timeline: "Not specified",
    message: "Price?",
    analysis: {
      summary: "A one-word enquiry with no requirement, budget or timeline.",
      intent: "Unclear",
      key_requirements: [],
      objections: [],
      next_action: "Send one qualifying question: what type of property and what budget?",
      suggested_response:
        "Hi Deepak, happy to help! Are you looking for a flat or a plot, and what budget range should I keep in mind?",
      score: 12,
      tier: "cold",
      urgent: false,
      reasons: ["No details given", "No timeline", "No budget"],
    },
  },
];