const mongoose = require('mongoose');
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kanika:kanika%40311@cluster0.n1p6n.mongodb.net/news_bharat?retryWrites=true&w=majority&appName=Cluster0';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const Article = require('../models/Article');
  const Category = require('../models/Category');
  const User = require('../models/User');

  const admin = await User.findOne();
  let stateCityCat = await Category.findOne({ slug: 'state-city' });
  if (!stateCityCat) {
    stateCityCat = await Category.create({ name: 'State City', nameHi: 'राज्य-शहर', slug: 'state-city', order: 1 });
  }

  const sampleNews = [
    {
      title: 'जम्मू-कश्मीर के मुख्यमंत्री उमर अब्दुल्ला ने की नई शुरुआत, पूर्व पत्रकार निधि राजदान संग रचाई शादी',
      slug: 'omar-abdullah-nidhi-razdan-wedding-kashmir',
      location: 'Jammu',
      category: stateCityCat._id,
      author: admin._id,
      excerpt: 'जम्मू-कश्मीर के मुख्यमंत्री उमर अब्दुल्ला ने निजी जिंदगी में एक नया कदम उठाया है। उन्होंने पूर्व पत्रकार निधि राजदान के साथ शादी कर ली है। सोशल मीडिया पर दोनों को बधाईयां मिल रही हैं...',
      featuredImage: {
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
        caption: 'उमर अब्दुल्ला और निधि राजदान'
      },
      content: '<p>जम्मू-कश्मीर के मुख्यमंत्री उमर अब्दुल्ला ने निजी जिंदगी में एक नया कदम उठाया है। उन्होंने पूर्व पत्रकार निधि राजदान के साथ शादी कर ली है।</p>',
      status: 'published',
      publishedAt: new Date(),
      readingTime: 3,
      viewCount: 148,
    },
    {
      title: 'सुल्तानपुर: जल जीवन मिशन के कर्मचारियों पर जानलेवा हमला, 13 नामजद समेत 23 पर FIR दर्ज',
      slug: 'sultanpur-jal-jeevan-mission-workers-attack-fir',
      location: 'Sultanpur',
      category: stateCityCat._id,
      author: admin._id,
      excerpt: 'उत्तर प्रदेश के सुल्तानपुर जिले में जल जीवन मिशन के तहत काम कर रहे कर्मचारियों पर दबंगों द्वारा हमला करने का मामला सामने आया है। गोसाईंगंज थाना क्षेत्र में पुलिस ने 13 नामजद समेत 23 पर केस दर्ज किया है...',
      featuredImage: {
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        caption: 'सुल्तानपुर पुलिस थाना'
      },
      content: '<p>उत्तर प्रदेश के सुल्तानपुर जिले में जल जीवन मिशन के तहत काम कर रहे कर्मचारियों पर दबंगों द्वारा हमला करने का मामला सामने आया है।</p>',
      status: 'published',
      publishedAt: new Date(Date.now() - 3600000),
      readingTime: 6,
      viewCount: 92,
    },
    {
      title: '23वीं मंजिल से गिरकर पति-बेटे की मौत के बाद अफसर पत्नी ने की आत्महत्या की कोशिश',
      slug: 'lucknow-high-rise-tragedy-officer-wife-suicide-attempt',
      location: 'Lucknow',
      category: stateCityCat._id,
      author: admin._id,
      excerpt: 'राजधानी लखनऊ के पॉश इलाके में स्थित बहुमंजिला इमारत की 23वीं मंजिल से गिरकर पिता-पुत्र की संदिग्ध परिस्थितियों में मौत हो गई। घटना के कुछ ही घंटों बाद सदमे में आई अफसर पत्नी ने भी आत्मघाती कदम उठाने का प्रयास किया...',
      featuredImage: {
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        caption: 'लखनऊ अपार्टमेंट'
      },
      content: '<p>राजधानी लखनऊ के पॉश इलाके में स्थित बहुमंजिला इमारत की 23वीं मंजिल से गिरकर पिता-पुत्र की मौत हो गई।</p>',
      status: 'published',
      publishedAt: new Date(Date.now() - 7200000),
      readingTime: 4,
      viewCount: 230,
    }
  ];

  for (const s of sampleNews) {
    const exists = await Article.findOne({ slug: s.slug });
    if (!exists) {
      await Article.create(s);
      console.log('Created sample news:', s.title.slice(0, 30));
    }
  }

  // Also assign location to existing articles if missing
  const defaultLocs = ['नई दिल्ली', 'मुंबई', 'संसद', 'बेंगलुरु', 'भोपाल', 'जयपुर', 'वाराणसी'];
  const allArts = await Article.find();
  for (let i = 0; i < allArts.length; i++) {
    if (!allArts[i].location) {
      allArts[i].location = defaultLocs[i % defaultLocs.length];
      await allArts[i].save();
    }
  }

  console.log('Sample news & locations populated successfully.');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
