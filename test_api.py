import urllib.request
import urllib.parse
import json
import base64
import os

bag_dir = 'ai_dataset/bag'
image_path = None
for root, dirs, files in os.walk(bag_dir):
    for f in files:
        if f.lower().endswith(('.png', '.jpg', '.jpeg')):
            image_path = os.path.join(root, f)
            break
    if image_path:
        break

with open(image_path, "rb") as image_file:
    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    
base64_payload = f"data:image/jpeg;base64,{encoded_string}"

url = "http://127.0.0.1:8000/predict"
data = {
    "imageBase64": base64_payload,
    "descriptionHint": ""
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
response = urllib.request.urlopen(req)
print(response.getcode())
print(response.read().decode('utf-8'))
