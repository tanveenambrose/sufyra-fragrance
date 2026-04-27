import os
import re

def find_images_without_sizes(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.jsx')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Find all <Image ... /> or <Image ... >...</Image>
                    # This is a bit rough but should work for identifying missing sizes
                    images = re.finditer(r'<Image\b[^>]*?>', content, re.DOTALL)
                    for match in images:
                        img_tag = match.group(0)
                        if 'fill' in img_tag and 'sizes=' not in img_tag:
                            print(f"Missing sizes in {path}:")
                            print(f"  {img_tag}")

if __name__ == "__main__":
    find_images_without_sizes('src')
