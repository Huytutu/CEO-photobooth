import sys
from PIL import Image
import statistics

def find_transparent_slots(image_path):
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    visited = set()
    regions = []
    
    for y in range(height):
        for x in range(width):
            if pixels[x, y][3] == 0 and (x, y) not in visited:
                # Flood fill
                queue = [(x, y)]
                visited.add((x, y))
                min_x = max_x = x
                min_y = max_y = y
                
                head = 0
                while head < len(queue):
                    cx, cy = queue[head]
                    head += 1
                    
                    min_x = min(min_x, cx)
                    max_x = max(max_x, cx)
                    min_y = min(min_y, cy)
                    max_y = max(max_y, cy)
                    
                    for dx, dy in [(0,1), (0,-1), (1,0), (-1,0)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < width and 0 <= ny < height:
                            if pixels[nx, ny][3] == 0 and (nx, ny) not in visited:
                                visited.add((nx, ny))
                                queue.append((nx, ny))
                                
                area = (max_x - min_x + 1) * (max_y - min_y + 1)
                if area > 10000: # large enough to be a photo slot
                    regions.append({
                        "x": min_x,
                        "y": min_y,
                        "width": max_x - min_x + 1,
                        "height": max_y - min_y + 1,
                        "area": area
                    })
                    
    regions.sort(key=lambda r: r['y'])
    return regions

for frame in ["Frames/HoLive.png", "Frames/HolaRadio.png"]:
    try:
        regions = find_transparent_slots(frame)
        if not regions:
            print(f"No slots found for {frame}")
            continue
        
        widths = [r["width"] for r in regions]
        heights = [r["height"] for r in regions]
        
        common_w = round(statistics.median(widths))
        common_h = round(statistics.median(heights))
        
        print(f'"./{frame}": {{')
        print(f'  "photoSize": {{ "width": {common_w}, "height": {common_h} }},')
        print(f'  "positions": [')
        for i, r in enumerate(regions):
            print(f'    {{ "x": {r["x"]}, "y": {r["y"]}, "centerX": false }}{"," if i < len(regions)-1 else ""}')
        print(f'  ]')
        print(f'}},')
    except Exception as e:
        print(f"Error processing {frame}: {e}")
