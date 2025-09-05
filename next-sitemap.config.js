/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://anugrahachristianworld.in', // your site URL
  generateRobotsTxt: true, // this enables robots.txt
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' } // allow all search engines to crawl everything
    ],
    additionalSitemaps: [
      'https://anugrahachristianworld.in/sitemap.xml' // reference your sitemap
    ],
  },
};
