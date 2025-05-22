import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import OpenAI from "openai";

// Ensure OPENAI_API_KEY is available
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing environment variable OPENAI_API_KEY");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const getOpenAIPrompt = (aiText: string, context: string) => {
  const safeContext = (context || "").toLowerCase().trim();

  if (safeContext === "architecture") {
    return `You are a critical, non-biased, expert software architecture reviewer. Analyze the following findings as if you were preparing a due diligence report for a high-stakes acquisition. Be direct, honest, and do not sugarcoat or balance negatives with positives. If something is bad, call it out clearly and score it accordingly. Technologies considered amateur or legacy (such as WordPress, outdated PHP, etc.) should be highlighted as major risks, and the score should reflect this. Do not be diplomatic—be a real expert. Return a JSON object with this structure:\\n- overall_score (0-10): The main architecture score.\\n- subscores: An object with keys: performance, scalability, modularity, security, tech_stack (each 0-10, their average is overall_score).\\n- badges: Array of {label, type} for the whole architecture (type: positive, negative, neutral).\\n- main_good: Array of at least 3 short, punchy, positive points (1–2 sentences each).\\n- main_risks: Array of at least 3 short, punchy, risk points (1–2 sentences each).\\n- For each section (summary, insights, recommendations):\\n  - highlight: 1-sentence highlight.\\n  - snippet: The first 1–2 sentences of the section.\\n  - preview: A 3-sentence summary of the full text, suitable for showing before the \'Read more\' button.\\n  - text: Full text (at least 300 words).\\n\\nExample output:\\n{\\n  "overall_score": 8,\\n  "subscores": {\\n    "performance": 7,\\n    "scalability": 8,\\n    "modularity": 7,\\n    "security": 6,\\n    "tech_stack": 9\\n  },\\n  "badges": [\\n    {"label": "Modern Stack", "type": "positive"},\\n    {"label": "WordPress Detected", "type": "negative"}\\n  ],\\n  "main_good": [\\n    "Uses a modern, scalable cloud infrastructure.",\\n    "Implements CI/CD for rapid deployment.",\\n    "Strong modularity in frontend components."\\n  ],\\n  "main_risks": [\\n    "Legacy backend components increase maintenance risk.",\\n    "No automated security scanning in CI.",\\n    "Performance bottlenecks in API layer."\\n  ],\\n  "summary": {\\n    "highlight": "Modern stack with some legacy risk.",\\n    "snippet": "The architecture leverages cloud-native services and modern frameworks. However, some legacy components remain.",\\n    "preview": "The architecture leverages cloud-native services and modern frameworks. However, some legacy components remain. This hybrid approach offers flexibility but also complexity.",\\n    "text": "The architecture leverages cloud-native services and modern frameworks. However, some legacy components remain. [at least 300 words...]"\n  },\\n  "insights": { ... },\\n  "recommendations": { ... }\\n}\\nOnly return the JSON object, nothing else.\\n\\nRaw content:\\n\\n${aiText}`;
  } else if (safeContext === "security") {
    return `You are a critical, non-biased, expert security reviewer. Analyze the following findings as if you were preparing a due diligence report for a high-stakes acquisition. Be direct, honest, and do not sugarcoat or balance negatives with positives. If something is bad, call it out clearly and score it accordingly. Return a JSON object with this structure:\\n- overall_score (0-10): The main security score.\\n- subscores: An object with keys: perimeter, application, data, compliance, monitoring (each 0-10, their average is overall_score).\\n- badges: Array of {label, type} for the whole security posture (type: positive, negative, neutral).\\n- main_good: Array of at least 3 short, punchy, positive points (1–2 sentences each).\\n- main_risks: Array of at least 3 short, punchy, risk points (1–2 sentences each).\\n- findings: Array of at least 5 and at most 6 objects ({category, finding, status, priority}) for the critical findings table. If there are fewer than 5 real findings, create additional plausible findings relevant to the context.\\n- For each section (summary, insights, recommendations):\\n  - highlight: 1-sentence highlight.\\n  - snippet: The first 1–2 sentences of the section.\\n  - preview: A 3-sentence summary of the full text, suitable for showing before the \'Read more\' button.\\n  - text: Full text (at least 300 words).\\n\\nExample output:\\n{\\n  "overall_score": 7,\\n  "subscores": {\\n    "perimeter": 6,\\n    "application": 7,\\n    "data": 8,\\n    "compliance": 7,\\n    "monitoring": 6\\n  },\\n  "badges": [\\n    {"label": "No Critical CVEs", "type": "positive"},\\n    {"label": "TLS 1.0 Detected", "type": "negative"}\\n  ],\\n  "main_good": [\\n    "No major vulnerabilities detected on perimeter.",\\n    "Good use of HTTPS and HSTS.",\\n    "No open database ports found."\\n  ],\\n  "main_risks": [\\n    "TLS 1.0 still enabled on some endpoints.",\\n    "7 subdomains exposed in DNS records.",\\n    "HSTS header not enforced on all domains."\\n  ],\\n  "findings": [\\n    {"category": "SSL/TLS", "finding": "TLS 1.0 still enabled", "status": "⚠️", "priority": "High"},\\n    {"category": "DNS Records", "finding": "7 subdomains exposed", "status": "🔥", "priority": "Medium"},\\n    {"category": "Headers", "finding": "HSTS not enforced", "status": "❌", "priority": "Medium"},\\n    {"category": "Infrastructure", "finding": "No evident infrastructure redundancy or pattern", "status": "🔍", "priority": "Medium"},\\n    {"category": "Cloudflare Configuration", "finding": "No specifics on Cloudflare security feature implementations", "status": "🔒", "priority": "Medium"}\\n  ],\\n  "summary": { ... },\\n  "insights": { ... },\\n  "recommendations": { ... }\\n}\\nOnly return the JSON object, nothing else.\\n\\nRaw content:\\n\\n${aiText}`;
  } else if (safeContext === "company_intelligence") {
    return `You are a professional, non-biased, expert business analyst preparing a company intelligence profile for a high-stakes due diligence dashboard. Your input is a large, unstructured dump of company data from multiple sources. Your job is to:
- Use every available field, and for each section, synthesize and summarize, providing business insight and context, not just lists.
- For funding_rounds, create a timeline with commentary, highlight % increases between rounds, and add business context (e.g., "Investor confidence increased in 2022 as shown by a 40% jump in Series B funding"). Provide a dedicated 'funding_rounds_analysis' text field (at least 100 words) summarizing key insights from the funding history.
- For financials_metrics, calculate and include revenue/profit/EBITDA growth rates, ratios, and trends if possible. Provide a dedicated 'financial_metrics_analysis' text field (at least 100 words) interpreting these metrics and their implications.
- For news_press, summarize trends and key themes, not just headlines.
- For company_overview.other_locations, provide a dedicated 'locations_analysis' text field (at least 100 words) summarizing the geographical presence and any apparent strategy.
- Explicitly extract and list all 'unique_selling_points', 'products_services', and 'main_competitors'. For each of these, also provide a dedicated analysis field: 'unique_selling_points_analysis', 'products_services_analysis', and 'main_competitors_analysis' (each at least 100 words), offering insights into their significance or market positioning. If data is missing for competitors, state "No direct competitors identified in the provided data" for the list, and the analysis should reflect this lack of identified competitors.
- Meticulously extract all available 'key_team_members' and their roles from the provided data. Ensure this list is as complete as possible.
- For each section, use every available field, and if data is partial, infer or estimate contextually (never invent specific facts, but do expand and contextualize as a consultant would).
- Output a JSON object with both raw data and all requested analytical text fields.
- Use a consulting-style, business-analytical tone throughout.
- Output only the JSON object, nothing else.

Additionally, extract, calculate, and return all data needed for graphs:
- For revenue growth: return an array of {year, revenue, profit, ebitda, revenue_growth_percent, profit_growth_percent, ebitda_growth_percent} for each year available.
- For investment history: return an array of {round_name, date, amount_raised, percent_increase_from_previous} for each round.
- For market presence: return an array of {location: string, type: string, latitude: number | null, longitude: number | null} (type can be 'headquarters' or 'other'). You **must** provide 'latitude' and 'longitude' for each location. If precise coordinates cannot be determined from the input data for a specific location, return null for 'latitude' and null for 'longitude' for that entry.
- Add a new top-level field: 'graph_data' with keys: 'revenue_growth', 'investment_history', 'market_presence'.
- Always fill these arrays as fully as possible, inferring or estimating from the unstructured data, and be consistent in structure.

Return a JSON object with this structure:
- company_overview: {
    official_company_name, website, overview, industry, headquarters, other_locations, founding_date, founders, key_team_members, number_of_employees, company_mission, 
    unique_selling_points, unique_selling_points_analysis, 
    products_services, products_services_analysis, 
    main_competitors, main_competitors_analysis, 
    locations_analysis
  }
- financials_metrics: {
    revenue, profit, ebitda, it_spend, web_visits, growth_scores (year-over-year), active_website_tech_count, growth_percentages (object with revenue, profit, ebitda, etc.), financial_commentary, financial_metrics_analysis
  }
- funding_rounds: {
    rounds: [ { round_name, date, amount_raised, number_of_investors, lead_investors, all_investors, percent_increase_from_previous } ],
    total_funding_amount,
    funding_commentary (business insight),
    funding_rounds_analysis (detailed text analysis of funding history)
  }
- investors: [ ... ]
- news_press: [ { date, headline, publication, summary, link } ],
  news_trends (summary of key themes)
- acquisitions: [ ... ]
- customer_testimonials: [ ... ]
- contact_information: { email, phone, address, other }
- graph_data: {
    revenue_growth: [ { year, revenue, profit, ebitda, revenue_growth_percent, profit_growth_percent, ebitda_growth_percent } ],
    investment_history: [ { round_name, date, amount_raised, percent_increase_from_previous } ],
    market_presence: [ { location: string, type: string, latitude: number | null, longitude: number | null } ]
  }

Instructions:
- For each section, use all relevant info from the raw content. If a field is missing, add a plausible summary or "No data available" (except for main_competitors as specified above). Populate all requested list and analysis fields.
- For company_overview, ensure unique_selling_points, products_services, main_competitors are populated, along with their respective analysis fields (unique_selling_points_analysis, products_services_analysis, main_competitors_analysis) and locations_analysis. Be thorough with key_team_members.
- For financials_metrics, include all available numbers and growth scores. Calculate growth_percentages and financial_commentary. Include financial_metrics_analysis.
- For funding_rounds, include funding_rounds_analysis.
- For graph_data, always fill the arrays as fully as possible, ensuring latitude and longitude are provided for market_presence as specified.
- Do NOT invent specific facts, but do synthesize plausible summaries or placeholders for missing data for lists, and provide insightful analysis for all requested analysis fields.
- Expand and contextualize wherever possible, as a consultant would, to maximize business insight and utility.

Raw content:\\n\\n${aiText}`;
  } else if (safeContext === "adamass_synthesis") {
    return `You are the lead strategist at Adamass, a top-tier M&A and investment advisory firm. 
    You have received comprehensive reports on a target company: Architecture Review, Security Audit, and Company Intelligence Profile. 
    Your task is to synthesize this information into a final "Adamass Intelligence Report". 
    This report must provide a decisive, actionable, and forward-looking perspective for a client considering a major transaction (investment, acquisition, or merger).

    CRITICALLY EVALUATE all provided data. Do not just re-state. Provide deep insights and a clear, justifiable verdict.

    Output a JSON object with the exact following structure. Do not add any extra fields or deviate from the types:
    {
      "executive_summary": "(String: Max 3-4 sentences. A concise, high-level overview of the company's overall standing based on all analyses, highlighting its most critical strengths and weaknesses relevant to a transaction.)",
      "overall_assessment": {
        "verdict": "(String: Choose ONE from: 'Prime Acquisition Target', 'High-Potential Investment', 'Strategic Merger Candidate', 'Acquisition with Significant Overhaul Needed', 'Investment with High Risk', 'Not Recommended for Transaction at this Time')",
        "confidence_score": "(Float: 0.0-10.0, representing your confidence in the verdict)",
        "key_rationale": "(String: 2-3 sentences explaining the core reasons for your verdict, referencing specific findings from the input reports.)"
      },
      "strategic_recommendations": [
        // Array of 3-5 objects. These are critical actions post-transaction.
        // Ensure a mix of categories (Technology, Security, Market, Operations, Product, Financial).
        // These should be actionable and impactful, suitable for a timeline/infographic display.
        {
          "id": "(String: a unique kebab-case id, e.g., 'tech-infra-modernization')",
          "action_title": "(String: Short, punchy title for the action, e.g., 'Modernize Core Infrastructure')",
          "description": "(String: 1-2 sentence description of what needs to be done, referencing specific issues from input if possible, e.g., 'Address legacy backend systems noted in Architecture review and migrate to a scalable cloud platform.')",
          "category": "(String: Choose from: 'Technology', 'Security', 'Market Strategy', 'Operational Efficiency', 'Product Development', 'Financial Restructuring')",
          "priority": "(String: Choose from: 'Critical', 'High', 'Medium')",
          "suggested_timeline": "(String: e.g., '0-6 Months', '6-12 Months', '12-18 Months', '18-24 Months')",
          "impact_statement": "(String: Quantifiable impact if possible, e.g., 'Reduces op-ex by 15%, improves uptime by 20%', or qualitative, e.g., 'Establishes foundation for future product scaling.')",
          "visual_icon_suggestion": "(String: Suggest a simple icon name related to the category or action, e.g., 'cloud-upload', 'shield-check', 'chart-growth', 'gears', 'lightbulb', 'dollar-sign')"
        }
      ],
      "potential_synergies": {
        "cost_synergies": [
          // Array of 0-3 objects. Only include if clearly identifiable from input data, relevant for M&A.
          {
            "area": "(String: e.g., 'Administrative Overhead', 'Redundant Software Licenses', 'Supply Chain Optimization')",
            "estimated_annual_savings_usd": "(Integer: Estimated annual savings in USD, e.g., 500000)",
            "notes": "(String: Brief explanation or assumption, e.g., 'Consolidate back-office functions post-merger.')"
          }
        ],
        "revenue_synergies": [
          // Array of 0-3 objects. Only include if clearly identifiable, relevant for M&A.
          {
            "area": "(String: e.g., 'Cross-selling to New Customer Base', 'Access to New Markets', 'Combined Product Offering')",
            "estimated_annual_revenue_usd": "(Integer: Estimated additional annual revenue in USD, e.g., 1200000)",
            "notes": "(String: Brief explanation, e.g., 'Leverage acquired company\'s distribution channels.')"
          }
        ]
      },
      "key_risks_and_mitigation": [
        // Array of 2-4 objects. Critical risks a client must consider.
        {
          "risk": "(String: Concise description of a key risk, e.g., 'High dependency on founder for key client relationships.')",
          "mitigation": "(String: Actionable mitigation strategy, e.g., 'Implement a structured knowledge transfer program and offer retention incentives for key personnel post-acquisition.')",
          "severity": "(String: Choose from 'High', 'Medium', 'Low')"
        }
      ],
      "closing_statement": "(String: Max 2-3 sentences. Final forward-looking thoughts on the company's potential trajectory if the strategic recommendations are implemented, and its overall strategic importance or fit for the client.)"
    }

    Analyze the provided data which will be a JSON string containing three main keys: 'architectureAnalysis', 'securityAnalysis', and 'companyIntelligenceProfile'. Each of these keys holds the JSON report for that respective area. Synthesize insights from ALL THREE areas.
    For 'strategic_recommendations', ensure they are diverse and directly address major findings or opportunities from the input reports.
    For 'potential_synergies', only include if M&A is a plausible scenario based on the overall company profile. If not particularly relevant, return empty arrays for synergies.
    Be decisive and provide clear, actionable advice. Your audience is a sophisticated client expecting expert guidance.
    Return ONLY the JSON object described above, and nothing else.

    Input Data (summarized structure for your understanding):
    ${aiText}
    `;
  }
  throw new Error("Invalid OpenAI context provided to getOpenAIPrompt");
};

