import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import os
import json

# Setup
device = torch.device("cpu")
with open('class_names.json', 'r') as f:
    class_names = json.load(f)

model = models.mobilenet_v2(weights=None)
num_ftrs = model.classifier[1].in_features
model.classifier = nn.Sequential(
    nn.Dropout(p=0.2),
    nn.Linear(num_ftrs, len(class_names))
)
model.load_state_dict(torch.load('campus_vision_model.pth', map_location=device))
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# Find a bag image
bag_dir = 'ai_dataset/bag'
# since images are in subdirectories sometimes, let's just find any file
image_path = None
for root, dirs, files in os.walk(bag_dir):
    for f in files:
        if f.lower().endswith(('.png', '.jpg', '.jpeg')):
            image_path = os.path.join(root, f)
            break
    if image_path:
        break

if not image_path:
    print("No bag image found.")
    exit()

print(f"Testing on {image_path}")
image = Image.open(image_path).convert('RGB')
input_tensor = transform(image).unsqueeze(0)

with torch.no_grad():
    output = model(input_tensor)
    probs = torch.nn.functional.softmax(output[0], dim=0)
    
print("Probabilities:")
for i, c in enumerate(class_names):
    print(f"{c}: {probs[i].item():.4f}")
