import scrapy


class QuoteSpider(scrapy.Spider):
    name = "quote"
    allowed_domains = ["phimmoichillzz.com"]
    start_urls = ["https://phimmoichillzz.com"]

    def parse(self, response):
        movies = response.xpath("//div[contains(@class, 'group/movie-featured')]")
        
        for movie in movies:
            yield {
                "title": movie.xpath(".//div[contains(@class, 'font-bold')]/text()").get(),
                "description": movie.xpath(".//div[contains(@class, 'text-shadow') and contains(@class, 'text-sm')]/text()").get(),
                "poster": movie.xpath(".//div[contains(@class, 'absolute bottom-0 left-2')]//img/@src").get(),
                "background": movie.xpath(".//img[contains(@class, 'absolute left-0 top-0')]/@src").get(),
            }
