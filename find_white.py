from PIL import Image

def find_white_boxes(img_path):
    img = Image.open(img_path).convert('RGB')
    w, h = img.size
    pixels = img.load()
    
    visited = set()
    regions = []
    
    for y in range(0, h, 20):
        for x in range(0, w, 20):
            if (x, y) not in visited and pixels[x, y] == (255, 255, 255):
                q = [(x, y)]
                visited.add((x, y))
                min_x = max_x = x
                min_y = max_y = y
                
                head = 0
                while head < len(q):
                    cx, cy = q[head]
                    head += 1
                    
                    min_x = min(min_x, cx)
                    max_x = max(max_x, cx)
                    min_y = min(min_y, cy)
                    max_y = max(max_y, cy)
                    
                    for dx, dy in [(0,10), (0,-10), (10,0), (-10,0)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < w and 0 <= ny < h:
                            if (nx, ny) not in visited and pixels[nx, ny] == (255, 255, 255):
                                visited.add((nx, ny))
                                q.append((nx, ny))
                
                area = (max_x - min_x) * (max_y - min_y)
                if area > 50000:
                    regions.append({'x': min_x, 'y': min_y, 'w': max_x - min_x, 'h': max_y - min_y, 'area': area})
                    
    regions.sort(key=lambda r: r['y'])
    print(f"{img_path}: {len(regions)} boxes")
    for r in regions:
        print(f"  Box: x={r['x']} y={r['y']} w={r['w']} h={r['h']}")

find_white_boxes("Frames/HoLive.png")
find_white_boxes("Frames/HolaRadio.png")
