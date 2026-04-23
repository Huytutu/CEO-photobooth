from PIL import Image
import collections

def find_boxes(image_path):
    img = Image.open(image_path).convert("RGB")
    width, height = img.size
    pixels = img.load()
    
    # Sample colors to find the background color of the slots
    # We look for colors that form large rectangular blocks.
    # To do this fast, we can look at rows and columns.
    
    # Or just use a simple flood fill on scaled down image
    small_img = img.resize((width // 10, height // 10), Image.NEAREST)
    s_width, s_height = small_img.size
    s_pixels = small_img.load()
    
    color_counts = collections.Counter()
    for y in range(s_height):
        for x in range(s_width):
            color_counts[s_pixels[x,y]] += 1
            
    # The slot color might be one of the most common colors
    # Let's print top 5 colors
    print(f"--- {image_path} ---")
    print(f"Size: {width}x{height}")
    for color, count in color_counts.most_common(5):
        print(f"Color {color}: roughly {count * 100} pixels")

for frame in ["Frames/HoLive.png", "Frames/HolaRadio.png", "Frames/Frame4.png"]:
    find_boxes(frame)
