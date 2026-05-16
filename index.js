
```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Sample financial news articles for sentiment analysis
const financialNews = [
  {
    id: 1,
    headline: "Tech Stocks Rally as AI Investments Surge",
    content:
      "Major technology companies announced significant investments in artificial intelligence initiatives today, driving market optimism across the sector.",
  },
  {
    id: 2,
    headline: "Oil Prices Plummet Amid Economic Slowdown Fears",
    content:
      "Energy markets experienced a sharp decline as investors worry about reduced global demand due to potential recession signals.",
  },
  {
    id: 3,
    headline: "Central Bank Holds Rates Steady, Markets Mixed",
    content:
      "The Federal Reserve maintained interest rates at current levels, citing persistent inflation concerns while acknowledging recent economic improvements.",
  },
  {
    id: 4,
    headline: "Pharmaceutical Giant Reports Record Quarterly Earnings",
    content:
      "A leading pharmaceutical company exceeded analyst expectations with strong drug sales and promising clinical trial results for new treatments.",
  },
  {
    id: 5,
    headline: "Retail Sector Faces Headwinds from Consumer Spending Decline",
    content:
      "Consumer confidence has weakened as higher costs of living squeeze household budgets, leading retailers to revise down their quarterly forecasts.",
  },
];

interface SentimentAnalysis {
  id: number;
  headline: string;
  sentiment: string;
  score: number;
  reasoning: string;
  market_impact: string;
}

async function analyzeNewsWithClaude(
  newsArticle: (typeof financialNews)[0]
): Promise<SentimentAnalysis> {
  const systemPrompt = `You are a financial sentiment analysis expert. Analyze financial news articles and provide:
1. Sentiment classification (Positive, Negative, or Neutral)
2. A sentiment score from -1.0 (very negative) to 1.0 (very positive)
3. Brief reasoning for the classification
4. Expected market impact (Bullish, Bearish, or Mixed)

Respond in JSON format with these exact fields: sentiment, score, reasoning, market_impact`;

  const userPrompt = `Analyze this financial news article:
Headline: ${newsArticle.headline}
Content: ${newsArticle.content}

Provide sentiment analysis in JSON format.`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  // Extract the text content from the response
  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Parse JSON from the response
  let analysisData;
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysisData = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("No JSON found in response");
    }
  } catch (error) {
    // Fallback parsing if JSON extraction fails
    console.error(
      "Error parsing response, using fallback parsing:",
      error instanceof Error ? error.message : "Unknown error"
    );
    analysisData = {
      sentiment: "Neutral",
      score: 0,
      reasoning: "Unable to parse detailed analysis",
      market_impact: "Mixed",
    };
  }

  return {
    id: newsArticle.id,
    headline: newsArticle.headline,
    sentiment: analysisData.sentiment || "Neutral",
    score: typeof analysisData.score === "number" ? analysisData.score : 0,
    reasoning:
      analysisData.reasoning || "Analysis unavailable",
    market_impact: analysisData.market_impact || "Mixed",
  };
}

function generateReport(analyses: SentimentAnalysis[]): void {
  console.log("\n" + "=".repeat(80));
  console.log("FINANCIAL NEWS SENTIMENT ANALYSIS REPORT");
  console.log("=".repeat(80) + "\n");

  // Overall statistics
  const positiveCount = analyses.filter(
    (a) => a.sentiment === "Positive"
  ).length;
  const negativeCount = analyses.filter(
    (a) => a.sentiment === "Negative"
  ).length;
  const neutralCount = analyses.filter(
    (a) => a.sentiment === "Neutral"
  ).length;
  const averageScore =
    analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;

  console.log("SUMMARY STATISTICS:");
  console.log(`Total Articles Analyzed: ${analyses.length}`);
  console.log(`Positive Sentiment: ${positiveCount}`);
  console.log(`Negative Sentiment: ${negativeCount}`);
  console.log(`Neutral Sentiment: ${neutralCount}`);
  console.log(`Average Sentiment Score: ${averageScore.toFixed(2)}`);
  console.log("");

  // Market outlook
  const marketOutlook =
    averageScore > 0.1
      ? "BULLISH"
      : averageScore < -0.1
        ? "BEARISH"
        : "NEUTRAL";
  console.log(`MARKET OUTLOOK: ${marketOutlook}`);
  console.log("-".repeat(80) + "\n");

  // Detailed analysis for each article
  console.log("DETAILED ARTICLE ANALYSIS:\n");
  analyses.forEach((analysis, index) => {
    console.log(
      `${index + 1}. ${analysis.headline}`
    );
    console.log(`   Sentiment: ${analysis.sentiment} (Score: ${analysis.score.toFixed(2)})`);
    console.log(`   Market Impact: ${analysis.market_impact}`);
    console.