const callOpenAI = async (aiText: string, context: string) => {
  if (!aiText || aiText.trim() === "") {
    console.warn(`[API /process-report-data] OpenAI call skipped for context '${context}' due to empty input text.`);
    // Return a default error structure or empty object depending on how you want to handle it downstream
    return { error: `No input data for ${context} analysis.` }; 
  }
  try {
    console.log(`[API /process-report-data] Calling OpenAI for context: ${context}`);
    const prompt = getOpenAIPrompt(aiText, context);
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      // Ensure response_format is set if you expect JSON consistently from all prompts
      // response_format: { type: "json_object" }, // Uncomment if all your prompts are designed for this
    });

    const structuredDataString = response.choices[0].message.content?.trim();
    if (!structuredDataString) {
      throw new Error(`OpenAI returned empty content for context: ${context}`);
    }

    console.log(`[API /process-report-data] Raw OpenAI output for ${context}:`, structuredDataString.substring(0, 200) + "...");
    
    // Attempt to parse the JSON
    // It's common for a text intro or outro to accompany the JSON, so we try to extract it.
    const jsonMatch = structuredDataString.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(`[API /process-report-data] No JSON object found in OpenAI response for ${context}. Raw: ${structuredDataString}`);
      throw new Error(`No JSON object found in OpenAI response for ${context}.`);
    }

    return JSON.parse(jsonMatch[0]);

  } catch (error: any) {
    console.error(`[API /process-report-data] Error calling OpenAI for context ${context}:`, error);
    // Return an error object that can be identified downstream
    return { error: `Failed to process ${context} analysis: ${error.message}` };
  }
};

