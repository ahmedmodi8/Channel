const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

/**
 * دالة لجلب معلومات القنوات المباشرة من موقع معين.
 * يتم استخراج معلومات القناة مثل:
 * - id (إذا كانت موجودة في خاصية data-id، وإلا يتم توليدها بناءً على رقم الترتيب)
 * - اسم القناة
 * - رابط التشغيل (m3u8 أو m3u)
 * - رابط الصورة الخاصة بالقناة
 * - وصف القناة أو معلومات إضافية (اختياري)
 *
 * @param {string} url - رابط الموقع الذي يحتوي على معلومات القنوات.
 * @returns {Promise<Array<Object>>} - قائمة من الكائنات مع بيانات القنوات.
 */
async function fetchLiveChannels(url) {
  try {
    // جلب محتوى الصفحة باستخدام axios
    const response = await axios.get(url);
    const html = response.data;
    // تحميل الـ HTML باستخدام cheerio لتحليل الصفحة
    const $ = cheerio.load(html);
    
    const channels = [];
    
    // يفترض أن كل قناة موجودة داخل عنصر يحمل الكلاس "channel-item"
    $('.channel-item').each((index, element) => {
      // استخراج اسم القناة
      const name = $(element).find('.channel-name').text().trim();
      // استخراج رابط التشغيل (m3u8 أو m3u)
      const stream = $(element).find('.stream-link').attr('href');
      // استخراج رابط الصورة الخاصة بالقناة
      const image = $(element).find('img.channel-image').attr('src') || '';
      // استخراج وصف أو معلومات إضافية (اختياري)
      const description = $(element).find('.channel-description').text().trim() || '';
      
      // استخراج معرف القناة من خاصية data-id إذا كانت موجودة، وإلا توليد id بناءً على رقم الترتيب
      let id = $(element).attr('data-id');
      if (!id) {
        id = (index + 1).toString();
      }
      
      // التحقق من وجود المعلومات الأساسية قبل إضافتها
      if (name && stream) {
        channels.push({
          id,
          name,
          stream,
          image,
          description
        });
      }
    });
    
    return channels;
  } catch (error) {
    console.error("حدث خطأ أثناء جلب معلومات القنوات:", error);
    return [];
  }
}

(async () => {
  // قم بتعديل الرابط أدناه للرابط الفعلي الذي يحتوي على القنوات المباشرة
  const targetUrl = 'https://example.com/live-channels';
  const channels = await fetchLiveChannels(targetUrl);
  
  // كتابة البيانات إلى ملف channels.json مع تنسيق جميل (indentation)
  const outputFile = 'channels.json';
  fs.writeFileSync(outputFile, JSON.stringify(channels, null, 2), 'utf-8');
  
  console.log(`تم إنشاء الملف ${outputFile} بنجاح.`);
})();
