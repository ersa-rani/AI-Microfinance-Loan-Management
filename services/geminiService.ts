import { GoogleGenAI } from "@google/genai";
import { Loan, Client } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getSystemImprovementSuggestions = async (loans: Loan[], clients: Client[]): Promise<string> => {
    if (!API_KEY) {
      return "Gemini API key is not configured. Please set the API_KEY environment variable to enable AI-powered suggestions.";
    }

  try {
    const totalLoans = loans.length;
    const activeLoans = loans.filter(l => l.status === 'Active').length;
    const highRiskClients = clients.filter(c => c.riskLevel === 'High').length;
    const defaultRate = (loans.filter(l => l.status === 'Default').length / totalLoans) * 100;

    const prompt = `
      As an expert microfinance consultant, analyze the following dashboard data for a Microfinance Loan Management System and provide actionable suggestions for improvement.

      Current System State:
      - Total Loans: ${totalLoans}
      - Active Loans: ${activeLoans}
      - Number of High-Risk Clients: ${highRiskClients}
      - Loan Default Rate: ${defaultRate.toFixed(2)}%

      Based on this data, provide 3-5 concise, actionable recommendations focusing on:
      1.  Risk Mitigation Strategies.
      2.  Client Engagement & Support.
      3.  Operational Efficiency.
      
      Format the response in markdown. Use headings for each category.
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "An error occurred while fetching AI suggestions. Please check the console for details.";
  }
};

export const getRiskScoreExplanation = async (client: Client): Promise<string> => {
    if (!API_KEY) {
      return "Gemini API key is not configured. Please set the API_KEY environment variable to enable AI features.";
    }

    try {
        const { name, previousLoans, missedPayments, cnicVerified, riskScore } = client;

        const prompt = `
            Act as an expert loan risk analyst for a microfinance institution.
            A client named "${name}" has a calculated default risk score of **${(riskScore * 100).toFixed(1)}%**.

            Their key risk profile data is:
            - Previous Loans: ${previousLoans}
            - Missed Payments on Past Loans: ${missedPayments}
            - National ID (CNIC) Verified: ${cnicVerified ? 'Yes' : 'No'}

            Based *only* on this data, provide a concise, easy-to-understand explanation for this risk score.
            - Start with a summary sentence.
            - Use bullet points to highlight the main positive and negative factors influencing the score.
            - Conclude with a brief, actionable suggestion for the client if their risk is medium or high.
            - Keep the entire explanation to under 100 words.
            - Format the response in markdown.
        `;
    
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for risk explanation:", error);
        return "An error occurred while generating the risk explanation.";
    }
};