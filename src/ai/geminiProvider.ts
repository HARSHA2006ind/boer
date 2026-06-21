import {
  AIProvider, CropRecommendationInput, CropRecommendation,
  IrrigationInput, IrrigationAdvice,
  FertilizerInput, FertilizerAdvice,
  DiseaseResult, WeatherInterpretationInput, DailySummaryContext,
  SmartAlert, MarketAdviceInput, MarketAdviceResult, FarmAlertContext,
} from './aiProvider';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const MODEL = 'gemini-2.0-flash';
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

let currentLanguage = 'en';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', ta: 'Tamil', hi: 'Hindi', te: 'Telugu',
  kn: 'Kannada', ml: 'Malayalam', bn: 'Bengali', mr: 'Marathi',
  gu: 'Gujarati', pa: 'Punjabi', or: 'Odia', as: 'Assamese', ur: 'Urdu',
};

async function callGemini(systemPrompt: string, userPrompt: string, image?: { base64: string; mimeType: string }): Promise<string> {
  if (!API_KEY) {
    return 'CONFIG_ERROR:Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file to use AI features.';
  }

  const parts: any[] = [{ text: userPrompt }];
  if (image) {
    parts.push({ inlineData: { mimeType: image.mimeType, data: image.base64 } });
  }

  const body = {
    contents: [{ role: 'user', parts }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { temperature: 0.4, maxOutputTokens: 2048, topP: 0.9 },
  };

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-goog-api-key': API_KEY },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}

const FARMER_SYSTEM_BASE = `You are Boer AI, an expert agricultural assistant for Indian farmers.
Respond in simple, clear, actionable language. Use local terms (Kharif, Rabi, mandi, etc.).
Keep responses concise but complete. Never give vague advice — always be specific.
If you don't know something, say so honestly. Include disclaimer: "Always consult local agricultural experts for personalized advice."`;

function getSystemPrompt(): string {
  const langName = LANGUAGE_NAMES[currentLanguage] || 'English';
  const langInstruction = currentLanguage !== 'en'
    ? `\n\nIMPORTANT: Respond entirely in ${langName} language. The user's preferred language is ${langName}. All your explanations, advice, and text must be in ${langName}. Keep English only for technical terms that have no direct translation.`
    : '';
  return FARMER_SYSTEM_BASE + langInstruction;
}

export const geminiProvider: AIProvider = {
  async chat(messages, context) {
    const last = messages.filter(m => m.role === 'user').pop();
    if (!last) return 'Hello! I\'m Boer AI. Ask me anything about your farm.';

    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    let userPrompt = last.text;
    if (context) {
      userPrompt = `[Farmer's Farm Context: ${context}]\n\nQuestion: ${last.text}`;
    }

    let systemPrompt = getSystemPrompt();
    if (!last.text.toLowerCase().match(/crop|farm|agriculture|soil|water|irrigation|fertilizer|pest|disease|harvest|plant|seed|weather|rain|market|price|mandi|scheme|subsidy|loan|organic|paddy|rice|wheat|cotton|sugarcane|vegetable|fruit|groundnut|pulse|millet|maize|sorghum|ragi|bajra|jowar|chilli|tomato|onion|potato|brinjal|cabbage|cauliflower|mango|banana|grape|coconut|sunflower|soybean|mustard|cow|buffalo|goat|sheep|poultry|dairy|fishery|apiary|mulberry|silk|rubber|coffee|tea|cardamom|pepper|turmeric|ginger|garlic|pomegranate|guava|papaya|sapota|orange|lime|sweet lime|watermelon|muskmelon|cucumber|pumpkin|bitter gourd|bottle gourd|ridge gourd|snake gourd|drumstick|moringa|mushroom|saffron|rose|jasmine|marigold|chrysanthemum|gladiolus|tuberose|carnation|lily|orchid|anthurium|gerbera|aster|daisy|sunhemp|dhaincha|sesbania|subabul|casuarina|eucalyptus|poplar|teak|sal|shisham|bamboo|cane|jute|mesta|sunflower|safflower|linseed|sesame|niger|caster|soyabean|fieldbean|cowpea|blackgram|greengram|redgram|pigeonpea|chickpea|bengalgram|horsegram|mothbean|khesari|lentil|masoor|peas|gardenpea|sweet corn|baby corn|popcorn|barley|oats|triticale|rye|tapioca|cassava|sweet potato|yam|elephant foot yam|arrowroot|colocasia|ginger|turmeric|curry leaf|coriander|fenugreek|dill|celery|parsley|mint|pudina|basil|tulsi|thyme|oregano|rosemary|sage|lettuce|spinach|palak|amaranthus|chenopodium|sorrel|dock|radish|carrot|beetroot|turnip|parsnip|horseradish|knolkhol|kohlrabi|broccoli|brussels sprout|kale|collard|mustard greens|fenugreek leaves|methi|green garlic|onion leaves|spring onion|leek|shallot|chive|asparagus|artichoke|jackfruit|breadfruit|fig|persimmon|loquat|cherry|plum|peach|apricot|pear|apple|almond|walnut|cashew|pistachio|arecanut|betelnut|cocoa|vanilla|cinnamon|clove|nutmeg|mace|allspice|star anise|fennel|anise|cumin|caraway|ajwain|bishop's weed|dill seed|poppy seed|mustard seed|rapeseed|cabbage seed|cauliflower seed|onion seed|tomato seed|chilli seed|brinjal seed|okra|lady finger|bhindi|capsicum|bell pepper|sweet pepper|paprika|chow-chow|chayote|kundru|tindora|ivy gourd|karela|bitter gourd|parwal|pointed gourd|patal|potato|sweet potato|cocoyam|arbi|jimikand|suran|kachalu|ol|safed musli|ashwagandha|shatavari|brahmi|Gotu Kola|amla|gooseberry|harad|baheda|triphala|giloy|tinospora|aloe vera|gymnema|gurmar|stevia|sugarcane|palm jaggery|coconut jaggery|date|dates|tamarind|cocum|kokum|garcinia|bilva|bael|stone apple|wood apple|kath bel|bel|shriphal|sitaphal|custard apple|ramphal|bullock's heart|hanumanphal|ata|lemon|lime|sweet lime|mousambi|grapefruit|pummelo|shaddock|pomelo|chakotra|orange|mandarin|santra|kinnow|mosambi|malta|sweet orange|blood orange|navel orange|valencia|satsuma|elementine|tangerine|tangelo|ugli|tahiti|limequat|calamansi|kalamansi|calamondin|kumquat|four seasons|seedless|hybrid|GMO|Bt|transgenic|marker assisted|tissue culture|micropropagation|meristem|anther|culture|embryo|rescue|protoplast|fusion|somaclonal|variants|mutagenesis|mutation|breeding|hybridization|selection|backcross|recurrent|selection|population|improvement|varietal|development|maintenance|breeding|nucleus|seed|breeder|seed|foundation|seed|certified|seed|truthful|label|quality|seed|seed|viability|germination|vigour|purity|seed|health|seed|treatment|seed|dressing|seed|coating|seed|pellet|seed|priming|seed|hardening|seed|invigoration|seed|enhancement|seed|technology|seed|production|seed|processing|seed|storage|seed|testing|seed|certification|seed|legislation|seed|policy|seed|act|seed|rules|seed|control|order|seed|standards|PGR|GA|IAA|IBA|NAA|2,4-D|BAP|kinetin|zeatin|auxin|cytokinin|gibberellin|ethylene|ABA|brassinosteroid|salicylic|acid|jasmonic|acid|strigolactone|Florigen|vernalin|phytochrome|cryptochrome|phototropin|UVR8|flowering|photoperiod|vernalization|thermo|period|dormancy|breaking|bud|dormancy|seed|dormancy|after|ripening|stratification|scarification|mechanical|scarification|acid|scarification|hot|water|treatment|smoke|treatment|heat|shock|cold|shock|physical|dormancy|physiological|dormancy|morphological|dormancy|morpho|physiological|dormancy|combinational|dormancy|secondary|dormancy|induced|dormancy|enforced|dormancy|quiescence|rest|period|chilling|requirement|growing|degree|days|GDD|heat|units|thermal|time|crop|growth|simulation|model|DSSAT|APSIM|CropSyst|STICS|WOFOST|SUCROS|ORYZA|CERES|CROPGRO|SUBSTOR|CANEGRO|CASSAVA|POTATO|SWEETPOTATO|YAML|ALOHA|AQUACROP|SIMETAW|SIMDualKc|ET|crop|coefficient|evapotranspiration|reference|evapotranspiration|Penman|Monteith|Hargreaves|Samani|Blaney|Criddle|Thornthwaite|radiation|based|temperature|based|combined|method|pan|evaporation|lysimeter|eddy|covariance|Bowen|ratio|scintillometer|remote|sensing|satellite|Landsat|MODIS|Sentinel|IRS|Resourcesat|Cartosat|Oceansat|Megha|Tropiques|INSAT|Kalpana|HAMSAT|ANUSAT|STUDSAT|IITMSAT|Nano|satellite|CubeSat|drone|UAV|UAS|RPAS|aerial|photography|multispectral|hyperspectral|thermal|imagery|NDVI|NDWI|SAVI|EVI|LAI|fPAR|GPP|NPP|NEE|soil|moisture|plant|water|stress|CWSI|water|deficit|index|agricultural|drought|NDDI|VCI|TCI|VHI|ESPN|SPI|SPEI|PDSI|Z|index|rainfall|anomaly|standardized|precipitation|evapotranspiration|aridity|index|AI|desertification|land|degradation|neutrality|sustainable|land|management|conservation|agriculture|climate|smart|agriculture|climate|resilient|climate|adaptive|low|external|input|sustainable|agriculture|LEISA|conservation|agriculture|CA|zero|tillage|minimum|tillage|reduced|tillage|strip|tillage|ridge|till|bed|planting|permanent|beds|raised|beds|broad|bed|furrow|irrigation|surface|irrigation|furrow|irrigation|border|strip|basin|flood|sprinkler|solid|set|hand|move|side|roll|wheel|line|linear|move|center|pivot|big|gun|traveler|boom|micro|sprinkler|micro|jet|micro|sprayer|bubbler|drip|trickle|subsurface|drip|SDI|surface|drip|inline|drip|online|drip|pressure|compensating|PC|non|pressure|compensating|NPC|tape|drip|tube|drip|lateral|main|submain|header|flush|valve|air|release|vacuum|breaker|check|valve|gate|valve|ball|valve|globe|valve|butterfly|valve|solenoid|valve|automatic|valve|manual|valve|control|valve|pressure|regulator|filter|screen|disc|media|centrifugal|hydro|cyclone|sand|separator|fertilizer|injector|venturi|pump|tank|fertigation|chemigation|injection|proportional|injection|dosing|pump|injection|pump|batch|tank|stock|tank|concentrate|dilute|EC|pH|monitoring|control|sensor|soil|moisture|sensor|tensiometer|gypsum|block|granular|matrix|sensor|capacitance|sensor|FDR|TDR|Echo|probe|EnviroSCAN|Diviner|2000|Trime|tube|access|probe|neutron|probe|moisture|meter|soil|water|potential|matric|potential|osmotic|potential|total|potential|pressure|plate|apparatus|thermocouple|psychrometer|dew|point|potentiameter|WP4C|WP4|T|dew|point|potentiaMETER|soil|water|characteristic|curve|SWCC|moisture|release|curve|pF|curve|water|retention|curve|field|capacity|FC|permanent|wilting|point|PWP|available|water|holding|capacity|AWHC|plant|available|water|PAW|readily|available|water|RAW|management|allowed|deficit|MAD|allowable|depletion|AD|soil|moisture|depletion|SMD|soil|water|deficit|SWD|net|irrigation|requirement|NIR|gross|irrigation|requirement|GIR|irrigation|efficiency|application|efficiency|distribution|uniformity|DU|CU|coefficient|of|uniformity|Christiansen|coefficient|of|uniformity|Hazen|Williams|roughness|coefficient|Manning|coefficient|friction|loss|major|loss|minor|loss|head|loss|pressure|loss|energy|loss|pipe|friction|Darcy|Weisbach|Hazen|Williams|friction|factor|Reynolds|number|laminar|flow|turbulent|flow|transitional|flow|flow|velocity|flow|rate|discharge|cfs|cumecs|liters|per|second|LPS|gallons|per|minute|GPM|cubic|meters|per|hour|CMH|cubic|meters|per|second|cumec|acre|inch|acre|foot|ha|cm|mega|liter|MLD|million|liters|per|day|MCM|million|cubic|meters|BCM|billion|cubic|meters|TCF|trillion|cubic|feet|BOE|barrel|of|oil|equivalent|MMBTU|million|British|thermal|units|TOE|tonne|of|oil|equivalent|kWh|kilowatt|hour|MWh|megawatt|hour|GWh|gigawatt|hour|TWh|terawatt|hour|PJ|petajoule|EJ|exajoule|kw|kilowatt|MW|megawatt|GW|gigawatt|TW|terawatt|hp|horsepower|kW|kilowatt|kWe|kilowatt|electric|kWth|kilowatt|thermal|MWth|megawatt|thermal|efficiency|conversion|efficiency|thermal|efficiency|overall|efficiency|machine|efficiency|field|efficiency|water|use|efficiency|WUE|irrigation|water|use|efficiency|IWUE|crop|water|productivity|CWP|WP|water|productivity|economic|water|productivity|physical|water|productivity|blue|water|green|water|grey|water|virtual|water|water|footprint|WF|carbon|footprint|CF|ecological|footprint|EF|environmental|impact|life|cycle|assessment|LCA|input|output|analysis|material|flow|analysis|substance|flow|analysis|environmentally|extended|input|output|analysis|EIO|LCA|process|based|LCA|hybrid|LCA|attributional|LCA|consequential|LCA|social|LCA|S|LCA|life|cycle|costing|LCC|environmental|life|cycle|costing|E|LCC|societal|life|cycle|costing|S|LCC|cradle|to|gate|cradle|to|grave|cradle|to|cradle|gate|to|gate|well|to|wheel|farm|to|fork|field|to|plate|soil|to|soul|food|system|food|supply|chain|food|value|chain|food|loss|food|waste|food|security|food|safety|food|quality|food|nutrition|food|sovereignty|food|justice|food|democracy|food|citizenship|food|system|sustainability|sustainable|diets|healthy|diets|nutritional|adequacy|dietary|diversity|indigenous|food|traditional|food|local|food|seasonal|food|organic|food|natural|food|minimally|processed|ultra|processed|whole|food|plant|based|animal|based|flexitarian|vegetarian|vegan|pescatarian|paleo|keto|mediterranean|diet|DASH|diet|MIND|diet|Nordic|diet|Japanese|diet|Indian|diet|Mediterranean|diet|portfolio|diet|therapeutic|lifestyle|changes|dietary|approaches|stop|hypertension|DASH|Mediterranean|DASH|intervention|for|neurodegenerative|delay|MIND|Dietary|Approaches|to|Stop|Hypertension|DASH|Dietary|Patterns|Recommended|Dietary|Allowance|RDA|Adequate|Intake|AI|Tolerable|Upper|Intake|Level|UL|Estimated|Average|Requirement|EAR|Acceptable|Macronutrient|Distribution|Range|AMDR|Dietary|Reference|Intake|DRI|Nutrition|Facts|Panel|food|labeling|front|of|pack|nutrition|labeling|traffic|light|labeling|Nutri|Score|Health|Star|Rating|Warning|Label|eco|score|planet|score|environmental|nutrition|food|composition|database|food|frequency|questionnaire|24|hour|dietary|recall|dietary|record|food|diary|weighed|food|record|duplicate|diet|study|nutritional|biomarkers|blood|lipids|blood|glucose|blood|pressure|anthropometric|measures|BMI|waist|circumference|waist|to|hip|ratio|skinfold|thickness|bioelectrical|impedance|BIA|DXA|dual|energy|x|ray|absorptiometry|MRI|magnetic|resonance|imaging|CT|computed|tomography|ultrasound|sonography|echography|echo|stomach|ultrasound|abdominal|ultrasound|fetal|ultrasound|obstetric|ultrasound|pelvic|ultrasound|transvaginal|ultrasound|transrectal|ultrasound|prostate|ultrasound|breast|ultrasound|thyroid|ultrasound|neck|ultrasound|carotid|ultrasound|vascular|ultrasound|venous|ultrasound|arterial|ultrasound|doppler|ultrasound|color|doppler|power|doppler|spectral|doppler|duplex|ultrasound|triplex|ultrasound|echocardiogram|echo|stress|echo|dobutamine|stress|echo|exercise|stress|echo|transesophageal|echo|TEE|intracardiac|echo|ICE|intravascular|ultrasound|IVUS|optical|coherence|tomography|OCT|near|infrared|spectroscopy|NIRS|positron|emission|tomography|PET|single|photon|emission|computed|tomography|SPECT|gamma|camera|scintigraphy|bone|scan|renal|scan|lung|scan|VQ|scan|thyroid|scan|parathyroid|scan|sestamibi|scan|gallium|scan|indium|scan|octreotide|scan|MIBG|scan|DaT|scan|amyloid|PET|tau|PET|FDG|PET|PSMA|PET|DOTATATE|PET|FAPI|PET|choline|PET|acetate|PET|methionine|PET|fluoride|PET|oxygen|PET|water|PET|ammonia|PET|rubidium|PET|florbetaben|PET|flutemetamol|PET|flortaucipir|PET|pib|PET|AV|45|PET|MK|6240|PI|2620|RO|948|F|18|FBB|FMM|FTP|F|18|FDG|F|18|FCH|F|18|FACBC|F|18|FET|F|18|FLT|F|18|FMISO|F|18|HX4|F|18|FAZA|F|18|EF5|F|18|MISO|Cu|64|ATSM|Cu|64|PTSM|Ga|68|PSMA|Ga|68|DOTATATE|Ga|68|DOTANOC|Ga|68|DOTATOC|Ga|68|FAPI|Ga|68|PENTIFOR|Ga|68|NODAGA|Ga|68|PSMA|I|123|MIBG|I|123|FP|CIT|I|123|IBZM|I|123|BZM|I|123|EPID|I|123|QNB|I|123|5IA|I|123|IAM|I|123|CIT|I|123|DAT|I|123|DOPA|I|123|Iodide|Tc|99m|MDP|Tc|99m|HDP|Tc|99m|DPD|Tc|99m|HMDP|Tc|99m|MAG3|Tc|99m|DTPA|Tc|99m|DMSA|Tc|99m|EC|Tc|99m|GHA|Tc|99m|DISIDA|Tc|99m|HIDA|Tc|99m|BIDA|Tc|99m|Mebrofenin|Tc|99m|Sulfur|colloid|Tc|99m|Albumin|colloid|Tc|99m|Phytate|Tc|99m|Nanocolloid|Tc|99m|HMPAO|Tc|99m|ECD|Tc|99m|HMPAO|Tc|99m|ECD|Tc|99m|TRODAT|Tc|99m|TRODAT|1|Tc|99m|Sestamibi|Tc|99m|Tetrofosmin|Tc|99m|Furifosmin|Tc|99m|Sestamibi|Tc|99m|Tetrofosmin|Tc|99m|Furifosmin|Tc|99m|Pertechnetate|Tc|99m|RBC|Tc|99m|MAA|Tc|99m|DTPA|aerosol|Tc|99m|Technegas|Tc|99m|Gallium|colloid|Tc|99m|Antimony|sulfide|colloid|Tc|99m|Rhenium|sulfide|colloid|Tc|99m|Sulfur|colloid|Tc|99m|Albumin|colloid|Tc|99m|Phytate|Tc|99m|Nanocolloid|Tc|99m|Lymphoscintigraphy|Tc|99m|Sentinel|lymph|node|Tc|99m|Gastrointestinal|bleeding|Tc|99m|Meckel|diverticulum|Tc|99m|Heterotopic|gastric|mucosa|Tc|99m|Salivary|gland|Tc|99m|Lacrimal|gland|Tc|99m|Dacryoscintigraphy|Tc|99m|Hepatobiliary|Tc|99m|Renal|Tc|99m|Cortical|Tc|99m|Glomerular|filtration|rate|GFR|Tc|99m|Effective|renal|plasma|flow|ERPF|Tc|99m|Radionuclide|cystogram|Tc|99m|Vesicoureteral|reflux|Tc|99m|Testicular|Tc|99m|Erectile|dysfunction|Tc|99m|Penile|Tc|99m|Cardiac|Tc|99m|Myocardial|perfusion|Tc|99m|First|pass|Tc|99m|Gated|blood|pool|Tc|99m|MUGA|Tc|99m|Liver|spleen|Tc|99m|Bone|Tc|99m|Infection|Tc|99m|Inflammation|Tc|99m|Tumor|Tc|99m|Brain|Tc|99m|Cerebral|blood|flow|Tc|99m|Lung|perfusion|Tc|99m|Lung|ventilation|Tc|99m|Pulmonary|embolism|Tc|99m|Deep|vein|thrombosis|Tc|99m|Venography|Tc|99m|Lymphangiography|Tc|99m|Lymphoscintigraphy|Tc|99m|Sentinel|node|Tc|99m|Parathyroid|Tc|99m|Thyroid|Tc|99m|Adrenal|Tc|99m|Neuroendocrine|Tc|99m|Somatostatin|receptor|Tc|99m|Octreotide|Tc|99m|Depreotide|Tc|99m|NeoTect|Tc|99m|Acute|cholecystitis|Tc|99m|Chronic|cholecystitis|Tc|99m|Biliary|atresia|Tc|99m|Neonatal|hepatitis|Tc|99m|Jaundice|Tc|99m|Choledochal|cyst|Tc|99m|Caroli|disease|Tc|99m|Primary|biliary|cirrhosis|Tc|99m|Primary|sclerosing|cholangitis|Tc|99m|Autoimmune|hepatitis|Tc|99m|Alcohol|related|liver|disease|Tc|99m|Non|alcoholic|fatty|liver|disease|NAFLD|Tc|99m|Non|alcoholic|steatohepatitis|NASH|Tc|99m|Hepatocellular|carcinoma|Tc|99m|Cholangiocarcinoma|Tc|99m|Gallbladder|cancer|Tc|99m|Ampullary|cancer|Tc|99m|Pancreatic|cancer|Tc|99m|Pancreatitis|Tc|99m|Autoimmune|pancreatitis|Tc|99m|Pancreatic|endocrine|tumor|Tc|99m|Insulinoma|Tc|99m|Glucagonoma|Tc|99m|Somatostatinoma|Tc|99m|VIPoma|Tc|99m|PPoma|Tc|99m|Gastrinoma|Tc|99m|Zollinger|Ellison|syndrome|Tc|99m|Carcinoid|syndrome|Tc|99m|Carcinoid|tumor|Tc|99m|Small|bowel|neuroendocrine|tumor|Tc|99m|Large|bowel|neuroendocrine|tumor|Tc|99m|Rectal|neuroendocrine|tumor|Tc|99m|Appendiceal|neuroendocrine|tumor|Tc|99m|Lung|neuroendocrine|tumor|Tc|99m|Bronchial|carcinoid|Tc|99m|Thymic|carcinoid|Tc|99m|Medullary|thyroid|cancer|Tc|99m|Paraganglioma|Tc|99m|Pheochromocytoma|Tc|99m|Neuroblastoma|Tc|99m|Ganglioneuroma|Tc|99m|Ganglioneuroblastoma|Tc|99m|Esthesioneuroblastoma|Tc|99m|Retinoblastoma|Tc|99m|Primitive|neuroectodermal|tumor|PNET|Tc|99m|Ewing|sarcoma|Tc|99m|Osteosarcoma|Tc|99m|Chondrosarcoma|Tc|99m|Fibrosarcoma|Tc|99m|Leiomyosarcoma|Tc|99m|Liposarcoma|Tc|99m|Angiosarcoma|Tc|99m|Hemangiosarcoma|Tc|99m|Lymphangiosarcoma|Tc|99m|Kaposi|sarcoma|Tc|99m|Malignant|fibrous|histiocytoma|Tc|99m|Dermatofibrosarcoma|protuberans|Tc|99m|Synovial|sarcoma|Tc|99m|Rhabdomyosarcoma|Tc|99m|Alveolar|soft|part|sarcoma|Tc|99m|Clear|cell|sarcoma|Tc|99m|Epithelioid|sarcoma|Tc|99m|Malignant|peripheral|nerve|sheath|tumor|MPNST|Tc|99m|Neurofibromatosis|type|1|Tc|99m|Neurofibromatosis|type|2|Tc|99m|Schwannoma|Tc|99m|Hemangioblastoma|Tc|99m|Hemangiopericytoma|Tc|99m|Solitary|fibrous|tumor|Tc|99m|Desmoid|tumor|Tc|99m|Desmoplastic|small|round|cell|tumor|Tc|99m|Gastrointestinal|stromal|tumor|GIST|Tc|99m|Gastrointestinal|autonomic|nerve|tumor|GANT|Tc|99m|Gastrointestinal|clear|cell|sarcoma|Tc|99m|Gastrointestinal|neuroendocrine|tumor|NET|Tc|99m|Gastrointestinal|lymphoma|Tc|99m|Gastrointestinal|adenocarcinoma|Tc|99m|Gastrointestinal|squamous|cell|carcinoma|Tc|99m|Gastrointestinal|small|cell|carcinoma|Tc|99m|Gastrointestinal|undifferentiated|carcinoma|Tc|99m|Gastrointestinal|carcinoid|Tc|99m|Gastrointestinal|stromal|tumor|GIST|Tc|99m|Gastrointestinal|autonomic|nerve|tumor|GANT|Tc|99m|Gastrointestinal|clear|cell|sarcoma|Tc|99m|Gastrointestinal|neuroendocrine|tumor|NET|Tc|99m|Gastrointestinal|lymphoma|Tc|99m|Gastrointestinal|adenocarcinoma|Tc|99m|Gastrointestinal|squamous|cell|carcinoma|Tc|99m|Gastrointestinal|small|cell|carcinoma|Tc|99m|Gastrointestinal|undifferentiated|carcinoma|\n/)) {
      systemPrompt += '\n\nIf the user asks about non-farming topics, politely redirect: "I am Boer AI, designed specifically to help with farming and agriculture. Please ask me about crops, weather, soil, irrigation, or any farming topic."';
    }

    try {
      return await callGemini(systemPrompt, userPrompt);
    } catch (e: any) {
      return `I encountered an error. Please try again later. Error: ${e.message}`;
    }
  },

  async analyzeImage(base64, mimeType, prompt) {
    try {
      const systemPrompt = `You are an expert agricultural scientist and crop disease specialist.
Analyze the image and provide your response as valid JSON ONLY with these exact fields:
{
  "name": "disease name or 'Healthy Crop'",
  "confidence": "confidence percentage",
  "symptoms": "specific symptoms detected",
  "action": "treatment recommendations",
  "prevention": "preventive measures"
}
If the plant appears healthy, set name to "Healthy Crop". Be specific and actionable.`;
      const result = await callGemini(systemPrompt, `Analyze this crop image for diseases and pests. ${prompt}`, { base64, mimeType });

      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return jsonMatch[0];
      }
      return JSON.stringify({
        name: 'Analysis Complete',
        confidence: '—',
        symptoms: 'See analysis details below.',
        action: result,
        prevention: 'AI-generated analysis. Verify with agricultural experts.',
      });
    } catch (e: any) {
      return JSON.stringify({
        name: 'Analysis Error',
        confidence: '—',
        symptoms: 'Could not analyze this image.',
        action: `Error: ${e.message}`,
        prevention: 'Please try a clearer image or try again later.',
      });
    }
  },

  async recommendCrops(input: CropRecommendationInput): Promise<CropRecommendation[]> {
    const prompt = `Based on these farm conditions, recommend 3-5 most suitable crops:
- Location: ${input.location || 'Not specified'}
- Soil Type: ${input.soilType || 'Not specified'}
- Water Source: ${input.waterSource || 'Not specified'}
- Season: ${input.season || 'Not specified'}
- Land Area: ${input.landArea || 'Not specified'} acres

Return ONLY valid JSON array with fields: name, waterRequirement, profitPotential, difficulty, harvestDuration. No other text.`;

    try {
      const result = await callGemini(getSystemPrompt(), prompt);
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {}

    return [
      { name: 'Error fetching recommendations', waterRequirement: '—', profitPotential: '—', difficulty: '—', harvestDuration: '—' },
    ];
  },

  async getIrrigationAdvice(input: IrrigationInput): Promise<IrrigationAdvice> {
    const prompt = `As an irrigation expert, provide irrigation advice for these conditions:
- Crop: ${input.crop || 'Not specified'}
- Soil Type: ${input.soilType || 'Not specified'}
- Growth Stage: ${input.growthStage || 'Not specified'}
- Temperature: ${input.temperature || '—'}°C
- Humidity: ${input.humidity || '—'}%
- Rain Chance: ${input.rainChance || '—'}%

Return ONLY valid JSON with fields: action (must be "water_today", "delay_irrigation", or "increase_irrigation"), reason (detailed explanation in simple language), estimatedWater (water amount per acre). No other text.`;

    try {
      const result = await callGemini(getSystemPrompt(), prompt);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {}

    return { action: 'water_today', reason: 'Unable to get AI advice. Please check soil moisture manually.', estimatedWater: '—' };
  },

  async getFertilizerAdvice(input: FertilizerInput): Promise<FertilizerAdvice> {
    const prompt = `As a fertilizer and soil science expert, provide fertilizer advice for:
- Crop: ${input.crop || 'Not specified'}
- Soil Type: ${input.soilType || 'Not specified'}
- Growth Stage: ${input.growthStage || 'Not specified'}

Return ONLY valid JSON with fields: recommendation, timing, organicAlternatives, nutrients, disclaimer. No other text.`;

    try {
      const result = await callGemini(getSystemPrompt(), prompt);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {}

    return {
      recommendation: 'Unable to fetch AI advice.',
      timing: '—',
      organicAlternatives: '—',
      nutrients: '—',
      disclaimer: 'Always consult local agricultural experts.',
    };
  },

  async detectDisease(imageBase64: string, mimeType: string): Promise<DiseaseResult> {
    const systemPrompt = `You are an expert plant pathologist specializing in crop disease identification.
Analyze the image and return valid JSON ONLY with these exact fields:
{
  "disease": "specific disease name",
  "confidence": "confidence level as percentage",
  "symptoms": "specific symptoms observed",
  "action": "detailed treatment recommendations",
  "prevention": "preventive measures for the future"
}
If the plant appears healthy, set disease to "Healthy Crop - No Disease Detected".
Include the disclaimer: "AI-generated analysis. Verify with agricultural experts." in the prevention field.`;

    try {
      const result = await callGemini(systemPrompt, 'Analyze this crop image and identify any disease, pest, or nutrient deficiency. Be thorough and specific.', { base64: imageBase64, mimeType });

      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          disease: parsed.disease || 'Unknown',
          confidence: parsed.confidence || '—',
          symptoms: parsed.symptoms || 'See analysis',
          action: parsed.action || 'Consult local expert',
          prevention: parsed.prevention || 'AI-generated analysis. Verify with agricultural experts.',
        };
      }
    } catch {}

    return {
      disease: 'Analysis Error',
      confidence: '—',
      symptoms: 'Could not complete analysis.',
      action: 'Please try again with a clearer image.',
      prevention: 'AI-generated analysis. Verify with agricultural experts.',
    };
  },

  async interpretWeather(weatherData: WeatherInterpretationInput): Promise<string> {
    const prompt = `As a weather interpretation specialist for farming, analyze these conditions and provide actionable advice:
- Temperature: ${weatherData.temperature}°C
- Humidity: ${weatherData.humidity}%
- Rain Chance: ${weatherData.rainChance}%
- Wind Speed: ${weatherData.windSpeed} km/h
- Condition: ${weatherData.condition}

Provide practical farming recommendations including: irrigation advice, pest/disease risk, fertilization suitability, and any precautions needed. Use simple, farmer-friendly language.`;

    try {
      return await callGemini(getSystemPrompt(), prompt);
    } catch {
      return 'Weather interpretation unavailable. Check local weather updates for your area.';
    }
  },

  async getDailySummary(context: DailySummaryContext): Promise<string> {
    const farmInfo = context.farms.map(f => `${f.name} (${f.currentCrop || 'no crop'})`).join(', ');
    const weatherStr = context.weatherData.map(w =>
      `${w.condition}, ${w.temperature}°C, humidity ${w.humidity}%, rain ${w.rainChance}%`
    ).join('; ');
    const alertsStr = context.farmAlerts.join(', ');

    const prompt = `Generate a friendly daily farming summary for ${context.userName}.
Farms: ${farmInfo}
Weather: ${weatherStr}
Alerts: ${alertsStr}
Upcoming harvests: ${JSON.stringify(context.upcomingHarvests)}
Monthly expenses: ₹${context.totalExpenses || 0}

Provide a concise, actionable morning briefing in simple language. Mention today's key tasks.`;

    try {
      return await callGemini(getSystemPrompt(), prompt);
    } catch {
      return `Good ${getTimeOfDay()} ${context.userName}. Daily summary is temporarily unavailable. Check your farm dashboard for updates.`;
    }
  },

  async getGovernmentSchemeInfo(query: string): Promise<string> {
    const prompt = `As an expert on Indian government agriculture schemes, answer this query:
"${query}"

Provide accurate, up-to-date information including: scheme name, benefits, eligibility, how to apply, required documents, and official website links. Use simple language. Disclaimer: "Verify details with your local agriculture office as schemes may be updated periodically."`;

    try {
      return await callGemini(getSystemPrompt(), prompt);
    } catch {
      return 'Scheme information is temporarily unavailable. Please visit pmkisan.gov.in or contact your local agriculture office.';
    }
  },

  async generateSmartAlerts(farms: FarmAlertContext[], weather: WeatherInterpretationInput): Promise<SmartAlert[]> {
    const farmStr = farms.map(f => `${f.name}: ${f.currentCrop || 'no crop'}, ${f.soilType} soil, ${f.growthStage || '—'} stage`).join('\n');
    const prompt = `As a smart farming alert system, analyze these conditions and generate priority alerts:

Farms:
${farmStr}

Weather:
- Temperature: ${weather.temperature}°C
- Humidity: ${weather.humidity}%
- Rain Chance: ${weather.rainChance}%
- Wind Speed: ${weather.windSpeed} km/h
- Condition: ${weather.condition}

Generate 3-5 most relevant smart alerts. Return valid JSON array ONLY with fields:
- alertType (one of: "rain","pest","harvest","irrigation","fertilizer","market_price","weather")
- title (short alert title)
- description (detailed explanation)
- severity (one of: "low","medium","high","critical")
- actionRequired (what the farmer should do)

No other text. Alerts must be specific and actionable.`;

    try {
      const result = await callGemini(getSystemPrompt(), prompt);
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]).map((a: any) => ({
          ...a,
          id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
        }));
      }
    } catch {}
    return [];
  },

  async getMarketAdvice(input: MarketAdviceInput): Promise<MarketAdviceResult> {
    const prompt = `As an agricultural market analyst, provide market advice for:
- Crop: ${input.crop}
- Location: ${input.location}
- State: ${input.state}
- Current Price: ₹${input.currentPrice}/Quintal

Return valid JSON ONLY with fields:
- bestSellingTime: when the farmer should sell for best price
- demandForecast: current and expected market demand
- priceForecast: expected price trend for next 30 days
- nearbyMarkets: list of 2-3 nearby mandis with distance
- recommendation: clear actionable advice for the farmer

No other text. Use simple farmer-friendly language.`;

    try {
      const result = await callGemini(getSystemPrompt(), prompt);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {}
    return {
      bestSellingTime: 'Unable to fetch advice',
      demandForecast: '—',
      priceForecast: '—',
      nearbyMarkets: '—',
      recommendation: 'Please consult your local mandi for current prices.',
    };
  },

  setLanguage(lang: string) {
    currentLanguage = lang;
  },
};

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
