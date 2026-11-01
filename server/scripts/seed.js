const dotenv = require("dotenv");
dotenv.config();

const { connectDB } = require("../../lib/db");
const User = require("../models/User");
const Category = require("../models/Category");
const Tag = require("../models/Tag");
const Article = require("../models/Article");
const Ticker = require("../models/Ticker");
const Video = require("../models/Video");
const PhotoGallery = require("../models/PhotoGallery");
const LiveBlog = require("../models/LiveBlog");
const Page = require("../models/Page");
const Setting = require("../models/Setting");
const Ad = require("../models/Ad");

async function seed(exitOnComplete = true) {
  console.log("--- Starting Swar Media Database Seeding ---");
  await connectDB();

  // Clear existing data
  console.log("Clearing existing collections...");
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Tag.deleteMany({}),
    Article.deleteMany({}),
    Ticker.deleteMany({}),
    Video.deleteMany({}),
    PhotoGallery.deleteMany({}),
    LiveBlog.deleteMany({}),
    Page.deleteMany({}),
    Setting.deleteMany({}),
    Ad.deleteMany({}),
  ]);

  // 1. Create Users
  console.log("Creating administrative users...");
  const superAdmin = await User.create({
    name: "Rajesh Sharma (प्रधान संपादक)",
    email: "admin@bharatvarta.in",
    password: "AdminPassword123!",
    role: "superadmin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    bio: "Senior Journalist with over 20 years of experience covering Indian national politics.",
    bioHi: "भारतीय राजनीति और कूटनीति के विशेषज्ञ, 20 वर्षों से अधिक का खोजी पत्रकारिता अनुभव।",
  });

  const editor = await User.create({
    name: "Priya Verma (वरिष्ठ संपादक)",
    email: "editor@bharatvarta.in",
    password: "EditorPassword123!",
    role: "editor",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    bio: "Lead Editor overseeing economy, business, and tech coverage.",
    bioHi: "व्यापार, अर्थव्यवस्था और तकनीक मामलों की विशेषज्ञ संपादक।",
  });

  const reporter = await User.create({
    name: "Amit Patel (विशेष संवाददाता)",
    email: "reporter@bharatvarta.in",
    password: "ReporterPassword123!",
    role: "reporter",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    bio: "Field reporter covering sports and current national affairs.",
    bioHi: "मैदानी संवाददाता, राष्ट्रीय घटनाओं और खेल जगत की लाइव रिपोर्टिंग।",
  });

  // 2. Create Categories
  console.log("Creating news categories...");
  const categoriesData = [
    { name: "India", nameHi: "देश", slug: "india", color: "#dc2626", order: 1 },
    { name: "Politics", nameHi: "राजनीति", slug: "politics", color: "#b91c1c", order: 2 },
    { name: "World", nameHi: "दुनिया", slug: "world", color: "#2563eb", order: 3 },
    { name: "Sports", nameHi: "खेल", slug: "sports", color: "#16a34a", order: 4 },
    { name: "Entertainment", nameHi: "मनोरंजन", slug: "entertainment", color: "#9333ea", order: 5 },
    { name: "Business", nameHi: "बिज़नेस", slug: "business", color: "#ea580c", order: 6 },
    { name: "Technology", nameHi: "टेक", slug: "technology", color: "#0891b2", order: 7 },
    { name: "Opinion", nameHi: "विचार", slug: "opinion", color: "#475569", order: 8 },
  ];

  const catMap = {};
  for (const cat of categoriesData) {
    const created = await Category.create(cat);
    catMap[cat.slug] = created;
  }

  // 3. Create Tags
  console.log("Creating tags...");
  const tagsData = [
    { name: "Breaking News", nameHi: "ताज़ा खबर", slug: "breaking-news" },
    { name: "Election 2026", nameHi: "चुनाव 2026", slug: "election-2026" },
    { name: "Cricket", nameHi: "क्रिकेट", slug: "cricket" },
    { name: "Economy", nameHi: "अर्थव्यवस्था", slug: "economy" },
    { name: "Bollywood", nameHi: "बॉलीवुड", slug: "bollywood" },
    { name: "AI Tech", nameHi: "एआई तकनीक", slug: "ai-tech" },
  ];

  const tagMap = {};
  for (const t of tagsData) {
    const created = await Tag.create(t);
    tagMap[t.slug] = created;
  }

  // 4. Create Breaking Tickers
  console.log("Creating breaking tickers...");
  await Ticker.create([
    {
      text: "Breaking: ISRO announces ambitious new deep-space interplanetary exploration mission schedule.",
      textHi: "ब्रेकिंग: इसरो ने नए डीप-स्पेस इंटरप्लेनेटरी मिशन के शेड्यूल की घोषणा की, वैज्ञानिकों में भारी उत्साह।",
      link: "/india/isro-deep-space-mission",
      priority: 5,
      isActive: true,
    },
    {
      text: "Sensex touches record milestone crossing 85,000 points as tech and banking stocks surge.",
      textHi: "सेंसेक्स 85,000 के पार ऐतिहासिक स्तर पर पहुंचा, आईटी और बैंकिंग सेक्टर में शानदार तेजी।",
      link: "/business/sensex-historic-high",
      priority: 4,
      isActive: true,
    },
    {
      text: "T20 Championship: India seals thrilling final-over victory in high-voltage clash.",
      textHi: "टी20 चैम्पियनशिप: रोमांचक अंतिम ओवर में भारत की शानदार जीत, पूरे देश में जश्न का माहौल।",
      link: "/sports/india-t20-thrilling-victory",
      priority: 3,
      isActive: true,
    },
  ]);

  // 5. Create Rich Articles
  console.log("Creating sample articles...");
  const sampleArticles = [
    {
      title: "संसद का विशेष सत्र: आर्थिक सुधारों और डिजिटल भारत पर नए विधेयक पेश होने के संकेत",
      subtitle: "प्रधानमंत्री ने सत्र से पूर्व सभी राजनीतिक दलों से सकारात्मक चर्चा का आह्वान किया",
      slug: "parliament-special-session-economic-reforms",
      language: "hi",
      category: catMap["politics"]._id,
      author: superAdmin._id,
      tags: [tagMap["breaking-news"]._id, tagMap["election-2026"]._id],
      featuredImage: {
        url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
        caption: "संसद भवन नई दिल्ली में विशेष सत्र की तैयारियाँ।",
        alt: "संसद भवन नई दिल्ली",
      },
      content: `
        <p><strong>नई दिल्ली:</strong> संसद के आगामी विशेष सत्र को लेकर राजनीतिक गलियारों में सरगर्मी तेज हो गई है। सूत्रों के अनुसार सरकार इस सत्र में देश के आर्थिक ढांचे को नई ऊर्जा देने वाले कई ऐतिहासिक विधेयक पेश करने की तैयारी में है।</p>
        <p>सत्र के शुभारंभ से पहले उच्चस्तरीय सर्वदलीय बैठक आयोजित की गई जिसमें विधायी कामकाज और जनहित के अहम मुद्दों पर सहमति बनाने की कोशिश की गई। प्रधानमंत्री ने मीडिया को संबोधित करते हुए कहा कि भारत विश्व की तीसरी सबसे बड़ी आर्थिक महाशक्ति बनने की राह पर तेजी से अग्रसर है और यह सत्र देश के भविष्य की नींव को मजबूत करेगा।</p>
        <h3>डिजिटल इंफ्रास्ट्रक्चर और निवेश पर जोर</h3>
        <p>प्रस्तावित विधेयकों में घरेलू विनिर्माण को बढ़ावा देने, सेमीकंडक्टर हब के विस्तार और युवाओं के लिए नए रोजगार सृजन के प्रावधान शामिल हैं। वित्त मंत्रालय ने संकेत दिया है कि कर प्रणाली के सरलीकरण पर भी विशेष ध्यान दिया जाएगा।</p>
        <blockquote>"सदन लोकतंत्र का मंदिर है जहाँ सार्थक वाद-विवाद से राष्ट्र निर्माण का मार्ग प्रशस्त होता है।"</blockquote>
        <p>विपक्षी दलों ने भी जनहित से जुड़े मुद्दों, किसानों की समस्याओं और महंगाई पर चर्चा की मांग रखी है।</p>
      `,
      excerpt: "संसद के विशेष सत्र में देश की अर्थव्यवस्था और डिजिटल संरचना को बढ़ावा देने वाले कई ऐतिहासिक विधेयकों पर होगी गहन चर्चा।",
      status: "published",
      publishedAt: new Date(),
      isBreaking: true,
      isFeatured: true,
      isTopStory: true,
      isTrending: true,
      viewCount: 14890,
      readingTime: 3,
    },
    {
      title: "इसरो का नया इतिहास: सौर मंडल के रहस्यों को उजागर करने निकला नया अंतरिक्ष यान",
      subtitle: "श्रीहरिकोटा से स्वदेशी हेवी-लिफ्ट रॉकेट का सफल प्रक्षेपण, वैज्ञानिकों ने मनाया जश्न",
      slug: "isro-deep-space-mission",
      language: "hi",
      category: catMap["india"]._id,
      author: reporter._id,
      tags: [tagMap["breaking-news"]._id, tagMap["ai-tech"]._id],
      featuredImage: {
        url: "https://images.unsplash.com/photo-1517976487502-5f7956895c37?auto=format&fit=crop&w=1200&q=80",
        caption: "सतीश धवन अंतरिक्ष केंद्र से रॉकेट का भव्य प्रक्षेपण।",
        alt: "रॉकेट प्रक्षेपण",
      },
      content: `
        <p><strong>श्रीहरिकोटा:</strong> भारतीय अंतरिक्ष अनुसंधान संगठन (ISRO) ने एक बार फिर इतिहास रचते हुए अपने अत्याधुनिक गहरे अंतरिक्ष अन्वेषण यान को कक्षा में सफलतापूर्वक स्थापित कर दिया है।</p>
        <p>सुबह ठीक 6 बजकर 20 मिनट पर शक्तिशाली जीएसएलवी रॉकेट ने गर्जना के साथ आसमान की ओर उड़ान भरी। मिशन कंट्रोल सेंटर में बैठे वैज्ञानिकों के चेहरे खुशी से खिल उठे जब यान ने निर्धारित समय पर रॉकेट से अलग होकर अपनी कक्षा में प्रवेश किया।</p>
        <p>यह यान सौर हवाओं, चुंबकीय क्षेत्रों और बाह्य अंतरिक्ष के रेडिएशन का गहन अध्ययन करेगा। पूरी दुनिया के वैज्ञानिकों की नजरें इस मिशन के डेटा पर टिकी हुई हैं।</p>
      `,
      excerpt: "श्रीहरिकोटा के सतीश धवन अंतरिक्ष केंद्र से इसरो के नवीनतम डीप स्पेस प्रोब का सफल प्रक्षेपण।",
      status: "published",
      publishedAt: new Date(Date.now() - 3600000 * 2),
      isTopStory: true,
      isTrending: true,
      viewCount: 9420,
      readingTime: 3,
    },
    {
      title: "Champions Trophy: Team India Announces 15-Member Squad Led by Rohit Sharma",
      subtitle: "Young pace sensation and mystery spinner earn maiden call-ups after stellar domestic season",
      slug: "india-champions-trophy-squad-announcement",
      language: "en",
      category: catMap["sports"]._id,
      author: reporter._id,
      tags: [tagMap["cricket"]._id],
      featuredImage: {
        url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
        caption: "Team India training session under floodlights ahead of tournament opener.",
        alt: "Cricket stadium",
      },
      content: `
        <p><strong>Mumbai:</strong> The Board of Control for Cricket in India (BCCI) on Sunday unveiled a balanced and formidable 15-player squad for the upcoming ICC Champions Trophy.</p>
        <p>Rohit Sharma will captain the side with Hardik Pandya serving as vice-captain. The selection committee highlighted a perfect mix of seasoned match-winners and explosive young talent capable of adapting to varying pitch conditions.</p>
        <p>The pace attack will be spearheaded by Jasprit Bumrah and Mohammed Shami, accompanied by a potent spin duo. The tournament gets underway next month with India facing arch-rivals in the marquee clash.</p>
      `,
      excerpt: "BCCI announces balanced 15-member Indian squad with ideal blend of experience and youthful dynamism.",
      status: "published",
      publishedAt: new Date(Date.now() - 3600000 * 5),
      isFeatured: true,
      isTrending: true,
      viewCount: 18230,
      readingTime: 2,
    },
    {
      title: "शेयर बाजार में रिकॉर्ड उछाल: सेंसेक्स 85,000 के ऐतिहासिक शिखर पर, निवेशकों की बल्ले-बल्ले",
      subtitle: "आईटी, ऑटो और विदेशी संस्थागत निवेशकों की भारी लिवाली से बाजार में शानदार बूम",
      slug: "sensex-historic-high",
      language: "hi",
      category: catMap["business"]._id,
      author: editor._id,
      tags: [tagMap["economy"]._id],
      featuredImage: {
        url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
        caption: "मुंबई स्टॉक एक्सचेंज पर तेजी का माहौल।",
        alt: "स्टॉक मार्केट चार्ट",
      },
      content: `
        <p><strong>मुंबई:</strong> भारतीय शेयर बाजार ने आज नया कीर्तिमान स्थापित कर दिया है। बीएसई सेंसेक्स पहली बार 85,000 अंक के मनोवैज्ञानिक आंकड़े को पार कर गया, वहीं निफ्टी भी 26,000 के पार बंद हुआ।</p>
        <p>वैश्विक बाजारों से मिले मजबूत संकेतों और घरेलू कंपनियों के शानदार तिमाही नतीजों के दम पर आज बाजार में चौतरफा लिवाली देखने को मिली। विशेषज्ञों का मानना है कि भारत की मजबूत जीडीपी ग्रोथ निवेशकों के विश्वास को लगातार नई ऊँचाइयाँ दे रही है।</p>
      `,
      excerpt: "घरेलू बाजार में जबरदस्त उछाल, सेंसेक्स और निफ्टी ने बनाया अब तक का सबसे बड़ा रिकॉर्ड।",
      status: "published",
      publishedAt: new Date(Date.now() - 3600000 * 8),
      isTopStory: true,
      viewCount: 6540,
      readingTime: 2,
    },
    {
      title: "Global AI Summit 2026: Next-Gen Autonomous Systems Take Center Stage",
      subtitle: "Tech leaders convene to address ethical AI boundaries and breakthrough quantum architectures",
      slug: "global-ai-summit-2026",
      language: "en",
      category: catMap["technology"]._id,
      author: editor._id,
      tags: [tagMap["ai-tech"]._id],
      featuredImage: {
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
        caption: "Modern artificial intelligence exhibition hall showcasing neural engines.",
        alt: "Artificial Intelligence Visuals",
      },
      content: `
        <p><strong>New Delhi:</strong> Leaders from the world's foremost technology enterprises gathered for the flagship Global AI Summit 2026, showcasing revolutionary multimodal intelligence, healthcare diagnostic breakthroughs, and decentralized computing platforms.</p>
        <p>Keynotes emphasized that human-centric governance will remain paramount as foundation models scale into enterprise production workflows worldwide.</p>
      `,
      excerpt: "Breakthrough advancements in machine intelligence and quantum architectures unveil the future of automation.",
      status: "published",
      publishedAt: new Date(Date.now() - 3600000 * 12),
      isFeatured: true,
      viewCount: 7890,
      readingTime: 3,
    },
    {
      title: "बॉक्स ऑफिस पर महाधमाका: नई पैन-इंडिया एक्शन थ्रिलर ने पहले दिन तोड़े कमाई के सभी रिकॉर्ड",
      subtitle: "दर्शकों का शानदार रिस्पॉन्स, सिनेमाघरों के बाहर हाउसफुल के बोर्ड",
      slug: "box-office-blockbuster-record-breaking",
      language: "hi",
      category: catMap["entertainment"]._id,
      author: reporter._id,
      tags: [tagMap["bollywood"]._id],
      featuredImage: {
        url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
        caption: "सिनेमाहॉल में दर्शकों का उमड़ा जनसैलाब।",
        alt: "सिनेमा हॉल",
      },
      content: `
        <p><strong>मुंबई:</strong> साल की सबसे बहुप्रतीक्षित एक्शन थ्रिलर फिल्म ने रिलीज होते ही बॉक्स ऑफिस पर तहलका मचा दिया है। फिल्म विश्लेषकों के मुताबिक फिल्म ने पहले ही दिन घरेलू बॉक्स ऑफिस पर 85 करोड़ रुपये से अधिक की ऐतिहासिक ओपनिंग दर्ज की है।</p>
        <p>शानदार विजुअल इफेक्ट्स, दमदार बैकग्राउंड स्कोर और मुख्य अभिनेता के अभिनय की हर तरफ तारीफ हो रही है।</p>
      `,
      excerpt: "धमाकेदार एक्शन और शानदार अभिनय के दम पर फिल्म ने दर्ज की अब तक की सबसे बड़ी ऐतिहासिक ओपनिंग।",
      status: "published",
      publishedAt: new Date(Date.now() - 3600000 * 16),
      isTrending: true,
      viewCount: 12400,
      readingTime: 2,
    },
    {
      title: "संयुक्त राष्ट्र सम्मेलन: जलवायु संकट पर दुनिया के शीर्ष देशों के बीच ऐतिहासिक समझौता",
      subtitle: "नवीकरणीय ऊर्जा में निवेश बढ़ाने और कार्बन उत्सर्जन में त्वरित कटौती पर बनी सहमति",
      slug: "un-climate-summit-historic-agreement",
      language: "hi",
      category: catMap["world"]._id,
      author: superAdmin._id,
      tags: [],
      featuredImage: {
        url: "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?auto=format&fit=crop&w=1200&q=80",
        caption: "संयुक्त राष्ट्र जलवायु सम्मेलन में उपस्थित विभिन्न देशों के राष्ट्राध्यक्ष।",
        alt: "संयुक्त राष्ट्र सम्मेलन",
      },
      content: `
        <p><strong>जिनेवा:</strong> लगातार बढ़ रहे वैश्विक तापमान और चरम मौसमी घटनाओं के बीच दुनिया के 190 से अधिक देशों ने ऐतिहासिक जलवायु समझौते पर हस्ताक्षर कर दिए हैं।</p>
        <p>इस समझौते के तहत विकासशील देशों को स्वच्छ ऊर्जा अपनाने के लिए अंतरराष्ट्रीय वित्तीय सहायता का विशेष फंड तैयार किया जाएगा।</p>
      `,
      excerpt: "पर्यावरण संरक्षण और हरित ऊर्जा के विस्तार को लेकर वैश्विक नेताओं ने एक स्वर में ऐतिहासिक कदम उठाया।",
      status: "published",
      publishedAt: new Date(Date.now() - 3600000 * 20),
      isTopStory: false,
      viewCount: 4210,
      readingTime: 2,
    },
    {
      title: "संपादकीय विचार: 21वीं सदी में भारतीय युवाओं की आकांक्षाएं और राष्ट्र निर्माण का दायित्व",
      subtitle: "इनोवेशन, स्टार्टअप संस्कृति और डिजिटल क्रांति ने बदली देश की तस्वीर",
      slug: "opinion-youth-aspirations-nation-building",
      language: "hi",
      category: catMap["opinion"]._id,
      author: superAdmin._id,
      tags: [],
      featuredImage: {
        url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
        caption: "स्टार्टअप हब में विचार-मंथन करते भारतीय युवा उद्यमी।",
        alt: "युवा उद्यमी",
      },
      content: `
        <p>आज का भारत एक ऐसे मोड़ पर खड़ा है जहाँ जनसांख्यिकीय लाभांश देश की सबसे बड़ी ताकत बन चुका है। हमारे टियर-2 और टियर-3 शहरों से निकल रहे युवा उद्यमी दुनिया भर में भारतीय प्रतिभा का परचम लहरा रहे हैं।</p>
        <p>शिक्षा, तकनीक और शोध के क्षेत्र में सही दिशा मिलने पर यह ऊर्जा भारत को एक विकसित राष्ट्र के रूप में स्थापित करने के लिए पर्याप्त है।</p>
      `,
      excerpt: "स्टार्टअप और नई सोच के साथ देश का युवा हर क्षेत्र में नए कीर्तिमान स्थापित कर रहा है।",
      status: "published",
      publishedAt: new Date(Date.now() - 3600000 * 24),
      viewCount: 3890,
      readingTime: 3,
    },
  ];

  const createdArticles = [];
  for (const art of sampleArticles) {
    const created = await Article.create(art);
    createdArticles.push(created);
  }

  // 6. Create Videos
  console.log("Creating video section items...");
  await Video.create([
    {
      title: "संसद भवन से ग्राउंड रिपोर्ट: क्या है नए आर्थिक सुधारों के मायने?",
      titleHi: "संसद भवन से ग्राउंड रिपोर्ट: क्या है नए आर्थिक सुधारों के मायने?",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=800&q=80",
      category: catMap["politics"]._id,
      duration: "04:15",
      isFeatured: true,
    },
    {
      title: "ISRO Satellite Launch: Watch high-definition onboard camera footage",
      titleHi: "इसरो रॉकेट लॉन्च: रॉकेट कैमरे से देखिए अंतरिक्ष का विहंगम दृश्य",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=80",
      category: catMap["india"]._id,
      duration: "03:40",
      isFeatured: true,
    },
    {
      title: "Cricket Special: Match analysis & key turning points of the final over",
      titleHi: "क्रिकेट स्पेशल: अंतिम ओवर का वो रोमांच जिसने बदला मैच का रुख",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=800&q=80",
      category: catMap["sports"]._id,
      duration: "05:12",
      isFeatured: false,
    },
  ]);

  // 7. Create Photo Galleries
  console.log("Creating photo galleries...");
  await PhotoGallery.create([
    {
      title: "Glimpses of Grand Festivities: How India Celebrated the Cultural Gala",
      titleHi: "तस्वीरों में देखिए: सांस्कृतिक महोत्सव की मनमोहक छटा और रंगारंग प्रस्तुतियां",
      slug: "glimpses-cultural-festivities-india",
      description: "Visual journey through folk arts, vibrant illuminations, and community joy.",
      coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
      category: catMap["entertainment"]._id,
      photos: [
        { url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80", caption: "उद्घाटन संध्या पर भव्य संगीत संध्या।" },
        { url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1000&q=80", caption: "पारंपरिक लोकनृत्य की प्रस्तुति देते कलाकार।" },
        { url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80", caption: "रोशनी से जगमगाता ऐतिहासिक स्मारक।" },
      ],
    },
  ]);

  // 8. Create Live Blog
  console.log("Creating sample live blog...");
  await LiveBlog.create({
    title: "LIVE Updates: Union Budget Preparation and Economic Council Meeting",
    titleHi: "लाइव ब्लॉग: आर्थिक परिषद की उच्चस्तरीय बैठक और बजट पूर्व मंथन",
    slug: "live-budget-preparation-economic-council",
    status: "live",
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    category: catMap["business"]._id,
    entries: [
      {
        title: "बैठक संपन्न: वित्त मंत्री ने उद्योगपतियों के साथ साझा किए सकारात्मक संकेत",
        content: "तीन घंटे चली मैराथन बैठक के बाद वित्त मंत्रालय के अधिकारियों ने प्रेस को ब्रीफिंग दी। कर रियायतों और विनिर्माण क्षेत्र को विशेष पैकेज मिलने की संभावना।",
        timestamp: new Date(),
        authorName: "राजेश शर्मा",
      },
      {
        title: "इन्फ्रास्ट्रक्चर सेक्टर को लेकर अहम चर्चा शुरू",
        content: "सड़क, रेलवे और बंदरगाहों के आधुनिकीकरण पर आवंटन 20% तक बढ़ाने की सिफारिश की गई है।",
        timestamp: new Date(Date.now() - 1800000),
        authorName: "प्रिया वर्मा",
      },
    ],
  });

  // 9. Create Static Pages
  console.log("Creating static informational pages...");
  await Page.create([
    {
      title: "About Us",
      titleHi: "हमारे बारे में",
      slug: "about",
      content: `
        <h2>About Swar Media</h2>
        <p>Swar Media is India's premier bilingual digital news portal committed to high-quality, impartial, and courageous journalism. Founded with a vision to deliver unbiased reporting across politics, governance, economics, sports, culture, and science, our newsroom operates around the clock to inform, empower, and enlighten millions of readers in Hindi and English.</p>
        <p>Our commitment remains steadfast: Voice of Truth & Integrity.</p>
      `,
      contentHi: `
        <h2>स्वर मीडिया के बारे में</h2>
        <p>स्वर मीडिया देश का प्रतिष्ठित द्विभाषी डिजिटल समाचार मंच है जो निष्पक्ष, साहसिक और जनसरोकार से जुड़ी पत्रकारिता के लिए समर्पित है। हमारा संकल्प है कि बिना किसी पूर्वाग्रह के हर नागरिक तक सटीक तथ्य और बेबाक विश्लेषण पहुंचे।</p>
        <p>हमारा ध्येय वाक्य: सत्य, सुर और सरोकार।</p>
      `,
    },
    {
      title: "Privacy Policy",
      titleHi: "गोपनीयता नीति",
      slug: "privacy-policy",
      content: `
        <h2>Privacy Policy</h2>
        <p>At Swar Media, we value and respect your privacy. We collect minimal personal information necessary to deliver content, personalize your experience, and provide newsletter updates. We never sell your personal information to third parties.</p>
      `,
      contentHi: `
        <h2>गोपनीयता नीति</h2>
        <p>स्वर मीडिया आपकी निजता का पूर्ण सम्मान करता है। हम केवल वही जानकारी एकत्र करते हैं जो आपके अनुभव को बेहतर बनाने और समाचार बुलेटिन प्रेषित करने के लिए आवश्यक है।</p>
      `,
    },
    {
      title: "Terms of Service",
      titleHi: "नियम और शर्तें",
      slug: "terms",
      content: `
        <h2>Terms & Conditions</h2>
        <p>By accessing Swar Media, you agree to comply with our community standards and digital terms of service. All editorial content is protected under Indian intellectual property laws.</p>
      `,
      contentHi: `
        <h2>नियम और शर्तें</h2>
        <p>स्वर मीडिया का उपयोग करते समय सभी पाठकों और उपयोगकर्ताओं से अपेक्षा की जाती है कि वे डिजिटल आचार संहिता और बौद्धिक संपदा अधिकारों का सम्मान करें।</p>
      `,
    },
    {
      title: "Contact Us",
      titleHi: "संपर्क करें",
      slug: "contact",
      content: `
        <h2>Contact Editorial Desk</h2>
        <p>For news tips, press releases, editorial feedback, or general inquiries, write to contact@swarmedia.in or visit our headquarters in New Delhi.</p>
      `,
      contentHi: `
        <h2>संपादकीय डेस्क से संपर्क करें</h2>
        <p>समाचार सुझाव, प्रेस विज्ञप्ति अथवा प्रतिक्रिया के लिए contact@swarmedia.in पर संपर्क करें।</p>
      `,
    },
    {
      title: "Advertise With Us",
      titleHi: "विज्ञापन दें",
      slug: "advertise",
      content: `
        <h2>Advertise With Swar Media</h2>
        <p>Reach over 5 million educated, engaged readers monthly through native content, display banners, video sponsorships, and newsletter integrations. Contact ads@swarmedia.in for our media kit.</p>
      `,
      contentHi: `
        <h2>स्वर मीडिया पर विज्ञापन दें</h2>
        <p>लाखों जागरूक पाठकों तक अपने ब्रांड का संदेश पहुंचाएं। हमारे डिजिटल एड नेटवर्क से जुड़ने के लिए ads@swarmedia.in पर ईमेल करें।</p>
      `,
    },
  ]);

  // 10. Create Default Ads
  console.log("Creating default sample ads...");
  await Ad.create([
    {
      name: "Header Leaderboard Banner",
      slot: "header",
      type: "image",
      imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80",
      targetUrl: "https://swarmedia.in",
      isActive: true,
    },
    {
      name: "Sidebar Premium Sponsor",
      slot: "sidebar",
      type: "image",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
      targetUrl: "https://swarmedia.in",
      isActive: true,
    },
  ]);

  // 11. Create Site Settings
  console.log("Creating default site settings...");
  await Setting.create({
    siteName: "Swar Media",
    siteNameHi: "स्वर मीडिया",
    tagLine: "Voice of Truth & Integrity",
    tagLineHi: "सत्य, सुर और सरोकार",
    contactEmail: "contact@swarmedia.in",
    contactPhone: "+91 11 2345 6789",
    leadStoryIds: createdArticles.slice(0, 5).map((a) => a._id),
    socialLinks: {
      facebook: "https://facebook.com/swarmedia",
      twitter: "https://x.com/swarmedia",
      youtube: "https://youtube.com/swarmedia",
      instagram: "https://instagram.com/swarmedia",
      telegram: "https://t.me/swarmedia",
      whatsapp: "https://whatsapp.com/channel/swarmedia",
    },
  });

  console.log("=== Database Seed Complete Successfully! ===");
  console.log("Super Admin Account: admin@swarmedia.in / AdminPassword123!");
  if (exitOnComplete) {
    process.exit(0);
  }
}

if (require.main === module) {
  seed(true).catch((err) => {
    console.error("Seeding failed with error:", err);
    process.exit(1);
  });
}

module.exports = { seed };
