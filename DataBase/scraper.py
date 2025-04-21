import os
import json
import csv
import requests
import hashlib
import re
from bs4 import BeautifulSoup
from PIL import Image
import io

API_KEY = "AIzaSyAXigAFsUQKJ0vkyrGlCxmz_43l0XUyUlQ"  # Thay bằng API Key của bạn
CX = "954606781420b4598"  # Thay bằng Custom Search Engine ID
CACHE_FILE = "cache.json"
IMAGE_JSON_FILE = "image_data.json"  # File lưu thông tin ảnh

class Scraper:
    def __init__(self, search_query, num_results=10, output_dir="output"):
        self.search_query = search_query
        self.num_results = num_results
        self.output_dir = output_dir
        self.urls = []
        self.cache = self.load_cache()
        self.image_data = self.load_image_data()

        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(f"{self.output_dir}/images", exist_ok=True)

    def load_cache(self):
        """Tải cache từ file JSON"""
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def save_cache(self):
        """Lưu cache vào file JSON"""
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(self.cache, f, ensure_ascii=False, indent=4)

    def load_image_data(self):
        """Tải dữ liệu ảnh từ file JSON"""
        if os.path.exists(IMAGE_JSON_FILE):
            with open(IMAGE_JSON_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def save_image_data(self):
        """Lưu dữ liệu ảnh vào file JSON"""
        with open(IMAGE_JSON_FILE, "w", encoding="utf-8") as f:
            json.dump(self.image_data, f, ensure_ascii=False, indent=4)

    def get_search_results(self):
        """Lấy danh sách URL từ Google Custom Search API và bỏ qua URL đã có trong cache."""
        print(f"🔍 Đang tìm kiếm: {self.search_query}")

        new_urls = []
        start = 1  # Bắt đầu từ trang đầu tiên

        while len(new_urls) < self.num_results:
            url = (
                f"https://www.googleapis.com/customsearch/v1"
                f"?q={self.search_query}&key={API_KEY}&cx={CX}"
                f"&num=10&start={start}"
            )

            try:
                response = requests.get(url)
                data = response.json()
                urls = [item['link'] for item in data.get("items", [])]

                # Lọc URL chưa có trong cache
                for u in urls:
                    if u not in self.cache:
                        new_urls.append(u)
                    if len(new_urls) >= self.num_results:
                        break  # Đủ số lượng cần crawl

                start += 10  # Lấy trang tiếp theo nếu cần

                if not urls:  # Nếu API không trả về thêm kết quả, dừng vòng lặp
                    break

            except Exception as e:
                print(f"❌ Lỗi khi gọi API: {e}")
                break

        self.urls = new_urls
        return self.urls

    def scrape_page(self, url):
        """Lấy dữ liệu từ trang web nếu chưa có trong cache"""
        if url in self.cache:
            print(f"✅ Đã có trong cache: {url}")
            return self.cache[url]

        try:
            response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
            soup = BeautifulSoup(response.text, "html.parser")

            title = soup.title.text if soup.title else "No title"
            paragraphs = [p.text.strip() for p in soup.find_all("p") if p.text.strip()]
            content = "\n".join(paragraphs)

            page_data = {"url": url, "title": title, "content": content}
            self.cache[url] = page_data
            self.save_cache()
            return page_data

        except Exception as e:
            print(f"❌ Lỗi khi lấy dữ liệu từ {url}: {e}")
            return None

    def is_medical_imaging(self, img_url, alt_text, filename):
        """Kiểm tra xem ảnh có phải là hình ảnh y tế như CT, MRI, X-ray không"""
        # Kiểm tra URL và alt text
        medical_terms = ['ct scan', 'ct-scan', 'x-ray', 'xray', 'x ray', 'mri', 'ultrasound', 'radiograph', 
                          'radiology', 'medical imaging', 'magnetic resonance', 'scan result']
        
        url_lower = img_url.lower()
        alt_lower = alt_text.lower() if alt_text else ""
        
        for term in medical_terms:
            if term in url_lower or term in alt_lower:
                return True
        
        try:
            # Mở ảnh để phân tích thêm
            img = Image.open(filename)
            # Ảnh X-ray, CT, MRI thường có màu xám/đen trắng và độ tương phản cao
            if img.mode == 'L':  # Grayscale image
                return True
                
            # Kiểm tra thêm đặc điểm của ảnh y tế
            if img.mode in ('RGB', 'RGBA'):
                # Convert to grayscale
                gray = img.convert('L')
                histogram = gray.histogram()
                
                # Tính toán độ tương phản
                min_val = min(i for i, count in enumerate(histogram) if count > 0)
                max_val = max(i for i, count in enumerate(histogram) if count > 0)
                contrast = max_val - min_val
                
                # Hình ảnh y tế thường có độ tương phản cao và phân bố tone màu đặc trưng
                if contrast > 200 and sum(histogram[0:50]) > sum(histogram[200:256]):
                    return True
        except Exception:
            pass  # Nếu không mở được ảnh, bỏ qua phần này
            
        return False

    def is_logo_icon_or_meme(self, img_url, width, height, alt_text):
        """Kiểm tra xem ảnh có phải là logo, icon hoặc meme không"""
        # Logo và icon thường có kích thước nhỏ hoặc vuông
        if width and height:
            if width < 100 or height < 100:
                return True
            
            # Logo thường có tỷ lệ gần vuông
            aspect_ratio = width / height if height != 0 else 0
            if 0.8 <= aspect_ratio <= 1.2:
                # Có khả năng là logo
                pass
        
        # Kiểm tra URL và alt text
        url_lower = img_url.lower()
        alt_lower = alt_text.lower() if alt_text else ""
        
        # Các từ khóa gợi ý là logo, icon, meme
        logo_terms = ['logo', 'icon', 'symbol', 'meme', 'button', 'badge', 'emoji']
        for term in logo_terms:
            if term in url_lower or term in alt_lower:
                return True
        
        # Kiểm tra các đường dẫn thường chứa logo/icon
        if any(x in url_lower for x in ['/logo', '/icon', '/assets', '/static', '/images/site']):
            return True
            
        return False

    def is_real_mouth_photo(self, img, alt_text):
        """Kiểm tra xem ảnh có phải là ảnh thật chụp miệng bằng máy ảnh không"""
        try:
            if not img:
                return False
                
            # Kiểm tra kích thước ảnh - ảnh thực tế thường có kích thước lớn hơn
            width, height = img.size
            if width < 200 or height < 200:
                return False
                
            # Kiểm tra alt text có liên quan đến miệng, môi, hoặc ung thư môi
            if alt_text:
                alt_lower = alt_text.lower()
                mouth_terms = ['mouth', 'lip', 'oral', 'tongue', 'teeth', 'cancer', 'sore', 'lesion', 'ulcer']
                if any(term in alt_lower for term in mouth_terms):
                    return True
                    
            # Kiểm tra đặc điểm màu sắc phổ biến của ảnh miệng thực tế
            # Ảnh môi/miệng thường có tông màu da, đỏ, hồng
            if img.mode in ('RGB', 'RGBA'):
                # Lấy mẫu pixel để kiểm tra màu da, màu đỏ (môi)
                pixels = img.resize((10, 10)).getdata()  # Lấy mẫu nhỏ để phân tích
                skin_tone_count = 0
                red_tone_count = 0
                
                for r, g, b, *_ in pixels:
                    # Kiểm tra màu da
                    if (r > 180 and g > 140 and b > 100) and (r > g > b):
                        skin_tone_count += 1
                    # Kiểm tra màu đỏ/hồng của môi
                    if (r > 150 and g < 120 and b < 120) or (r > 200 and g > 100 and b > 100 and r > g and r > b):
                        red_tone_count += 1
                
                # Nếu có đủ pixel màu da và màu đỏ, có khả năng là ảnh miệng thực
                if skin_tone_count > 20 or red_tone_count > 20:
                    return True
                    
            return False
                
        except Exception as e:
            print(f"Lỗi khi phân tích ảnh: {e}")
            return False

    def analyze_image(self, img_data):
        """Phân tích ảnh để xác định nó là loại gì"""
        try:
            img = Image.open(io.BytesIO(img_data))
            return img
        except Exception:
            return None

    def download_images(self, url):
        """Tải ảnh từ trang nhưng chỉ giữ lại ảnh miệng thực tế, loại bỏ CT/MRI/X-ray, logo, icon, meme"""
        try:
            response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
            soup = BeautifulSoup(response.text, "html.parser")

            img_tags = soup.find_all("img")
            img_data_list = []  # Lưu danh sách ảnh để lưu vào JSON
            saved_count = 0

            for img in img_tags:
                if "src" not in img.attrs:
                    continue

                img_url = img["src"]
                if img_url.startswith("//"):
                    img_url = "https:" + img_url

                if not img_url.startswith("http"):
                    continue  # Bỏ qua ảnh không có URL đầy đủ

                # Tạo tên file bằng hash của URL ảnh để tránh trùng lặp
                img_hash = hashlib.md5(img_url.encode()).hexdigest()
                img_name = f"{self.output_dir}/images/{img_hash}.jpg"
                temp_name = f"{self.output_dir}/images/temp_{img_hash}.jpg"

                # Lấy thông tin alt và title
                alt_text = img.get("alt", "")
                title_text = img.get("title", "")
                description = alt_text if alt_text else title_text

                # Kiểm tra kích thước từ thuộc tính
                width = int(img.get("width", 0)) if img.get("width", "").isdigit() else 0
                height = int(img.get("height", 0)) if img.get("height", "").isdigit() else 0

                # Tải ảnh để phân tích
                try:
                    img_response = requests.get(img_url, timeout=5)
                    if img_response.status_code != 200:
                        continue

                    img_content = img_response.content
                    analyzed_img = self.analyze_image(img_content)
                    
                    # Lấy kích thước thật nếu không có trong thuộc tính
                    if analyzed_img and (width == 0 or height == 0):
                        width, height = analyzed_img.size

                    # Loại bỏ ảnh CT, MRI, X-ray
                    if self.is_medical_imaging(img_url, description, temp_name):
                        print(f"🔬 Bỏ qua ảnh y tế (CT/MRI/X-ray): {img_url}")
                        continue

                    # Loại bỏ logo, icon, meme
                    if self.is_logo_icon_or_meme(img_url, width, height, description):
                        print(f"🔄 Bỏ qua logo/icon/meme: {img_url}")
                        continue

                    # Kiểm tra xem có phải ảnh miệng thực không
                    if not self.is_real_mouth_photo(analyzed_img, description):
                        print(f"❌ Không phải ảnh miệng: {img_url}")
                        continue
                    
                    # Kiểm tra nếu ảnh đã tồn tại thì bỏ qua
                    if os.path.exists(img_name):
                        print(f"⚡ Ảnh đã tồn tại: {img_name}")
                        continue

                    # Lưu ảnh phù hợp
                    with open(img_name, "wb") as f:
                        f.write(img_content)
                    
                    saved_count += 1
                    print(f"✅ Đã lưu ảnh miệng thực: {img_name}")

                    # Lưu metadata
                    img_data_list.append({
                        "url": img_url,
                        "filename": img_name,
                        "label": description or self.search_query,
                        "width": width,
                        "height": height
                    })

                except Exception as e:
                    print(f"⚠️ Lỗi khi xử lý ảnh {img_url}: {e}")
                    continue

            # Thêm vào dữ liệu ảnh chung
            self.image_data.extend(img_data_list)
            
            # Lưu metadata vào JSON
            with open(f"{self.output_dir}/image_metadata_{img_hash}.json", "w", encoding="utf-8") as f:
                json.dump(img_data_list, f, ensure_ascii=False, indent=4)

            print(f"📸 Đã tải {saved_count} ảnh miệng thực từ {url}")

        except Exception as e:
            print(f"⚠️ Lỗi khi tải ảnh từ {url}: {e}")

    def run(self):
        """Chạy toàn bộ quá trình"""
        self.get_search_results()

        print(f"📥 Đang thu thập dữ liệu từ {len(self.urls)} trang web...")
        results = [self.scrape_page(url) for url in self.urls if url]
        results = [r for r in results if r]  # Lọc kết quả hợp lệ

        for url in self.urls:
            self.download_images(url)

        self.save_image_data()  # Lưu dữ liệu ảnh vào file JSON
        print(f"🎯 Hoàn thành! Dữ liệu ảnh đã được lưu vào {IMAGE_JSON_FILE}")

if __name__ == "__main__":
    scraper = Scraper(search_query="Oral cavity cancer", num_results=10)
    scraper.run()
