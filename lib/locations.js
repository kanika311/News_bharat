// Comprehensive Indian states and UTs with bilingual labels
export const INDIAN_STATES = [
  { code: "UP", nameHi: "उत्तर प्रदेश", nameEn: "Uttar Pradesh" },
  { code: "MP", nameHi: "मध्य प्रदेश", nameEn: "Madhya Pradesh" },
  { code: "DL", nameHi: "दिल्ली (NCR)", nameEn: "Delhi (NCR)" },
  { code: "BR", nameHi: "बिहार", nameEn: "Bihar" },
  { code: "RJ", nameHi: "राजस्थान", nameEn: "Rajasthan" },
  { code: "HR", nameHi: "हरियाणा", nameEn: "Haryana" },
  { code: "UK", nameHi: "उत्तराखंड", nameEn: "Uttarakhand" },
  { code: "PB", nameHi: "पंजाब", nameEn: "Punjab" },
  { code: "MH", nameHi: "महाराष्ट्र", nameEn: "Maharashtra" },
  { code: "GJ", nameHi: "गुजरात", nameEn: "Gujarat" },
  { code: "JH", nameHi: "झारखंड", nameEn: "Jharkhand" },
  { code: "CG", nameHi: "छत्तीसगढ़", nameEn: "Chhattisgarh" },
  { code: "WB", nameHi: "पश्चिम बंगाल", nameEn: "West Bengal" },
  { code: "HP", nameHi: "हिमाचल प्रदेश", nameEn: "Himachal Pradesh" },
  { code: "JK", nameHi: "जम्मू और कश्मीर", nameEn: "Jammu and Kashmir" },
  { code: "AP", nameHi: "आंध्र प्रदेश", nameEn: "Andhra Pradesh" },
  { code: "AR", nameHi: "अरुणाचल प्रदेश", nameEn: "Arunachal Pradesh" },
  { code: "AS", nameHi: "असम", nameEn: "Assam" },
  { code: "GA", nameHi: "गोवा", nameEn: "Goa" },
  { code: "KA", nameHi: "कर्नाटक", nameEn: "Karnataka" },
  { code: "KL", nameHi: "केरल", nameEn: "Kerala" },
  { code: "MN", nameHi: "मणिपुर", nameEn: "Manipur" },
  { code: "ML", nameHi: "मेघालय", nameEn: "Meghalaya" },
  { code: "MZ", nameHi: "मिज़ोरम", nameEn: "Mizoram" },
  { code: "NL", nameHi: "नागालैंड", nameEn: "Nagaland" },
  { code: "OR", nameHi: "ओडिशा", nameEn: "Odisha" },
  { code: "SK", nameHi: "सिक्किम", nameEn: "Sikkim" },
  { code: "TN", nameHi: "तमिलनाडु", nameEn: "Tamil Nadu" },
  { code: "TG", nameHi: "तेलंगाना", nameEn: "Telangana" },
  { code: "TR", nameHi: "त्रिपुरा", nameEn: "Tripura" },
  { code: "AN", nameHi: "अंडमान और निकोबार", nameEn: "Andaman & Nicobar" },
  { code: "CH", nameHi: "चंडीगढ़", nameEn: "Chandigarh" },
  { code: "DN", nameHi: "दादरा एवं नगर हवेली व दमन दीव", nameEn: "Dadra & Nagar Haveli and Daman & Diu" },
  { code: "LA", nameHi: "लद्दाख", nameEn: "Ladakh" },
  { code: "LD", nameHi: "लक्षद्वीप", nameEn: "Lakshadweep" },
  { code: "PY", nameHi: "पुडुचेरी", nameEn: "Puducherry" },
];

export const POPULAR_DISTRICTS = [
  "सुल्तानपुर",
  "लखनऊ",
  "आगरा",
  "वाराणसी",
  "गोरखपुर",
  "प्रयागराज",
  "अयोध्या",
  "कानपुर",
  "नोएडा",
  "गाजियाबाद",
  "मेरठ",
  "बरेली",
  "अलीगढ़",
  "झांसी",
  "बस्ती",
  "गोंडा",
  "जौनपुर",
  "रायबरेली",
  "अमेठी",
  "प्रतापगढ़",
  "पटना",
  "भोपाल",
  "इंदौर",
  "जयपुर",
  "नई दिल्ली",
  "चंडीगढ़",
  "देहरादून",
  "जम्मू",
];

export function buildLocationDisplay({ city = "", state = "", country = "India" }) {
  const c = (city || "").trim();
  const s = (state || "").trim();
  if (c && s) return `${c}, ${s}`;
  if (c) return c;
  if (s) return s;
  return country || "सुल्तानपुर";
}
