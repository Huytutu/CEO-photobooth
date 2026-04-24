import find_slots
import statistics

frames = ['Frames/Basic.png', 'Frames/HoLive.png', 'Frames/HolaRadio.png']
for frame in frames:
    try:
        regions = find_slots.find_transparent_slots(frame)
        if not regions:
            print(f'No slots found for {frame}')
            continue
        widths = [r['width'] for r in regions]
        heights = [r['height'] for r in regions]
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
        print(f"Error for {frame}: {e}")
