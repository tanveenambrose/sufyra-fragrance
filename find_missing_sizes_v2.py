import os
import re

def find_images_without_sizes(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.jsx')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Match <Image ... />
                    # Use re.DOTALL to match across newlines
                    # match non-greedyly until /> or </Image>
                    matches = re.findall(r'<Image\b.*?(?:/>|</Image>)', content, re.DOTALL)
                    for img in matches:
                        if 'fill' in img and 'sizes=' not in img:
                            print(f"File: {path}")
                            print(f"Content:\n{img}\n")

if __name__ == "__main__":
    find_images_without_sizes('src')
