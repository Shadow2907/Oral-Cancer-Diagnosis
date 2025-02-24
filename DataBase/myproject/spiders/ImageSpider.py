import scrapy


class ImagespiderSpider(scrapy.Spider):
    name = "ImageSpider"
    allowed_domains = ["oralcancerfoundation.org"]
    start_urls = ["http://oralcancerfoundation.org/dental/oral-cancer-images/"]

    def parse(self, response):
        imgs = response.xpath("//div[contains(@class, 'image-box')]")
        for img in imgs:
            urls = img.xpath(".//p[contains(@class, 'image')]//img/@src").getall()
            img_urls = [response.urljoin(url) for url in urls]  
            yield{
                "image_urls" : img_urls,
                "description" : img.xpath(".//p[not(@class)]//text()").getall(),
                "label" : img.xpath(".//h5/text()").getall(),
            }
 