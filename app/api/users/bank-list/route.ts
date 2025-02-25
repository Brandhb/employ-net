import { NextResponse } from "next/server";

// ✅ Hardcoded Australian bank list (Used as fallback)
const australianBanks = [
  { id: "cba", name: "Commonwealth Bank of Australia (CBA)", country: "Australia" },
  { id: "wbc", name: "Westpac Banking Corporation", country: "Australia" },
  { id: "anz", name: "Australia and New Zealand Banking Group (ANZ)", country: "Australia" },
  { id: "nab", name: "National Australia Bank (NAB)", country: "Australia" },
  { id: "macq", name: "Macquarie Bank", country: "Australia" },
  { id: "bendigo", name: "Bendigo and Adelaide Bank", country: "Australia" },
  { id: "suncorp", name: "Suncorp Bank", country: "Australia" },
  { id: "boq", name: "Bank of Queensland (BOQ)", country: "Australia" },
  { id: "mebank", name: "ME Bank (Owned by BOQ Group)", country: "Australia" },
  { id: "hsbc", name: "HSBC Australia", country: "Australia" },
  { id: "amp", name: "AMP Bank", country: "Australia" },
  { id: "ubank", name: "UBank (Owned by NAB)", country: "Australia" },
  { id: "bankaustralia", name: "Bank Australia", country: "Australia" },
  { id: "greater", name: "Greater Bank", country: "Australia" },
  { id: "heritage", name: "Heritage Bank", country: "Australia" },
  { id: "newcastle", name: "Newcastle Permanent (Merged with Heritage Bank)", country: "Australia" },
  { id: "ing", name: "ING Australia", country: "Australia" },
  { id: "rabobank", name: "Rabobank Australia", country: "Australia" },
  { id: "defence", name: "Defence Bank", country: "Australia" },
  { id: "bankwest", name: "Bankwest (Owned by CBA)", country: "Australia" },
  { id: "wise", name: "Wise", country: "International" },
  { id: "revolut", name: "Revolut", country: "International" },
];

// ✅ Bank API (Example API: Needs replacement with a real provider)
const BANK_API_URL = "https://data.holder.com.au/cds-au/v1/banking/products";
//
//https://api.openbankproject.com/v2.0.0/banks


export async function GET() {
    debugger
  try {
    // 🔵 Try fetching from an API
    const response = await fetch(BANK_API_URL);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();

    // ✅ Ensure correct format
    const formattedBanks = data?.banks?.map((bank: any) => ({
      id: bank.id || bank.code,
      name: bank.name || bank.bank_name,
      country: bank.country || "Australia",
    }));

    console.log("✅ Successfully fetched banks from API.");
    return NextResponse.json({ banks: formattedBanks });
  } catch (error) {
    console.error("❌ API Fetch Failed, Using Fallback:", error);
    return NextResponse.json({ banks: australianBanks });
  }
}