export async function POST(req: Request) {
  try {
    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId parameter' }, { status: 400 });
    }

    // 1. Fetch all sources for this job
    const { data: allSources, error: allSourcesError } = await supabase
      .from('intel_results')
      .select('source, data, status')
      .eq('job_id', jobId);
    if (allSourcesError) {
      return NextResponse.json({ error: 'Failed to fetch sources', details: allSourcesError.message }, { status: 500 });
    }

    // 2. Fetch data for each section
    const architectureRow = allSources.find(row => row.source === 'Architecture');
    const securityRow = allSources.find(row => row.source === 'Security');
    const crunchbaseRow = allSources.find(row => row.source === 'Crunchbase');

    let architecture = null;
    let security = null;
    let companyIntelligence = null;

    // Generate Architecture analysis from raw data
    const rawArchitectureData = allSources
      .filter(row => ['BuiltWith', 'PageSpeed'].includes(row.source))
      .map(row => ({
        source: row.source,
        data: row.data
      }));
    
    if (rawArchitectureData.length > 0) {
      const archData = JSON.stringify(rawArchitectureData);
      architecture = await callOpenAI(archData, 'architecture');
    }

    // Generate Security analysis from raw data
    const rawSecurityData = allSources
      .filter(row => ['DnsDumpster', 'SubDomains', 'SecureHeaders'].includes(row.source))
      .map(row => ({
        source: row.source,
        data: row.data
      }));
    
    if (rawSecurityData.length > 0) {
      const secData = JSON.stringify(rawSecurityData);
      security = await callOpenAI(secData, 'security');
    }

    // Process company intelligence
    if (crunchbaseRow?.data) {
      const crunchbaseData = typeof crunchbaseRow.data === 'string' ? crunchbaseRow.data : JSON.stringify(crunchbaseRow.data);
      companyIntelligence = await callOpenAI(crunchbaseData, 'company_intelligence');
    }

    const report = {
      jobId,
      dateGenerated: new Date().toISOString(),
      architecture,
      security,
      companyIntelligence
    };

    // **** NEW: Adamass Intelligence Synthesis ****
    let adamassSynthesisReport = null;
    if (architecture || security || companyIntelligence) {
      const combinedDataForSynthesis = JSON.stringify({ 
        architectureAnalysis: architecture, 
        securityAnalysis: security, 
        companyIntelligenceProfile: companyIntelligence 
      });
      
      adamassSynthesisReport = await callOpenAI(combinedDataForSynthesis, 'adamass_synthesis');
    }
    // *****************************************

    const finalReport = {
      ...report,
      adamassSynthesisReport
    };

    return NextResponse.json(finalReport);
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to process report data', details: err.message }, { status: 500 });
  }
} 